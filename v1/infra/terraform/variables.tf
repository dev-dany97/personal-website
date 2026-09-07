variable "aws_region" {
  description = "Regional AWS location for S3 and CloudTrail."
  type        = string
  default     = "eu-central-1"
}

variable "domain_name" {
  description = "Apex domain served by CloudFront."
  type        = string
  default     = "example.com"
}

variable "www_domain_name" {
  description = "WWW domain served by CloudFront."
  type        = string
  default     = "www.example.com"
}

variable "site_bucket_name" {
  description = "Existing S3 bucket containing the website."
  type        = string
}

variable "hosted_zone_id" {
  description = "Route 53 hosted-zone ID for the domain."
  type        = string
}

variable "cloudtrail_log_bucket_name" {
  description = "Globally unique bucket name for CloudTrail logs."
  type        = string
}

variable "cloudfront_price_class" {
  description = "CloudFront price class. PriceClass_100 covers North America and Europe."
  type        = string
  default     = "PriceClass_100"

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.cloudfront_price_class)
    error_message = "Use PriceClass_100, PriceClass_200 or PriceClass_All."
  }
}

variable "origin_path" {
  description = "Optional S3 origin prefix. Prefer an empty value and deploy files to the bucket root."
  type        = string
  default     = ""
}

variable "log_s3_read_events" {
  description = "Log S3 object reads. This can create high CloudTrail volume and cost."
  type        = bool
  default     = false
}
