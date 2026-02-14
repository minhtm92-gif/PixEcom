#!/bin/bash
# Quick deployment script for Cloudflare Pages

set -e

echo "🚀 Deploying PixEcom to Cloudflare Pages..."

# Navigate to web app
cd apps/web

# Build the Next.js app
echo "📦 Building Next.js application..."
pnpm install
pnpm build

# Deploy to Cloudflare Pages
echo "☁️  Deploying to Cloudflare..."
wrangler pages deploy .next --project-name=pixecom-web

echo "✅ Deployment complete!"
echo "🌐 Your site will be available at: https://pixecom-web.pages.dev"
