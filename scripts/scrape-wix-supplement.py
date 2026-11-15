#!/usr/bin/env python3
"""Bounded terminal-only source refresh; preserve the initial audit and skip known URLs.

Run from the task worktree. Raw responses stay ignored; the separate report records
new assets, source pointers and hashes. Does not migrate or approve site content.
"""
import hashlib
import html
import json
import pathlib
import re
import urllib.error
import urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from urllib.parse import urlsplit

ROOT = pathlib.Path(__file__).resolve().parents[1]
REPORT = ROOT / 'docs/terminal-asset-audit.json'
CACHE = ROOT / '.audit-cache/terminal-assets'
MEDIA = ROOT / 'source-assets/wix'
BASE = 'https://laurenlikestopaint.wixsite.com/mysite'
ASSET = re.compile(r'https://(?:static\.wixstatic\.com/media|video\.wixstatic\.com/video|static\.wixstatic\.com/shapes)/[^\s"<>\\]+')
URI = re.compile(r'6f8b7b_[\w~.-]+\.(?:jpg|jpeg|png|webp|gif|avif|svg|pdf)$', re.I)


def read(path):
    return json.loads(path.read_text())


def walk(value, pointer=''):
    yield pointer, value
    if isinstance(value, dict):
        for key, child in value.items():
            yield from walk(child, pointer + '/' + str(key).replace('~', '~0').replace('/', '~1'))
    elif isinstance(value, list):
        for i, child in enumerate(value):
            yield from walk(child, pointer + '/' + str(i))


class Source(HTMLParser):
    def __init__(self):
        super().__init__()
        self.scripts = {}
        self.script = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'script':
            self.script = attrs.get('id')
            if self.script:
                self.scripts[self.script] = ''

    def handle_endtag(self, tag):
        if tag == 'script':
            self.script = None

    def handle_data(self, data):
        if self.script:
            self.scripts[self.script] += data


def fetch(url, use_cache=False):
    key = hashlib.sha256(url.encode()).hexdigest()
    cached = CACHE / key
    if use_cache and cached.exists():
        return cached.read_bytes(), '', '.audit-cache/terminal-assets/' + key
    with urllib.request.urlopen(url, timeout=45) as response:
        body = response.read()
        ctype = response.headers.get('Content-Type', '')
    key = hashlib.sha256(url.encode()).hexdigest()
    (CACHE / key).write_bytes(body)
    return body, ctype, '.audit-cache/terminal-assets/' + key


def main():
    if REPORT.exists():
        raise SystemExit('Report exists; preserve this run rather than overwrite its evidence.')
    CACHE.mkdir(parents=True, exist_ok=True)
    MEDIA.mkdir(parents=True, exist_ok=True)
    initial = read(ROOT / 'docs/audit/assets.json')
    ledger = read(ROOT / 'docs/source-media-review.json')
    known = {a['url']: a for a in initial + ledger['supplemental_downloads'] + ledger['recovery_followup']['candidate_attempts']}
    before = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in MEDIA.iterdir() if p.is_file()}
    report = {'checked_at_utc': datetime.now(timezone.utc).isoformat(), 'method': 'Python urllib HTTP only; no browser, login, invented detail routes or known-URL retries.', 'publication_approved': False, 'pages': [], 'assets': []}
    candidates = {}
    endpoints_seen = set()

    def inspect(value, page, source):
        for pointer, text in walk(value):
            if not isinstance(text, str):
                continue
            urls = ASSET.findall(html.unescape(text).replace('\\/', '/'))
            # Renderer media URIs use this standard public media prefix.
            if URI.fullmatch(text):
                urls.append('https://static.wixstatic.com/media/' + text)
            for url in urls:
                url = url.split('/v1/')[0].split('?')[0].rstrip('),;')
                # Only actual media extensions; never download app scripts/fonts.
                if not re.search(r'\.(jpg|jpeg|png|webp|gif|avif|svg|pdf|mp4)$', url, re.I):
                    continue
                candidates.setdefault(url, []).append({'page': page, 'evidence': source, 'pointer': pointer})

    try:
        for old in read(ROOT / 'docs/audit/pages.json'):
            url = old['url']
            if old['status'] != 'fetched' or not (url == BASE or url.startswith(BASE + '/')):
                continue
            entry = {'url': url, 'renderer_responses': []}
            report['pages'].append(entry)
            try:
                body, _, cache = fetch(url, use_cache=True)
                entry.update(status='fetched', bytes=len(body), sha256=hashlib.sha256(body).hexdigest(), cache=cache)
                text = body.decode('utf-8')
                inspect(text, url, cache)
                parser = Source()
                parser.feed(text)
                for name in ('wix-warmup-data',):
                    if name in parser.scripts:
                        inspect(json.loads(parser.scripts[name]), url, cache + '#' + name)
                # Use only renderer endpoints explicitly present in this public page.
                for endpoint in dict.fromkeys(re.findall(r'https://siteassets\.parastorage\.com[^"\s<>]+', text)):
                    endpoint = endpoint.replace('&amp;', '&')
                    if endpoint in endpoints_seen:
                        continue
                    endpoints_seen.add(endpoint)
                    result = {}
                    entry['renderer_responses'].append(result)
                    try:
                        data, _, saved = fetch(endpoint, use_cache=True)
                        result.update(status='fetched', cache=saved, sha256=hashlib.sha256(data).hexdigest())
                        inspect(json.loads(data), url, saved)
                    except (urllib.error.URLError, ValueError, TimeoutError) as error:
                        result.update(status='failed', error=str(error))
                print(url.removeprefix(BASE) or '/', entry['status'], flush=True)
            except (urllib.error.URLError, ValueError, TimeoutError) as error:
                entry.update(status='failed', error=str(error))
                print(url, 'failed', flush=True)
        report['referenced_unique_media_urls'] = len(candidates)
        report['known_urls_skipped'] = len(candidates.keys() & known.keys())
        for url, occurrences in sorted(candidates.items()):
            if url in known:
                continue
            asset = {'url': url, 'occurrences': occurrences, 'rights': 'unreviewed', 'publication_approved': False}
            report['assets'].append(asset)
            parsed = urlsplit(url)
            name = parsed.path.rsplit('/', 1)[-1]
            if parsed.hostname == 'video.wixstatic.com':
                name = parsed.path.removeprefix('/video/').replace('/', '-')
            dest = MEDIA / name
            try:
                if dest.exists():
                    raise ValueError('Existing unmanifested file; refusing to overwrite or assume identity')
                data, ctype, _ = fetch(url)
                if not (ctype.startswith(('image/', 'video/')) or ctype.startswith('application/pdf')):
                    raise ValueError('Unexpected media content type: ' + ctype)
                with dest.open('xb') as stream:
                    stream.write(data)
                asset.update(status='downloaded', local_path=str(dest.relative_to(ROOT)), bytes=len(data), sha256=hashlib.sha256(data).hexdigest(), content_type=ctype)
                print('New asset:', name, len(data), flush=True)
            except (urllib.error.URLError, ValueError, TimeoutError) as error:
                asset.update(status='failed', error=str(error))
        report['existing_archive_files_verified'] = len(before)
        report['existing_archive_unchanged'] = all((MEDIA / name).is_file() and hashlib.sha256((MEDIA / name).read_bytes()).hexdigest() == digest for name, digest in before.items())
        if not report['existing_archive_unchanged']:
            raise RuntimeError('Existing archive changed during scrape')
    finally:
        REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    failures = sum(p['status'] == 'failed' or any(r['status'] == 'failed' for r in p['renderer_responses']) for p in report['pages'])
    print('New URLs:', len(report['assets']), 'Downloaded:', sum(a['status'] == 'downloaded' for a in report['assets']), 'Page/renderer failures:', failures)
    if failures or any(a['status'] == 'failed' for a in report['assets']):
        raise SystemExit(1)


if __name__ == '__main__':
    main()
