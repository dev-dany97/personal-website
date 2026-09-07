# Deployment

## Manual deployment

Set environment variables or pass parameters to the scripts:

```bash
export SITE_BUCKET="www.example.com"
export CLOUDFRONT_DISTRIBUTION_ID="<DISTRIBUTION_ID>"
./scripts/deploy.sh
```

The script:

1. validates that `site/index.html` exists
2. synchronizes files to S3
3. applies cache-control metadata
4. creates a CloudFront invalidation

## Cache policy

HTML is uploaded with a short cache lifetime so releases become visible quickly. Versioned assets can use a long cache lifetime. The basic script uses a conservative setting for all files; adjust it when the asset filenames include content hashes.

## GitHub Actions

The workflow in `.github/workflows/deploy.yml` uses GitHub OpenID Connect rather than long-lived AWS access keys.

Create a GitHub environment or repository secrets:

- `AWS_ROLE_ARN`
- `SITE_BUCKET`
- `CLOUDFRONT_DISTRIBUTION_ID`

The AWS role trust policy must restrict access to the intended repository and branch.
