# CMS authentication Worker

Unmodified [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth), pinned to `5822c9f48de9a5abd376f5fc17be1ade5b16eb6c`. `worker.js` is upstream `src/index.js`; retain the upstream MIT licence. Deploy separately from the portfolio's Pages project:

```sh
mise exec node@22.23.4 -- npx wrangler deploy --config integrations/cms-auth/wrangler.toml
```

This Worker exchanges GitHub login codes and refreshes expiring tokens. Its GitHub App must be installed only on `mirkonz/lauren.co.nz`, with Contents and Pull requests read/write, Metadata read, and no Workflows access. Allow only the authorised Pages hostname. New hosts need a reviewed allowlist/callback change.

Store `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` as Cloudflare Worker secrets, never in Git or CMS YAML. Secrets survive the normal Wrangler deployment above. Missing credentials fail closed. No bindings, DNS routes, build integration or paid service are required.

Wrangler 4.162.0 uploaded the initial script successfully but its subsequent newer Worker lookup returned error 10007. The documented [script subdomain API](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/subdomain/) completed activation with `enabled: true`, `previews_enabled: false`. Treat a CLI error as incomplete deployment and read back the script, deployment and subdomain before retrying. No alternate runtime or patched CLI was introduced. Logs are disabled because login requests contain sensitive authentication material.

Callback: `https://lauren-cms-auth.ygknxzgpg4.workers.dev/callback`. The CMS `backend.base_url` uses the same origin without `/callback`. This Worker is separate from the retained `lauren-co-nz` service.
