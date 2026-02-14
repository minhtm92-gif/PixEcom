# CloudFront Cache Invalidation Script (PowerShell)
# Invalidates all cached content in the CloudFront distribution

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$CdkDir = Split-Path -Parent $ScriptDir

# Load environment variables
$EnvFile = Join-Path $CdkDir ".env"
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

$Environment = if ($env:ENVIRONMENT) { $env:ENVIRONMENT } else { "production" }
$StackName = "pixecom-cdn-$Environment"

Write-Host "🔄 CloudFront Cache Invalidation" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Get distribution ID from CloudFormation stack
Write-Host "📡 Fetching CloudFront distribution ID..." -ForegroundColor Yellow
$DistributionId = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' `
    --output text

if (-not $DistributionId) {
    Write-Host "❌ Error: Could not find distribution ID for stack $StackName" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Distribution ID: $DistributionId" -ForegroundColor Green

# Determine paths to invalidate
$Paths = if ($args.Count -gt 0) { $args[0] } else { "/*" }
Write-Host "🎯 Invalidating paths: $Paths" -ForegroundColor Yellow

# Create invalidation
Write-Host "⏳ Creating invalidation..." -ForegroundColor Yellow
$InvalidationId = aws cloudfront create-invalidation `
    --distribution-id $DistributionId `
    --paths $Paths `
    --query 'Invalidation.Id' `
    --output text

Write-Host "✅ Invalidation created: $InvalidationId" -ForegroundColor Green
Write-Host ""
Write-Host "💡 To check status:" -ForegroundColor Cyan
Write-Host "   aws cloudfront get-invalidation --distribution-id $DistributionId --id $InvalidationId" -ForegroundColor Gray
