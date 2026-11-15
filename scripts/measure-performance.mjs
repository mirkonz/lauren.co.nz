import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const origin = new URL(process.argv[2] ?? 'http://127.0.0.1:4322');
assert(origin.protocol === 'http:' && origin.hostname === '127.0.0.1' && origin.pathname === '/' && !origin.search && !origin.hash && !origin.username && !origin.password,
  'Performance samples require an explicit loopback HTTP origin.');
const rootResponse = await fetch(origin);
assert(rootResponse.ok, 'Start the production preview first.');
assert.equal(await rootResponse.text(), await readFile(new URL('../dist/index.html', import.meta.url), 'utf8'),
  'Preview must serve the current dist, not the development server.');
const routes = ['/', '/film/', '/art/', '/film/projects/blade-runner-2049/', '/art/collections/artificial-landscapes/', '/art/collections/oil-painting-landscapes/'];
const profiles = [{ name: 'mobile', width: 390, height: 844 }, { name: 'desktop', width: 1440, height: 900 }];
const conditions = { urlPattern: '', latency: 150, downloadThroughput: 200_000, uploadThroughput: 93_750, offline: false };
const browser = await chromium.launch({ headless: true });
const report = {
  created: new Date().toISOString(), browser: browser.version(), node: process.version,
  platform: process.platform, origin: origin.origin, conditions, cpuSlowdown: 4,
  deviceScaleFactor: 1, repetitions: 3, observationAfterLoadMs: 1000,
  budgets: { lcpMs: 2500, cls: 0.1 },
  scope: 'Initial viewport only; fresh browser contexts and disabled HTTP cache. Local warm OS/server caches. No CDN, TLS, field traffic, scrolling, interaction/INP or final-image qualification.',
  complete: false, samples: [],
};
const output = new URL('../.audit-cache/performance/current.json', import.meta.url);
await mkdir(new URL('.', output), { recursive: true });
try {
  for (const profile of profiles) {
    for (const path of routes) {
      for (let run = 1; run <= report.repetitions; run++) {
        const context = await browser.newContext({ viewport: { width: profile.width, height: profile.height }, deviceScaleFactor: 1, isMobile: profile.name === 'mobile', serviceWorkers: 'block' });
        try {
          const page = await context.newPage();
          const errors = [];
          await page.route('**/*', async (route) => {
            if (new URL(route.request().url()).origin !== origin.origin) {
              errors.push('External request blocked: ' + route.request().url());
              await route.abort();
            } else await route.continue();
          });
          page.on('pageerror', (error) => errors.push(error.message));
          page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`); });
          page.on('requestfailed', (request) => errors.push(`${request.failure()?.errorText}: ${request.url()}`));
          const cdp = await context.newCDPSession(page);
          await cdp.send('Network.enable');
          await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
          const applied = await cdp.send('Network.emulateNetworkConditionsByRule', { matchedNetworkConditions: [conditions] });
          assert.equal(applied.ruleIds.length, 1, 'Network throttling was not installed.');
          await cdp.send('Emulation.setCPUThrottlingRate', { rate: report.cpuSlowdown });
          await page.addInitScript(() => {
            const result = { lcpMs: 0, cls: 0, lcpElement: '', supported: PerformanceObserver.supportedEntryTypes };
            window.__portfolioPerformance = result;
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                result.lcpMs = entry.startTime;
                result.lcpElement = entry.element?.tagName ?? '';
              }
            }).observe({ type: 'largest-contentful-paint', buffered: true });
            let sessionStart = 0, previous = 0, sessionScore = 0;
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.hadRecentInput) continue;
                if (sessionScore && entry.startTime - previous < 1000 && entry.startTime - sessionStart < 5000) sessionScore += entry.value;
                else { sessionStart = entry.startTime; sessionScore = entry.value; }
                previous = entry.startTime;
                result.cls = Math.max(result.cls, sessionScore);
              }
            }).observe({ type: 'layout-shift', buffered: true });
          });
          const response = await page.goto(new URL(path, origin).href, { waitUntil: 'load', timeout: 30_000 });
          assert.equal(response?.status(), 200, `Missing production route: ${path}`);
          await page.waitForTimeout(report.observationAfterLoadMs);
          const metrics = await page.evaluate(() => window.__portfolioPerformance);
          assert(metrics.supported.includes('largest-contentful-paint') && metrics.supported.includes('layout-shift'), 'Browser lacks required performance observations.');
          assert(metrics.lcpMs > 0, `No LCP observation: ${path}`);
          const sample = { profile: profile.name, viewport: { width: profile.width, height: profile.height }, path, run,
            lcpMs: metrics.lcpMs, cls: metrics.cls, lcpElement: metrics.lcpElement, errors,
            passed: metrics.lcpMs <= report.budgets.lcpMs && metrics.cls <= report.budgets.cls && errors.length === 0 };
          report.samples.push(sample);
          await writeFile(output, JSON.stringify(report, null, 2) + '\n');
          console.log(`${sample.profile} ${path} #${run}: LCP ${sample.lcpMs.toFixed(0)} ms, CLS ${sample.cls.toFixed(4)} ${sample.passed ? 'PASS' : 'FAIL'}`);
        } finally { await context.close(); }
      }
    }
  }
  report.complete = true;
  await writeFile(output, JSON.stringify(report, null, 2) + '\n');
  assert(report.samples.every((sample) => sample.passed), 'Performance budget or request failures; inspect .audit-cache/performance/current.json.');
} finally { await browser.close(); }
