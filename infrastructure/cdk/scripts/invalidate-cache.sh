#!/bin/bash

# CloudFront Cache Invalidation Script
# Invalidates all cached content in the CloudFront distribution

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CDK_DIR="$(dirname "$SCRIPT_DIR")"

# Load environment variables
if [ -f "$CDK_DIR/.env" ]; then
    source "$CDK_DIR/.env"
fi

ENVIRONMENT=${ENVIRONMENT:-production}
STACK_NAME="pixecom-cdn-$ENVIRONMENT"

echo "🔄 CloudFront Cache Invalidation"
echo "================================="

# Get distribution ID from CloudFormation stack
echo "📡 Fetching CloudFront distribution ID..."
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' \
    --output text)

if [ -z "$DISTRIBUTION_ID" ]; then
    echo "❌ Error: Could not find distribution ID for stack $STACK_NAME"
    exit 1
fi

echo "📋 Distribution ID: $DISTRIBUTION_ID"

# Determine paths to invalidate
PATHS=${1:-"/*"}
echo "🎯 Invalidating paths: $PATHS"

# Create invalidation
echo "⏳ Creating invalidation..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "$PATHS" \
    --query 'Invalidation.Id' \
    --output text)

echo "✅ Invalidation created: $INVALIDATION_ID"
echo ""
echo "💡 To check status:"
echo "   aws cloudfront get-invalidation --distribution-id $DISTRIBUTION_ID --id $INVALIDATION_ID"
