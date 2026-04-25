# Docker Setup

This app is a static AngularJS frontend served by `nginx` inside a container. The container writes `env.js` at startup from the `API_BASE` environment variable, so the same image can be used against different backend environments.

## Prerequisites

- Docker Desktop or a running Docker Engine
- The backend API URL you want the frontend to call

Default API URL:

```text
http://localhost:9095/api/v1/book-keeping
```

## Option 1: Run With Docker

Build the image:

```sh
docker build -t book-keeping-portal .
```

Run the container:

```sh
docker run --rm -p 8080:80 book-keeping-portal
```

Run the container with a custom backend:

```sh
docker run --rm -p 8080:80 \
  -e API_BASE=https://api.example.com/api/v1/book-keeping \
  book-keeping-portal
```

Open the app:

```text
http://localhost:8080/#!/home
```

## Option 2: Run With Docker Compose

Start the app with the default backend:

```sh
docker compose up --build -d
```

Start the app with a custom backend:

```sh
API_BASE=https://api.example.com/api/v1/book-keeping docker compose up --build -d
```

Stop the app:

```sh
docker compose down
```

The Compose setup publishes the site on port `8080` and restarts the container unless it is manually stopped.

## Runtime Configuration

The container startup script at `docker/10-env-js.sh` generates:

```js
window.__ENV__ = {
  API_BASE: '...'
};
```

That means:

- You do not need to rebuild the image just to change the backend URL.
- You only need to pass a different `API_BASE` value at container start time.
- If `API_BASE` is omitted, the app falls back to `http://localhost:9095/api/v1/book-keeping`.

## Files Used By Docker

- `Dockerfile`: builds the deployment image
- `compose.yaml`: local deployment-style startup
- `docker/nginx.conf`: nginx site configuration
- `docker/10-env-js.sh`: runtime environment injection

## Troubleshooting

If `docker build` or `docker compose up` fails with a daemon error, start Docker Desktop first and retry.

If the frontend loads but API calls fail:

- Confirm `API_BASE` points to the correct backend URL.
- Confirm the backend is reachable from your browser.
- Confirm backend CORS allows the frontend origin, for example `http://localhost:8080`.

If you update only `API_BASE`, restart the container instead of rebuilding the image.
