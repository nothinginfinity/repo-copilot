# Deploy AFO Micro Mail Worker

## 1. Create Cloudflare resources

```bash
wrangler d1 create afo-micro-mail-db
wrangler r2 bucket create afo-micro-mail
wrangler kv namespace create MAIL_KV
wrangler vectorize create afo-micro-mail-vectors --dimensions=768 --metric=cosine
```

## 2. Update bindings

Edit `wrangler.jsonc` and replace:

- `REPLACE_WITH_D1_DATABASE_ID`
- `REPLACE_WITH_KV_NAMESPACE_ID`
- `MAIL_DOMAIN`

## 3. Apply the D1 schema

```bash
wrangler d1 execute afo-micro-mail-db --file=./schema.sql
```

## 4. Deploy

```bash
wrangler deploy
```

## 5. Configure inbound email

In Cloudflare Email Routing, route the desired address or catch-all to this Worker. The Worker exports an `email(message, env, ctx)` handler and will look up the mailbox by the local part of the recipient address.

Example:

```text
project-demo@yourdomain.com -> mailbox slug project-demo
```

## 6. Smoke test HTTP API

```bash
curl https://afo-micro-mail-worker.YOUR_SUBDOMAIN.workers.dev/health

curl -X POST https://afo-micro-mail-worker.YOUR_SUBDOMAIN.workers.dev/api/mailboxes \
  -H 'content-type: application/json' \
  -d '{"slug":"project-demo","purpose":"Demo inbox","ttl_seconds":604800}'
```

## Notes before production

Add authentication, rate limits, domain policy, outbound sending policy, attachment scanning, richer MIME parsing, and stricter lifecycle/audit controls before exposing this to public users.
