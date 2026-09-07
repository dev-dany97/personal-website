# Operations

## Routine deployment

```bash
./scripts/deploy.sh
./scripts/verify.sh
```

## Cache invalidation only

```bash
./scripts/invalidate.sh
```

## DNS checks

```bash
dig +short example.com A
dig +short www.example.com A
```

On Windows:

```powershell
Resolve-DnsName example.com
Resolve-DnsName www.example.com
```

## HTTP checks

```bash
curl -I http://example.com
curl -I https://example.com
curl -I https://www.example.com
```

Expected behavior:

- HTTP returns a redirect to HTTPS.
- HTTPS returns a successful response.
- The certificate covers both names.

## Backup

S3 versioning is recommended for the website bucket. In addition, periodically export the production bucket into a dated local or separate S3 backup location.
