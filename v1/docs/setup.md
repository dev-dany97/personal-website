# Initial setup

## Prerequisites

- An AWS account
- A Route 53 hosted zone for `example.com`
- The domain registrar delegated to the Route 53 name servers
- AWS CLI v2
- Terraform 1.7 or newer
- Git

Confirm the active AWS identity before making changes:

```bash
aws sts get-caller-identity
```

## Configuration

Copy `infra/terraform/terraform.tfvars.example` to `terraform.tfvars` and set:

- AWS region for S3 and CloudTrail
- domain names
- existing site bucket name
- Route 53 hosted-zone ID
- a globally unique CloudTrail log-bucket name
- whether S3 read data events should be recorded

## Apply infrastructure

```bash
cd infra/terraform
terraform init
terraform fmt -check
terraform validate
terraform plan -out=plan.out
terraform apply plan.out
```

## Certificate validation

Terraform creates ACM DNS-validation records in Route 53 and waits for the certificate to be issued. The certificate resource uses the `us-east-1` provider alias because CloudFront requires that region.

## S3 configuration

The site bucket is expected to exist. Terraform manages:

- public-access blocking
- bucket ownership controls
- the CloudFront-only bucket policy

The website-hosting setting is not required when CloudFront uses the S3 REST endpoint.

## First deployment

Export the old website if required, then synchronize `site/` to the bucket root:

```bash
./scripts/export-site-from-s3.sh www.example.com "<PREFIX>"
./scripts/deploy.sh
```
