import { enquiryPayload } from './enquiries';

const active = new WeakMap<HTMLFormElement, () => void>();

/** The same controller is mounted by the Astro component and its isolated stories. */
export function enhanceEnquiryForm(
  form: HTMLFormElement,
  options: { fetch?: typeof fetch; timeoutMs?: number } = {},
): () => void {
  const previous = active.get(form);
  if (previous) return previous;
  const fieldset = form.querySelector('fieldset');
  const errors = form.querySelector<HTMLElement>('[data-enquiry-errors]');
  const status = form.querySelector<HTMLElement>('[data-enquiry-status]');
  if (!fieldset || !errors || !status) throw new Error('Incomplete enquiry form markup.');
  const enabled = form.dataset.enabled === 'true';
  fieldset.disabled = !enabled;
  let pending = false;
  let completed = false;
  let disposed = false;
  let controller: AbortController | undefined;
  const send = options.fetch ?? globalThis.fetch.bind(globalThis);
  const showError = (message: string) => {
    errors.textContent = message;
    errors.hidden = false;
    errors.focus();
  };
  const submit = async (event: SubmitEvent) => {
    event.preventDefault();
    if (!enabled || pending || completed) return;
    errors.hidden = true;
    errors.textContent = '';
    status.textContent = '';
    form.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'));
    form.querySelectorAll('[data-error-for]').forEach((error) => { error.textContent = ''; });
    const data = new FormData(form);
    const fields = ['artwork_id', 'name', 'email', 'message', 'turnstile_token', 'company'] as const;
    const parsed = enquiryPayload.safeParse(Object.fromEntries(fields.map((field) => [field, data.get(field) ?? ''])));
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field !== 'string' || !['name', 'email', 'message'].includes(field)) continue;
        const input = form.elements.namedItem(field);
        if (input instanceof HTMLElement) input.setAttribute('aria-invalid', 'true');
        const message = form.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
        if (message && !message.textContent) message.textContent = issue.message;
      }
      const verificationMissing = parsed.error.issues.some((issue) => issue.path[0] === 'turnstile_token');
      showError(verificationMissing ? 'Complete the verification before sending. No message has been sent.' : 'Check the marked fields. No message has been sent.');
      return;
    }
    pending = true;
    fieldset.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending your enquiry…';
    controller = new AbortController();
    const timer = setTimeout(() => controller?.abort(), options.timeoutMs ?? 15_000);
    try {
      const response = await send('/api/enquiry', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data), signal: controller.signal,
      });
      const body: unknown = await response.json();
      if (disposed) return;
      if (!response.ok || !body || typeof body !== 'object' || !('success' in body) || body.success !== true) {
        throw new Error('Enquiry was not accepted.');
      }
      completed = true;
      form.reset();
      status.textContent = 'Your enquiry has been accepted. Thank you.';
    } catch {
      if (!disposed) {
        status.textContent = '';
        showError('We could not confirm your enquiry was accepted. Your text is still here. Please try again later; if you saw a timeout, check before resending to avoid a duplicate.');
      }
    } finally {
      clearTimeout(timer);
      // A verification token is single-use. A future widget adapter must reset
      // on this event and supply a new token; automatic retries are unsafe.
      const token = form.elements.namedItem('turnstile_token');
      if (token instanceof HTMLInputElement) token.value = '';
      if (!disposed) {
        form.dispatchEvent(new CustomEvent('enquiry:verification-reset'));
        fieldset.disabled = completed || !enabled;
        form.removeAttribute('aria-busy');
      }
      pending = false;
    }
  };
  form.addEventListener('submit', submit);
  const cleanup = () => {
    disposed = true;
    controller?.abort();
    form.removeEventListener('submit', submit);
    fieldset.disabled = true;
    active.delete(form);
  };
  active.set(form, cleanup);
  return cleanup;
}
