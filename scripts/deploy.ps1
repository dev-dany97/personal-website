param(
    [string]$BucketName = $env:SITE_BUCKET,
    [string]$DistributionId = $env:CLOUDFRONT_DISTRIBUTION_ID,
    [switch]$AllowRemoteDelete
)

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$SiteDir = Join-Path $RepoRoot "site"
$IndexFile = Join-Path $SiteDir "index.html"

if (-not $BucketName -or -not $DistributionId) {
    throw "Provide BucketName and DistributionId or set SITE_BUCKET and CLOUDFRONT_DISTRIBUTION_ID."
}
if (-not (Test-Path $IndexFile)) {
    throw "Missing $IndexFile. Export or add the production website first."
}

$SyncArgs = @("s3", "sync", $SiteDir, "s3://$BucketName/", "--exclude", "README.md", "--exclude", "index.html.example", "--cache-control", "public,max-age=300")
if ($AllowRemoteDelete) { $SyncArgs += "--delete" }

aws @SyncArgs
if ($LASTEXITCODE -ne 0) { throw "S3 synchronization failed." }

aws cloudfront create-invalidation --distribution-id $DistributionId --paths "/*" | Out-Null
if ($LASTEXITCODE -ne 0) { throw "CloudFront invalidation failed." }

Write-Host "Deployment complete. CloudFront invalidation submitted."
