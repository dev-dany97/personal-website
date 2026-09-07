# Website source

Place the static website files in this directory. `index.html` must be located directly at:

```text
site/index.html
```

To import the current files from the existing bucket prefix `<PREFIX>/`, use the export script from the repository root.

The deployment scripts synchronize this directory to the root of the configured S3 bucket. Keeping the production files at the bucket root avoids spaces and origin-path ambiguity in CloudFront.
