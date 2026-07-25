#!/usr/bin/env bash
set -euo pipefail

BUCKET_NAME="${1:-}"
PREFIX="${2:-}"

if [[ -z "$BUCKET_NAME" ]]; then
  echo "Usage: $0 <bucket-name> [prefix]" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_DIR="$REPO_ROOT/site"
mkdir -p "$SITE_DIR"

SOURCE="s3://$BUCKET_NAME/"
if [[ -n "$PREFIX" ]]; then
  SOURCE="s3://$BUCKET_NAME/${PREFIX%/}/"
fi

aws sts get-caller-identity >/dev/null
aws s3 sync "$SOURCE" "$SITE_DIR" --exclude "README.md" --exclude "index.html.example"

echo "Export complete: $SOURCE -> $SITE_DIR"
echo "Review all files before committing them."
