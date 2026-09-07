# Architecture

## Request path

1. The registrar delegates DNS to the four Route 53 name servers assigned to the hosted zone.
2. Route 53 A and AAAA alias records point both `example.com` and `www.example.com` to one CloudFront distribution.
3. CloudFront terminates HTTPS using an ACM certificate issued in `us-east-1`.
4. CloudFront requests objects from the regional S3 REST endpoint using signed Origin Access Control requests.
5. The S3 bucket policy accepts `s3:GetObject` only from the configured CloudFront distribution.

## Why CloudFront is required

An S3 static website endpoint supports HTTP but does not provide HTTPS for a custom domain. CloudFront provides HTTPS, redirects HTTP viewers to HTTPS, caches static content and permits a private S3 origin.

## Why the certificate is in us-east-1

CloudFront is a global service and accepts ACM viewer certificates from `us-east-1`. This does not move the S3 bucket or website source out of Frankfurt.

## Origin type

This project uses the S3 REST endpoint:

```text
<bucket>.s3.eu-central-1.amazonaws.com
```

It deliberately does not use the S3 website endpoint:

```text
<bucket>.s3-website.eu-central-1.amazonaws.com
```

The REST endpoint supports OAC. The website endpoint does not.

## Canonical content layout

Production files are stored at the bucket root. The root object is `index.html`. Older content under `<PREFIX>/` should be exported into `site/` and redeployed to the bucket root.
