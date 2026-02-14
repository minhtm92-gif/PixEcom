#!/bin/bash
set -e

echo "🚀 Railway API Deployment Script"
echo "=================================="

# Validate required environment variables
if [ -z "$RAILWAY_TOKEN" ]; then
  echo "❌ ERROR: RAILWAY_TOKEN not set"
  exit 1
fi

if [ -z "$RAILWAY_PROJECT_ID" ]; then
  echo "❌ ERROR: RAILWAY_PROJECT_ID not set"
  exit 1
fi

if [ -z "$RAILWAY_SERVICE_ID" ]; then
  echo "❌ ERROR: RAILWAY_SERVICE_ID not set"
  exit 1
fi

if [ -z "$RAILWAY_ENVIRONMENT_ID" ]; then
  echo "❌ ERROR: RAILWAY_ENVIRONMENT_ID not set"
  exit 1
fi

echo "✅ Environment variables validated"
echo "📦 Project: $RAILWAY_PROJECT_ID"
echo "🔧 Service: $RAILWAY_SERVICE_ID"
echo "🌍 Environment: $RAILWAY_ENVIRONMENT_ID"

# Create deployment using Railway GraphQL API v2
echo ""
echo "🚂 Triggering deployment via Railway API..."

RESPONSE=$(curl -s -X POST "https://backboard.railway.com/graphql/v2" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"mutation serviceInstanceRedeploy(\$serviceId: String!, \$environmentId: String!) { serviceInstanceRedeploy(serviceId: \$serviceId, environmentId: \$environmentId) }\",
    \"variables\": {
      \"serviceId\": \"$RAILWAY_SERVICE_ID\",
      \"environmentId\": \"$RAILWAY_ENVIRONMENT_ID\"
    }
  }")

echo "📡 API Response:"
echo "$RESPONSE" | jq '.' || echo "$RESPONSE"

# Check if deployment was triggered successfully
if echo "$RESPONSE" | jq -e '.data.serviceInstanceRedeploy' > /dev/null 2>&1; then
  RESULT=$(echo "$RESPONSE" | jq -r '.data.serviceInstanceRedeploy')
  echo ""
  echo "✅ Deployment triggered successfully!"
  echo "🔄 Redeployment result: $RESULT"
  echo "🔗 View deployment: https://railway.app/project/$RAILWAY_PROJECT_ID/service/$RAILWAY_SERVICE_ID"
  echo ""
  echo "⏳ Railway is now building and deploying your backend..."
  echo "📍 Check Railway dashboard for real-time logs"
  echo "🌐 API will be available at: https://backend-production-46ad.up.railway.app"
  exit 0
elif echo "$RESPONSE" | jq -e '.errors' > /dev/null 2>&1; then
  echo ""
  echo "❌ Railway API returned errors:"
  echo "$RESPONSE" | jq -r '.errors[] | "- \(.message)"'
  exit 1
else
  echo ""
  echo "❌ Unexpected API response format"
  echo "Response: $RESPONSE"
  exit 1
fi
