// P07 replaces this disabled boundary only after delivery and account setup are approved.
export const onRequest: PagesFunction = async ({ request }) => {
  const headers = { 'Cache-Control': 'no-store', Allow: 'POST' };
  if (request.method !== 'POST') {
    return Response.json({ error: 'Use POST for enquiries.' }, { status: 405, headers });
  }
  return Response.json(
    { error: 'Artwork enquiries are not enabled yet. No message has been accepted.' },
    { status: 503, headers },
  );
};
