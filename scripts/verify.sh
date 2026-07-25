#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN_NAME:-example.com}"
WWW_DOMAIN="${WWW_DOMAIN_NAME:-www.example.com}"

command -v curl >/dev/null || { echo "curl is required" >&2; exit 1; }

echo "== DNS =="
if command -v dig >/dev/null; then
  dig +short "$DOMAIN" A
  dig +short "$WWW_DOMAIN" A
else
  nslookup "$DOMAIN"
  nslookup "$WWW_DOMAIN"
fi

echo
echo "== HTTP apex =="
curl --fail-with-body --silent --show-error --head "http://$DOMAIN"

echo
echo "== HTTPS apex =="
curl --fail-with-body --silent --show-error --head "https://$DOMAIN"

echo
echo "== HTTPS www =="
curl --fail-with-body --silent --show-error --head "https://$WWW_DOMAIN"
