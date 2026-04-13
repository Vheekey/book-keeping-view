# Book Keeping Portal (AngularJS)

A lightweight AngularJS portal for the Java `book-keeping-api`. The UI runs as a static site and calls the backend via HTTP.

## What is included

- Reimbursement form, exposed without a frontend login gate
- Login and registration against the backend user endpoints
- Role-aware admin console for implemented backend endpoints
  - `/admin` landing page
  - `/admin/budgets` for budget category management
  - `/admin/reimbursements` for reimbursement management
  - `/admin/users` for SADMIN user management
  - `/admin/roles` for SADMIN role management
- Bearer-token auth header support for Angular `$http` calls and the RxJS budget category call
- RxJS-based fetch for active budget categories
- Field-level error rendering from API validation responses

## Role access

- Public/user flow: create reimbursements from the reimbursement form
- `ADMIN`: access budget and reimbursement admin views
- `FINANCE`: approve/reject reimbursements and mark payouts
- `SADMIN`: manage users and roles, and view the broader admin area

## Requirements

### Local (development)

- Node.js (for `http-server`)
- Java backend running at `http://localhost:9095`

### Production (deployment)

- Static hosting (CDN, nginx, S3/CloudFront, or similar) for `index.html`, `styles.css`, `src/`, and `vendor/`
- Java backend deployed separately (e.g., `https://api.yourdomain.com`)
- CORS configured on the backend to allow the frontend origin

## Local setup (step by step)

1. `cd /book-keeping-view`
2. `npm install`
   - This copies local OCR vendor files into `vendor/`
3. Create a local env override:
   - Copy `env.local.js.example` to `env.local.js`
   - Update `API_BASE` in `env.local.js` to match your backend
4. `npm start`
5. Open `http://localhost:5173/#/reimbursement`
6. Open `http://localhost:5173/#/admin` for the admin console

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

## OCR vendor loading

The app loads OCR libraries from `vendor/` first (copied from `node_modules`), and falls back to CDN if needed.


## CORS

If the backend is on a different origin, enable CORS for the frontend origin.

Allowed origins in the current Java config:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
