# Book Keeping Portal

Static AngularJS frontend for the Java `book-keeping-api`. The app runs directly from static files, uses hash-based routes, and calls the backend through `API_BASE`.

## What The App Does

- Creates reimbursement requests from a public form.
- Supports manual entry or OCR-assisted entry from an uploaded PDF/image form.
- Lets users attach receipt files when creating reimbursements.
- Provides login, logout, and registration flows against backend user endpoints.
- Stores the authenticated session in browser `localStorage`.
- Adds bearer tokens to Angular `$http` calls through an HTTP interceptor.
- Loads active budget categories for the reimbursement form.
- Provides a role-gated admin console for budgets, reimbursements, users, and roles.
- Shows API validation errors beside matching form fields.
- Uses SweetAlert confirmation and result dialogs for admin actions.

## Main Routes

The app uses AngularJS hash routes under `#!/`.

| Route | Access | Purpose |
| --- | --- | --- |
| `#!/home` | Public | Landing page |
| `#!/reimbursement` | Public | Create a reimbursement |
| `#!/login` | Guest only | Login or register |
| `#!/admin` | `SADMIN`, `ADMIN`, `FINANCE` | Admin hub |
| `#!/admin/budgets` | `SADMIN`, `ADMIN` | Manage budget categories |
| `#!/admin/reimbursements` | `SADMIN`, `ADMIN`, `FINANCE` | Review reimbursement requests |
| `#!/admin/users` | `SADMIN`, `ADMIN` | Manage users |
| `#!/admin/roles` | `SADMIN` | Manage roles |

## Role Access

- Public users can create reimbursement requests.
- Authenticated users are redirected away from the guest-only login route.
- `ADMIN` can access budget, reimbursement, and user administration.
- `FINANCE` can access reimbursement administration and process approvals, rejections, and payouts.
- `SADMIN` can access the full admin area, including role administration.

## Requirements

- Node.js and npm for local development.
- Java `book-keeping-api` running locally or remotely.
- A browser that can run AngularJS 1.8.
- Backend CORS configured for the frontend origin.

The default backend URL is:

```text
http://localhost:9095/api/v1/book-keeping
```

## Local Setup

Install dependencies:

```sh
npm install
```

Start the static development server:

```sh
npm start
```

Open the app:

```text
http://localhost:5173/#!/home
```

Useful local URLs:

- `http://localhost:5173/#!/reimbursement`
- `http://localhost:5173/#!/login`
- `http://localhost:5173/#!/admin`

## Configuration

Configuration is read from `window.__ENV__` before `src/app.module.js` initializes the AngularJS app.

The committed default is in `env.js`:

```js
window.__ENV__ = {
  API_BASE: 'http://localhost:9095/api/v1/book-keeping'
};
```

There is also an ignored `env.local.js` file and an `env.local.js.example` template. The current `index.html` script order loads `env.local.js` first and `env.js` second, so `env.js` is the effective value if both files assign `window.__ENV__`. For a local backend URL change in the current app, update `env.js` or adjust the script order so the local file loads last.

For production, set `API_BASE` to the deployed backend URL and deploy the static files from this repository.

## Vendor Assets And OCR

`npm install` runs `scripts/copy-vendor.js`, which copies these browser assets into `vendor/`:

- `pdfjs-dist/build/pdf.min.js`
- `pdfjs-dist/build/pdf.worker.min.js`
- `tesseract.js/dist/tesseract.min.js`

At runtime, `index.html` tries local vendor files first and falls back to CDN URLs if a local script fails to load. OCR works by:

1. Reading uploaded images directly, or rendering the first page of uploaded PDFs through PDF.js.
2. Passing the image/canvas to Tesseract.
3. Parsing recognized text into reimbursement form fields where possible.

Receipt uploads accept PDF and image files up to 10 MB.

## API Documentation

Backend URL, CORS, and endpoint contract details live in `API_README.md`.

## Deployment

This project has no build step. Deploy the static files as-is:

- `index.html`
- `styles.css`
- `env.js`
- `src/`
- `vendor/`

Recommended hosting options include nginx, S3/CloudFront, a CDN-backed static host, or any server that can return these files directly.

If the frontend and backend are on different origins, configure backend CORS to allow the frontend origin. See `API_README.md` for the expected local origins and backend endpoints.

### Docker

Build the deployment image:

```sh
docker build -t book-keeping-portal .
```

Run it with the default local API URL:

```sh
docker run --rm -p 8080:80 book-keeping-portal
```

Run it with a deployed API URL:

```sh
docker run --rm -p 8080:80 \
  -e API_BASE=https://api.example.com/api/v1/book-keeping \
  book-keeping-portal
```

Open:

```text
http://localhost:8080/#!/home
```

The image uses nginx to serve the static app. On container startup, `docker/10-env-js.sh` writes `env.js` from the `API_BASE` environment variable, or falls back to `http://localhost:9095/api/v1/book-keeping`.

Use Docker Compose for a deployment-style local run:

```sh
API_BASE=https://api.example.com/api/v1/book-keeping docker compose up --build -d
```

Stop it with:

```sh
docker compose down
```

The compose service publishes the app on `http://localhost:8080/#!/home`, injects `API_BASE` at container startup, and restarts automatically unless stopped.

## Project Structure

```text
index.html                    App shell and script loading
styles.css                    Global styles
env.js                        Committed runtime configuration
env.local.js.example          Local configuration template
scripts/copy-vendor.js        Copies PDF.js and Tesseract assets
Dockerfile                    Multi-stage static deployment image
docker/                       nginx and runtime env config for the image
vendor/                       Local browser vendor assets
src/app.module.js             AngularJS module, API base, route guard hook
src/config/routes.js          Hash route definitions
src/config/vendor.config.js   Runtime vendor setup
src/controllers/              Page controllers
src/directives/               File input directive
src/services/                 API, auth, OCR, errors, and alert services
src/templates/                AngularJS template strings
```

## Development Notes

- Use `npm start` to serve the app on port `5173`.
- There are no automated tests configured in `package.json`.
- The app depends on external CDN scripts for AngularJS, Angular Route, RxJS, and SweetAlert unless those scripts are cached or otherwise available.
- Keep `env.local.js` out of git; it is ignored by `.gitignore`.
