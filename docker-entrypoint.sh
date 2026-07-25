#!/bin/sh
set -e

replace_placeholder() {
  placeholder="$1"
  value="$2"

  grep -rl "$placeholder" /app/dist 2>/dev/null | while IFS= read -r file; do
    sed -i "s|$placeholder|$value|g" "$file"
  done
}

replace_placeholder "__RUNTIME_VITE_API_URL__" "${VITE_API_URL:-}"
replace_placeholder "__RUNTIME_VITE_SITE_URL__" "${VITE_SITE_URL:-}"

exec "$@"
