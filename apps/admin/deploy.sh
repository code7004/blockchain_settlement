#!/bin/bash

BUCKET=chain-wallet-host
DIST_ID=E3SR929TFP96S5

aws s3 cp dist/assets s3://$BUCKET/assets \
  --recursive \
  --cache-control "public, max-age=31536000, immutable"

aws s3 cp dist/index.html s3://$BUCKET/index.html \
  --cache-control "no-cache, no-store, must-revalidate"

aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --paths "/*"