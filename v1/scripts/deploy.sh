#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_DIR="$REPO_ROOT/site"
SITE_BUCKET="${SITE_BUCKET:-}"
DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"

if [[ -z "$SITE_BUCKET" || -z "$DISTRIBUTION_ID" ]]; then
  echo "Set SITE_BUCKET and CLOUDFRONT_DISTRIBUTION_ID." >&2
  exit 1
fi

if [[ ! -f "$SITE_DIR/index.html" ]]; then
  echo "Missing $SITE_DIR/index.html. Export or add the production website first." >&2
  exit 1
fi

aws sts get-caller-identity >/dev/null

SYNC_ARGS=(--exclude "README.md" --exclude "index.html.example")
if [[ "${ALLOW_REMOTE_DELETE:-false}" == "true" ]]; then
  SYNC_ARGS+=(--delete)
fi

aws s3 sync "$SITE_DIR" "s3://$SITE_BUCKET/" \
  "${SYNC_ARGS[@]}" \
  --cache-control "public,max-age=300"

aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" >/dev/null

echo "Deployment complete. CloudFront invalidation submitted."
