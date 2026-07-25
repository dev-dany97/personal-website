# Troubleshooting

## `AccessDenied` from CloudFront

Check all of the following:

1. The origin is the S3 REST endpoint, not the website endpoint.
2. OAC is attached to the origin and signs requests.
3. The bucket policy references the correct AWS account and CloudFront distribution ID.
4. `site/index.html` was deployed to the bucket root.
5. CloudFront `default_root_object` is `index.html`.
6. The distribution is fully deployed.
7. Create an invalidation for `/*` after configuration changes.

## XML bucket listing

A bucket listing indicates that public list permissions were enabled or the request reached a public S3 endpoint rather than the intended private CloudFront path. Remove public ACLs and policies, enable Block Public Access and use OAC.

## HTTPS certificate error

- The ACM certificate must be issued in `us-east-1`.
- It must cover both `example.com` and `www.example.com`.
- DNS validation records must remain in Route 53 for renewal.
- The domains may be associated with only one CloudFront distribution at a time.

## Domain resolves to an old distribution

Update the Route 53 A and AAAA alias records to the active distribution and allow DNS caches to expire. Confirm with public resolvers such as `1.1.1.1` and `8.8.8.8`.

## Changes are not visible

Create a CloudFront invalidation:

```bash
aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*"
```
