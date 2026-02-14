# CloudFront CDN Rollback Script (PowerShell)
# This script helps rollback to a previous CloudFormation stack version

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$CdkDir = Split-Path -Parent $ScriptDir

Write-Host "🔄 PixEcom CDN Rollback" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host ""

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

$Environment = if ($args.Count -gt 0) { $args[0] } elseif ($env:ENVIRONMENT) { $env:ENVIRONMENT } else { "production" }
$StackName = "pixecom-cdn-$Environment"

Write-Host "Environment: $Environment" -ForegroundColor Green
Write-Host "Stack Name: $StackName" -ForegroundColor Green
Write-Host ""

# Check if stack exists
try {
    $StackExists = aws cloudformation describe-stacks --stack-name $StackName 2>$null
    if (-not $StackExists) {
        throw "Stack does not exist"
    }
} catch {
    Write-Host "❌ Error: Stack $StackName does not exist" -ForegroundColor Red
    exit 1
}

# Get current stack status
$CurrentStatus = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --query 'Stacks[0].StackStatus' `
    --output text

Write-Host "Current Stack Status: $CurrentStatus" -ForegroundColor Green
Write-Host ""

# List recent stack events
Write-Host "📜 Recent Stack Events:" -ForegroundColor Yellow
Write-Host "=======================" -ForegroundColor Yellow
aws cloudformation describe-stack-events `
    --stack-name $StackName `
    --max-items 10 `
    --query 'StackEvents[*].[Timestamp,ResourceStatus,ResourceType,LogicalResourceId]' `
    --output table

Write-Host ""

# Check if stack is in a failed state
if ($CurrentStatus -match "FAILED" -or $CurrentStatus -match "ROLLBACK") {
    Write-Host "⚠️  Stack is in a failed state: $CurrentStatus" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:"
    Write-Host "1. Continue with rollback to previous version"
    Write-Host "2. Delete and recreate stack (data loss possible)"
    Write-Host "3. Cancel"
    Write-Host ""
    $option = Read-Host "Select option (1-3)"

    switch ($option) {
        "1" {
            Write-Host "Proceeding with rollback..." -ForegroundColor Green
        }
        "2" {
            Write-Host "⚠️  WARNING: This will delete the stack!" -ForegroundColor Red
            $confirm = Read-Host "Are you sure? Type 'DELETE' to confirm"
            if ($confirm -ne "DELETE") {
                Write-Host "Cancelled." -ForegroundColor Yellow
                exit 0
            }

            Write-Host "Deleting stack..." -ForegroundColor Yellow
            aws cloudformation delete-stack --stack-name $StackName

            Write-Host "Waiting for stack deletion..." -ForegroundColor Yellow
            aws cloudformation wait stack-delete-complete --stack-name $StackName

            Write-Host "✅ Stack deleted successfully" -ForegroundColor Green
            Write-Host ""
            Write-Host "To recreate the stack, run:" -ForegroundColor Cyan
            Write-Host "  cd $CdkDir" -ForegroundColor Gray
            Write-Host "  npm run deploy:cdn" -ForegroundColor Gray
            exit 0
        }
        "3" {
            Write-Host "Cancelled." -ForegroundColor Yellow
            exit 0
        }
        default {
            Write-Host "Invalid option." -ForegroundColor Red
            exit 1
        }
    }
}

# Get stack template history
Write-Host "📚 Available Stack Versions:" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow

try {
    $ChangeSets = aws cloudformation list-change-sets `
        --stack-name $StackName `
        --query 'Summaries[?Status==`CREATE_COMPLETE`].[ChangeSetName,CreationTime]' `
        --output text 2>$null

    if (-not $ChangeSets) {
        Write-Host "No change sets available for rollback" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Note: CloudFormation doesn't automatically save change history." -ForegroundColor Gray
        Write-Host "For rollback capability, you need to:" -ForegroundColor Gray
        Write-Host "1. Use git to revert infrastructure code changes" -ForegroundColor Gray
        Write-Host "2. Redeploy using: npm run deploy:cdn" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Alternative: Manual rollback steps" -ForegroundColor Cyan
        Write-Host "===================================" -ForegroundColor Cyan
        Write-Host "1. Identify the last working infrastructure code version in git" -ForegroundColor Gray
        Write-Host "2. Checkout that version: git checkout <commit-hash> -- infrastructure/cdk/" -ForegroundColor Gray
        Write-Host "3. Deploy: cd infrastructure/cdk && npm run deploy:cdn" -ForegroundColor Gray
        Write-Host ""
        exit 0
    }

    Write-Host $ChangeSets
} catch {
    Write-Host "No change sets available" -ForegroundColor Yellow
}

Write-Host ""

# Get current CloudFront distribution ID
try {
    $DistributionId = aws cloudformation describe-stacks `
        --stack-name $StackName `
        --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' `
        --output text 2>$null

    if ($DistributionId) {
        Write-Host "Current Distribution ID: $DistributionId" -ForegroundColor Green

        # Get current distribution config
        $CurrentETag = aws cloudfront get-distribution-config `
            --id $DistributionId `
            --query 'ETag' `
            --output text

        Write-Host "Current ETag: $CurrentETag" -ForegroundColor Green
    }
} catch {
    Write-Host "Could not retrieve distribution information" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "⚠️  Recommended Rollback Process:" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Save current distribution ID: $DistributionId" -ForegroundColor Gray
Write-Host "2. Identify the commit with working infrastructure code" -ForegroundColor Gray
Write-Host "3. Checkout that version:" -ForegroundColor Gray
Write-Host "   git log --oneline infrastructure/cdk/" -ForegroundColor DarkGray
Write-Host "   git checkout <commit-hash> -- infrastructure/cdk/" -ForegroundColor DarkGray
Write-Host "4. Redeploy the stack:" -ForegroundColor Gray
Write-Host "   cd infrastructure/cdk" -ForegroundColor DarkGray
Write-Host "   npm run build" -ForegroundColor DarkGray
Write-Host "   npm run deploy:cdn" -ForegroundColor DarkGray
Write-Host "5. Verify the deployment" -ForegroundColor Gray
Write-Host "6. Invalidate cache if needed:" -ForegroundColor Gray
Write-Host "   .\scripts\invalidate-cache.ps1" -ForegroundColor DarkGray
Write-Host ""

$showGit = Read-Host "Do you want to see the git history for infrastructure? (y/n)"

if ($showGit -eq "y") {
    Write-Host ""
    Write-Host "📖 Recent Infrastructure Changes:" -ForegroundColor Yellow
    Write-Host "==================================" -ForegroundColor Yellow
    git log --oneline --graph --decorate -10 -- infrastructure/cdk/
    Write-Host ""
}

Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Green
Write-Host "- Always test in staging before rolling back production" -ForegroundColor Gray
Write-Host "- Keep notes of working commit hashes" -ForegroundColor Gray
Write-Host "- Consider using git tags for releases: git tag -a cdn-v1.0" -ForegroundColor Gray
Write-Host "- Monitor CloudWatch during rollback" -ForegroundColor Gray
Write-Host ""

Write-Host "To proceed with rollback:" -ForegroundColor Cyan
Write-Host "1. Identify the working commit hash" -ForegroundColor Gray
Write-Host "2. Run: git checkout <commit-hash> -- infrastructure/cdk/" -ForegroundColor Gray
Write-Host "3. Run: cd infrastructure/cdk && npm run deploy:cdn" -ForegroundColor Gray
Write-Host ""
