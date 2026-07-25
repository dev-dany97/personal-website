# Security and auditing

## S3

- Block all public access.
- Use `BucketOwnerEnforced` object ownership.
- Grant `s3:GetObject` only to the CloudFront service principal and only for the intended distribution ARN.
- Do not grant public `ListBucket` or `GetObject` permissions.
- Keep private files and website files in separate buckets.

## CloudFront

- Use Origin Access Control with request signing enabled.
- Redirect HTTP to HTTPS.
- Use a current TLS security policy.
- Keep only the required alternate domain names.
- Delete obsolete distributions after migration.

## IAM

- Enable MFA for the root user and administrative identities.
- Avoid root access keys.
- Remove unknown IAM users, roles and access keys.
- Prefer temporary credentials and GitHub OIDC for CI/CD.

## CloudTrail

The Terraform configuration creates a multi-region trail with:

- management events
- S3 object write events for the site bucket
- optional S3 object read events
- log-file validation
- a dedicated private S3 log bucket

S3 read data events include normal CloudFront object retrievals and can produce significant log volume and cost. Keep them enabled during investigation or when required by policy; otherwise, logging write events only is often sufficient for a small static website.

## Incident review

Review the CloudTrail event history and delivered logs for:

```text
ConsoleLogin
CreateAccessKey
CreateUser
AttachUserPolicy
PutBucketPolicy
PutBucketAcl
PutPublicAccessBlock
PutObject
DeleteObject
CreateDistribution
UpdateDistribution
DeleteDistribution
ChangeResourceRecordSets
RequestCertificate
DeleteCertificate
```

For each event, inspect:

- `userIdentity`
- `sourceIPAddress`
- `userAgent`
- `eventTime`
- `requestParameters`
- `errorCode` and `errorMessage`
