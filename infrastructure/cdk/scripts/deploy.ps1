# PixEcom CDN Deployment Script (PowerShell)
# This script deploys the CloudFront CDN infrastructure

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$CdkDir = Split-Path -Parent $ScriptDir

Write-Host "🚀 PixEcom CDN Deployment" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
$EnvFile = Join-Path $CdkDir ".env"
if (-not (Test-Path $EnvFile)) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env and configure your settings." -ForegroundColor Yellow
    exit 1
}

# Load environment variables
Get-Content $EnvFile | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

$AwsAccountId = $env:AWS_ACCOUNT_ID
$AwsRegion = $env:AWS_REGION
$OriginDomain = $env:ORIGIN_DOMAIN
$Environment = if ($env:ENVIRONMENT) { $env:ENVIRONMENT } else { "production" }

# Validate required variables
if (-not $AwsAccountId -or -not $AwsRegion) {
    Write-Host "❌ Error: AWS_ACCOUNT_ID and AWS_REGION must be set in .env" -ForegroundColor Red
    exit 1
}

if (-not $OriginDomain) {
    Write-Host "❌ Error: ORIGIN_DOMAIN must be set in .env" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Configuration:" -ForegroundColor Green
Write-Host "  AWS Account: $AwsAccountId"
Write-Host "  AWS Region: $AwsRegion"
Write-Host "  Origin Domain: $OriginDomain"
Write-Host "  Environment: $Environment"
Write-Host ""

# Install dependencies if needed
$NodeModulesDir = Join-Path $CdkDir "node_modules"
if (-not (Test-Path $NodeModulesDir)) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    Push-Location $CdkDir
    npm install
    Pop-Location
}

# Build TypeScript
Write-Host "🔨 Building CDK project..." -ForegroundColor Yellow
Push-Location $CdkDir
npm run build

# Bootstrap CDK (if not already done)
Write-Host "🎯 Checking CDK bootstrap..." -ForegroundColor Yellow
try {
    cdk bootstrap "aws://$AwsAccountId/$AwsRegion"
} catch {
    Write-Host "Bootstrap may already exist, continuing..." -ForegroundColor Gray
}

# Synthesize CloudFormation template
Write-Host "📝 Synthesizing CloudFormation template..." -ForegroundColor Yellow
npm run synth

# Show what will be deployed
Write-Host "🔍 Showing deployment diff..." -ForegroundColor Yellow
try {
    npm run diff
} catch {
    Write-Host "No differences or first deployment" -ForegroundColor Gray
}

# Ask for confirmation
$confirm = Read-Host "Do you want to proceed with deployment? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "❌ Deployment cancelled." -ForegroundColor Red
    Pop-Location
    exit 0
}

# Deploy
Write-Host "🚀 Deploying CDN stack..." -ForegroundColor Green
npm run deploy:cdn

Pop-Location

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 To view outputs:" -ForegroundColor Cyan
Write-Host "   aws cloudformation describe-stacks --stack-name pixecom-cdn-$Environment --query 'Stacks[0].Outputs'" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 CloudFront distribution URL will be shown in the outputs above" -ForegroundColor Cyan
