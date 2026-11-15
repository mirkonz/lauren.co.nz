import type { Meta, StoryObj } from '@storybook/html-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import html from '../.storybook/generated/site/__enquiry-fixture/index.html?raw';
import similar from '../.storybook/generated/site/__enquiry-similar/index.html?raw';
import commission from '../.storybook/generated/site/__enquiry-commission/index.html?raw';
import disabled from '../.storybook/generated/site/__enquiry-disabled/index.html?raw';
import { enhanceEnquiryForm } from '../src/lib/enquiry-form';
import { checkPage, renderPage, disposeRenderedPage } from './render-page';

type Outcome = 'success' | 'failure' | 'malformed' | 'network' | 'timeout' | 'deferred' | 'rejected';
interface Args { outcome: Outcome; enabled: boolean; kind: 'purchase' | 'similar' | 'commission'; textScale: number }
interface Trial { bodies: string[]; resolve: () => void }
const trials = new WeakMap<HTMLFormElement, Trial>();
let cleanup: (() => void) | undefined;

function render(args: Args) {
  const root = renderPage(!args.enabled ? disabled : args.kind === 'similar' ? similar : args.kind === 'commission' ? commission : html, args.textScale);
  const form = root.querySelector('form')!;
  const trial: Trial = { bodies: [], resolve: () => {} };
  trials.set(form, trial);
  const fakeFetch: typeof fetch = async (_input, init) => {
    trial.bodies.push(String(init?.body));
    if (args.outcome === 'network') throw new TypeError('Synthetic connection failure');
    if (args.outcome === 'timeout') return new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Synthetic timeout', 'AbortError')), { once: true });
    });
    if (args.outcome === 'deferred') await new Promise<void>((resolve) => { trial.resolve = resolve; });
    if (args.outcome === 'malformed') return new Response('not JSON', { status: 200 });
    return Response.json(args.outcome === 'rejected' ? { success: false } : args.outcome === 'failure' ? { error: 'Synthetic unavailable service' } : { success: true }, { status: args.outcome === 'failure' ? 503 : 200 });
  };
  cleanup = enhanceEnquiryForm(form, { fetch: fakeFetch, timeoutMs: args.outcome === 'timeout' ? 50 : 15_000 });
  return root;
}

const meta = {
  title: 'Portfolio/Enquiries',
  parameters: { layout: 'fullscreen' },
  args: { outcome: 'failure', enabled: true, kind: 'purchase', textScale: 100 },
  render,
  beforeEach: () => () => { cleanup?.(); cleanup = undefined; disposeRenderedPage(); },
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<Args>;

async function fill(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByLabelText('Your name (required)'), 'Example visitor');
  await userEvent.type(canvas.getByLabelText('Email address (required)'), 'visitor@example.test');
  await userEvent.type(canvas.getByLabelText('Message (required)'), 'Synthetic enquiry text.');
  return canvas;
}
async function failure(canvasElement: HTMLElement) {
  await checkPage(canvasElement);
  const canvas = await fill(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'Send enquiry' }));
  await waitFor(() => expect(canvas.getByRole('alert')).toBeVisible());
  await expect(canvas.getByRole('alert')).toHaveFocus();
  await expect(canvas.getByLabelText('Message (required)')).toHaveValue('Synthetic enquiry text.');
  await expect(canvas.getByLabelText('Your name (required)')).toHaveValue('Example visitor');
  await expect(canvas.getByLabelText('Email address (required)')).toHaveValue('visitor@example.test');
  await expect(canvas.getByRole('status')).toBeEmptyDOMElement();
  await expect(canvas.getByRole('button')).toBeEnabled();
  const form = canvasElement.querySelector('form')!;
  await expect(trials.get(form)!.bodies).toHaveLength(1);
  await expect(form.querySelector<HTMLInputElement>('[name="turnstile_token"]')!.value).toBe('');
  // No automatic retry and no reuse of a single-use verification token.
  await userEvent.click(canvas.getByRole('button'));
  await expect(trials.get(form)!.bodies).toHaveLength(1);
}

export const Ready: Story = { play: async ({ canvasElement }) => { await checkPage(canvasElement); } };
export const InvalidFields: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(canvas.getByRole('alert')).toHaveFocus();
    for (const label of ['Your name (required)', 'Email address (required)', 'Message (required)']) {
      await expect(canvas.getByLabelText(label)).toHaveAttribute('aria-invalid', 'true');
    }
    await expect(trials.get(canvasElement.querySelector('form')!)!.bodies).toHaveLength(0);
    await userEvent.tab();
    await expect(canvas.getByLabelText('Your name (required)')).toHaveFocus();
  },
};
export const ServiceFailure: Story = { play: async ({ canvasElement }) => failure(canvasElement) };
export const MalformedResponse: Story = { ...ServiceFailure, args: { outcome: 'malformed' } };
export const RejectedResponse: Story = { ...ServiceFailure, args: { outcome: 'rejected' } };
export const NetworkFailure: Story = { ...ServiceFailure, args: { outcome: 'network' } };
export const Timeout: Story = { ...ServiceFailure, args: { outcome: 'timeout' } };
export const Accepted: Story = {
  args: { outcome: 'success' },
  play: async ({ canvasElement }) => {
    const canvas = await fill(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Your enquiry has been accepted.'));
    await expect(canvas.getByLabelText('Message (required)')).toHaveValue('');
    await expect(canvas.getByRole('button')).toBeDisabled();
    const body = JSON.parse(trials.get(canvasElement.querySelector('form')!)!.bodies[0]!);
    await expect(Object.keys(body).sort()).toEqual(['artwork_id', 'company', 'email', 'message', 'name', 'turnstile_token']);
  },
};
export const DoubleSubmit: Story = {
  args: { outcome: 'deferred' },
  play: async ({ canvasElement }) => {
    const canvas = await fill(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    const form = canvasElement.querySelector('form')!;
    form.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    await expect(canvas.getByRole('button')).toBeDisabled();
    await expect(canvas.getByRole('status')).toHaveTextContent('Sending your enquiry');
    await expect(trials.get(form)!.bodies).toHaveLength(1);
    trials.get(form)!.resolve();
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('has been accepted'));
  },
};
export const Unavailable: Story = {
  args: { enabled: false },
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector('form')!;
    form.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    await expect(within(canvasElement).getByRole('button')).toBeDisabled();
    await expect(trials.get(form)!.bodies).toHaveLength(0);
  },
};
export const SimilarWork: Story = { args: { kind: 'similar' } };
export const Commission: Story = { args: { kind: 'commission' } };
export const Narrow: Story = { ...Ready, globals: { viewport: { value: 'narrow', isRotated: false } } };
export const LargeText: Story = { ...Narrow, args: { textScale: 200 } };

export const CorrectedFields: Story = {
  args: { outcome: 'success' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await fill(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('has been accepted'));
    await expect(canvas.getByRole('alert', { hidden: true })).not.toBeVisible();
    await expect(canvas.getByLabelText('Email address (required)')).not.toHaveAttribute('aria-invalid');
  },
};
export const ExplicitRetry: Story = {
  play: async ({ canvasElement }) => {
    await failure(canvasElement);
    const form = canvasElement.querySelector('form')!;
    form.querySelector<HTMLInputElement>('[name="turnstile_token"]')!.value = 'new-synthetic-token';
    await userEvent.click(within(canvasElement).getByRole('button'));
    await waitFor(() => expect(trials.get(form)!.bodies).toHaveLength(2));
    await expect(JSON.parse(trials.get(form)!.bodies[1]!).turnstile_token).toBe('new-synthetic-token');
  },
};
