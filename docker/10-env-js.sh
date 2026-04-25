#!/bin/sh
set -eu

ENV_FILE="/usr/share/nginx/html/env.js"
API_BASE_VALUE="${API_BASE:-http://localhost:9095/api/v1/book-keeping}"
ESCAPED_API_BASE=$(printf '%s' "$API_BASE_VALUE" | sed "s/\\\\/\\\\\\\\/g; s/'/\\\\'/g")

{
  printf 'window.__ENV__ = {\n'
  printf "  API_BASE: '%s'\n" "$ESCAPED_API_BASE"
  printf '};\n'
} > "$ENV_FILE"
