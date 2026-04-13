# www-nextjs-slate

A minimalist WYSIWYG writing tool built with Next.js, React, and Slate.js. Powered by the [Internet Development](https://internet.dev) API.

## Setup

Requires Node.js >= 18.

```sh
npm install
npm run dev
```

Visit `http://localhost:10000`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 10000 |
| `npm run build` | Production build |
| `npm start` | Start production server on port 10000 |

## Environment Variables

Required for OAuth:

- `API_AES_KEY` - AES encryption key
- `API_IV_KEY` - Initialization vector key

## Configuration

All branding and domain constants are in `nextjs-slate/common/constants.ts`. Change `PRODUCT_NAME`, `SITE_DOMAIN`, `SITE_URL`, `COOKIE_NAME`, and `OAUTH_REDIRECT_KEY` to rebrand or deploy under a different domain.

## License

MIT
