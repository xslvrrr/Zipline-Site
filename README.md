# Zipline Edge

Public-facing Next.js site for a Zipline file host. The app includes:

- A polished landing page for a public custom domain
- A server-side upload proxy that forwards files to Zipline
- Metadata, `robots.txt`, and `sitemap.xml`
- Environment templates for the frontend and Zipline instance
- Unit, integration, and Playwright smoke tests

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Required environment variables

```bash
NEXT_PUBLIC_SITE_URL=https://files.example.com
ZIPLINE_API_URL=https://zipline.internal.example.com
ZIPLINE_PUBLIC_URL=https://files.example.com
ZIPLINE_TOKEN=replace-with-your-zipline-token
```

`ZIPLINE_API_URL` and `ZIPLINE_TOKEN` are required for live uploads. `ZIPLINE_PUBLIC_URL` is optional but recommended when the Zipline origin is on an internal hostname and public links should be rewritten to your branded domain.

## Zipline domain settings

Apply these values to your Zipline deployment so generated file links use the same public domain:

```bash
CORE_DEFAULT_DOMAIN=files.example.com
DOMAINS=files.example.com,cdn.example.com
CORE_RETURN_HTTPS_URLS=true
CORE_TRUST_PROXY=true
```

## Verification

```bash
npm run lint
npm run test
npm run test:coverage
npm run test:e2e
npm run build
```
