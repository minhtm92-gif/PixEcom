#!/bin/bash
# Purge Cloudflare cache for your domain

# Replace with your values
ZONE_ID="your-zone-id"
API_TOKEN="your-api-token"

echo "🗑️  Purging Cloudflare cache..."

curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'

echo ""
echo "✅ Cache purged successfully!"
