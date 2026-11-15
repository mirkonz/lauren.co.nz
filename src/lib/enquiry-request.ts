import { enquiryPayload, type EnquiryPayload, type EnquiryTarget } from './enquiries';

export const MAX_ENQUIRY_BYTES = 16_384;
type Validation = { ok: true; payload: EnquiryPayload; target: EnquiryTarget } | { ok: false; status: number };

/** Validation only. Success here never means spam verification, acceptance or delivery. */
export async function validateEnquiryRequest(
  request: Request,
  policy: { allowedOrigin: string; catalogue: readonly EnquiryTarget[] },
): Promise<Validation> {
  const origin = new URL(policy.allowedOrigin);
  if (origin.origin !== policy.allowedOrigin || !['http:', 'https:'].includes(origin.protocol)) throw new Error('Configure one exact enquiry origin.');
  if (request.method !== 'POST') return { ok: false, status: 405 };
  if (request.headers.get('Origin') !== policy.allowedOrigin) return { ok: false, status: 403 };
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get('Content-Type') ?? '')) return { ok: false, status: 415 };
  const declared = request.headers.get('Content-Length');
  if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > MAX_ENQUIRY_BYTES)) return { ok: false, status: 413 };
  if (!request.body) return { ok: false, status: 400 };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_ENQUIRY_BYTES) {
        await reader.cancel();
        return { ok: false, status: 413 };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const parsed = enquiryPayload.safeParse(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)));
    if (!parsed.success) return { ok: false, status: 400 };
    const target = policy.catalogue.find(({ id }) => id === parsed.data.artwork_id);
    if (!target) return { ok: false, status: 400 };
    return { ok: true, payload: parsed.data, target };
  } catch {
    return { ok: false, status: 400 };
  } finally {
    reader.releaseLock();
  }
}
