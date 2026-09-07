param(
    [Parameter(Mandatory = $true)]
    [string]$BucketName,

    [string]$Prefix = ""
)

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$SiteDir = Join-Path $RepoRoot "site"
New-Item -ItemType Directory -Path $SiteDir -Force | Out-Null

aws sts get-caller-identity | Out-Null
if ($LASTEXITCODE -ne 0) { throw "AWS credentials are not available." }

$Source = "s3://$BucketName/"
if ($Prefix) {
    $Source = "s3://$BucketName/$($Prefix.TrimEnd('/'))/"
}

aws s3 sync $Source $SiteDir --exclude "README.md" --exclude "index.html.example"
if ($LASTEXITCODE -ne 0) { throw "S3 export failed." }

Write-Host "Export complete: $Source -> $SiteDir"
Write-Host "Review all files before committing them."
