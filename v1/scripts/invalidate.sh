#!/usr/bin/env bash
set -euo pipefail

DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"
if [[ -z "$DISTRIBUTION_ID" ]]; then
  echo "Set CLOUDFRONT_DISTRIBUTION_ID." >&2
  exit 1
fi

aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"
