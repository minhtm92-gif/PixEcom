#!/bin/bash

# PixEcom CDN Deployment Script
# This script deploys the CloudFront CDN infrastructure

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CDK_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 PixEcom CDN Deployment"
echo "=========================="

# Check if .env exists
if [ ! -f "$CDK_DIR/.env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure your settings."
    exit 1
fi

# Load environment variables
source "$CDK_DIR/.env"

# Validate required variables
if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$AWS_REGION" ]; then
    echo "❌ Error: AWS_ACCOUNT_ID and AWS_REGION must be set in .env"
    exit 1
fi

if [ -z "$ORIGIN_DOMAIN" ]; then
    echo "❌ Error: ORIGIN_DOMAIN must be set in .env"
    exit 1
fi

echo "📋 Configuration:"
echo "  AWS Account: $AWS_ACCOUNT_ID"
echo "  AWS Region: $AWS_REGION"
echo "  Origin Domain: $ORIGIN_DOMAIN"
echo "  Environment: ${ENVIRONMENT:-production}"
echo ""

# Install dependencies if needed
if [ ! -d "$CDK_DIR/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd "$CDK_DIR"
    npm install
fi

# Build TypeScript
echo "🔨 Building CDK project..."
cd "$CDK_DIR"
npm run build

# Bootstrap CDK (if not already done)
echo "🎯 Checking CDK bootstrap..."
cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_REGION || true

# Synthesize CloudFormation template
echo "📝 Synthesizing CloudFormation template..."
npm run synth

# Show what will be deployed
echo "🔍 Showing deployment diff..."
npm run diff || true

# Ask for confirmation
read -p "Do you want to proceed with deployment? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled."
    exit 0
fi

# Deploy
echo "🚀 Deploying CDN stack..."
npm run deploy:cdn

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 To view outputs:"
echo "   aws cloudformation describe-stacks --stack-name pixecom-cdn-${ENVIRONMENT:-production} --query 'Stacks[0].Outputs'"
echo ""
echo "🔗 CloudFront distribution URL will be shown in the outputs above"
