# Book Keeping Portal API Notes

Backend contract notes for the Book Keeping Portal frontend. The frontend expects a Java `book-keeping-api` service under `API_BASE`.

## API Base

The default backend URL is:

```text
http://localhost:9095/api/v1/book-keeping
```

The frontend reads this value from `window.__ENV__.API_BASE`. In the committed app, the default is defined in `env.js`:

```js
window.__ENV__ = {
  API_BASE: 'http://localhost:9095/api/v1/book-keeping'
};
```

There is also an ignored `env.local.js` file and an `env.local.js.example` template. The current `index.html` script order loads `env.local.js` first and `env.js` second, so `env.js` is the effective value if both files assign `window.__ENV__`.

## CORS

If the frontend and backend are on different origins, configure backend CORS to allow the frontend origin.

Local development origins:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

## Authentication

The app stores the authenticated session in browser `localStorage`. When a token is present, the AngularJS HTTP interceptor sends:

```text
Authorization: Bearer <token>
```

The RxJS budget category request also sends the bearer token when available.

## Endpoints Used

The frontend expects these endpoint groups under `API_BASE`.

### Auth And Users

- `POST /users/auth/login`
- `POST /users/auth/logout`
- `GET /users`
- `POST /users`
- `POST /users/create`
- `GET /users/{id}`
- `PUT /users/{id}`
- `PUT /users/{id}/change-status`
- `DELETE /users/{id}`
- `POST /users/{id}/role`

### Roles

- `GET /roles`
- `POST /roles`
- `GET /roles/{id}`
- `PUT /roles/{id}`
- `DELETE /roles/{id}`
- `POST /roles/{roleId}/users/{userId}`

### Budget Categories

- `GET /budget/categories`
- `POST /budget/categories`
- `GET /budget/categories/active`
- `PUT /budget/categories/{accNo}/change-status`

### Reimbursements

- `POST /reimbursements/create`
- `GET /reimbursements`
- `GET /reimbursements/{id}`
- `POST /reimbursements/{id}/approve`
- `POST /reimbursements/{id}/payout`

### Reimbursement Receipts

- `GET /reimbursements/{id}/receipts`
- `POST /reimbursements/{id}/receipts`
- `DELETE /reimbursements/{id}/receipts/{receiptId}`

For opening receipt files, the admin service tries these content endpoints in order until one returns non-JSON file content:

- `GET /reimbursements/{id}/receipts/{receiptId}/content`
- `GET /reimbursements/{id}/receipts/{receiptId}/download`
- `GET /reimbursements/{id}/receipts/{receiptId}/file`
- `GET /reimbursements/{id}/receipts/{receiptId}/view`

## File Upload Expectations

Receipt uploads use `multipart/form-data` with the file field named `receipt`.

Supported frontend file types:

- PDF files
- Image files

The frontend enforces a 10 MB limit for receipt uploads.
