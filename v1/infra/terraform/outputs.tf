output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.site.domain_name
}

output "certificate_arn" {
  value = aws_acm_certificate_validation.site.certificate_arn
}

output "site_bucket_name" {
  value = data.aws_s3_bucket.site.id
}

output "cloudtrail_log_bucket_name" {
  value = aws_s3_bucket.cloudtrail_logs.id
}
