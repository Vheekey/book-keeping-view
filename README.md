# Book Keeping Portal (AngularJS)

A lightweight AngularJS portal for the Java `book-keeping-api`. The UI runs as a static site and calls the backend via HTTP.

## What is included

- Reimbursement form (login-free for users)
- Login view (users/admins placeholder until API is available)
- RxJS-based fetch for active budget categories
- Field-level error rendering from API validation responses

## Requirements

### Local (development)

- Node.js (for `http-server`)
- Java backend running at `http://localhost:9095`

### Production (deployment)

- Static hosting (CDN, nginx, S3/CloudFront, or similar) for `index.html`, `app.js`, and `styles.css`
- Java backend deployed separately (e.g., `https://api.yourdomain.com`)
- CORS configured on the backend to allow the frontend origin

## Local setup (step by step)

1. `cd /book-keeping-view`
2. `npm install`
3. Create a local env override:
   - Copy `env.local.js.example` to `env.local.js`
   - Update `API_BASE` in `env.local.js` to match your backend
4. `npm start`
5. Open `http://localhost:5173/#/reimbursement`

## Environment configuration

The app loads configuration from two files, in order:

1. `env.local.js` (optional, ignored by git)
2. `env.js` (default, committed)

Example:

```js
window.__ENV__ = {
  API_BASE: 'http://localhost:9095/api/v1/book-keeping'
};
```

Use `env.local.js` for developer-specific settings and keep `env.js` as the shared default.


## CORS

If the backend is on a different origin, enable CORS for the frontend origin.

Allowed origins in the current Java config:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
