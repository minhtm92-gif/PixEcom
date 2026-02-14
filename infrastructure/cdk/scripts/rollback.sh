#!/bin/bash

# CloudFront CDN Rollback Script
# This script helps rollback to a previous CloudFormation stack version

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CDK_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 PixEcom CDN Rollback${NC}"
echo "=========================="
echo ""

# Load environment variables
if [ -f "$CDK_DIR/.env" ]; then
    source "$CDK_DIR/.env"
fi

ENVIRONMENT=${1:-${ENVIRONMENT:-production}}
STACK_NAME="pixecom-cdn-$ENVIRONMENT"

echo "Environment: $ENVIRONMENT"
echo "Stack Name: $STACK_NAME"
echo ""

# Check if stack exists
if ! aws cloudformation describe-stacks --stack-name $STACK_NAME &> /dev/null; then
    echo -e "${RED}❌ Error: Stack $STACK_NAME does not exist${NC}"
    exit 1
fi

# Get current stack status
CURRENT_STATUS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].StackStatus' \
    --output text)

echo -e "${GREEN}Current Stack Status: $CURRENT_STATUS${NC}"
echo ""

# List recent stack events
echo "📜 Recent Stack Events:"
echo "======================="
aws cloudformation describe-stack-events \
    --stack-name $STACK_NAME \
    --max-items 10 \
    --query 'StackEvents[*].[Timestamp,ResourceStatus,ResourceType,LogicalResourceId]' \
    --output table

echo ""

# Check if stack is in a failed state
if [[ $CURRENT_STATUS == *"FAILED"* ]] || [[ $CURRENT_STATUS == *"ROLLBACK"* ]]; then
    echo -e "${YELLOW}⚠️  Stack is in a failed state: $CURRENT_STATUS${NC}"
    echo ""
    echo "Options:"
    echo "1. Continue with rollback to previous version"
    echo "2. Delete and recreate stack (data loss possible)"
    echo "3. Cancel"
    echo ""
    read -p "Select option (1-3): " option

    case $option in
        1)
            echo "Proceeding with rollback..."
            ;;
        2)
            echo -e "${RED}⚠️  WARNING: This will delete the stack!${NC}"
            read -p "Are you sure? Type 'DELETE' to confirm: " confirm
            if [ "$confirm" != "DELETE" ]; then
                echo "Cancelled."
                exit 0
            fi

            echo "Deleting stack..."
            aws cloudformation delete-stack --stack-name $STACK_NAME

            echo "Waiting for stack deletion..."
            aws cloudformation wait stack-delete-complete --stack-name $STACK_NAME

            echo -e "${GREEN}✅ Stack deleted successfully${NC}"
            echo ""
            echo "To recreate the stack, run:"
            echo "  cd $CDK_DIR"
            echo "  npm run deploy:cdn"
            exit 0
            ;;
        3)
            echo "Cancelled."
            exit 0
            ;;
        *)
            echo "Invalid option."
            exit 1
            ;;
    esac
fi

# Get stack template history
echo "📚 Available Stack Versions:"
echo "============================"

CHANGE_SETS=$(aws cloudformation list-change-sets \
    --stack-name $STACK_NAME \
    --query 'Summaries[?Status==`CREATE_COMPLETE`].[ChangeSetName,CreationTime]' \
    --output text 2>/dev/null || echo "")

if [ -z "$CHANGE_SETS" ]; then
    echo -e "${YELLOW}No change sets available for rollback${NC}"
    echo ""
    echo "Note: CloudFormation doesn't automatically save change history."
    echo "For rollback capability, you need to:"
    echo "1. Use git to revert infrastructure code changes"
    echo "2. Redeploy using: npm run deploy:cdn"
    echo ""
    echo "Alternative: Manual rollback steps"
    echo "==================================="
    echo "1. Identify the last working infrastructure code version in git"
    echo "2. Checkout that version: git checkout <commit-hash> -- infrastructure/cdk/"
    echo "3. Deploy: cd infrastructure/cdk && npm run deploy:cdn"
    echo ""
    exit 0
fi

echo "$CHANGE_SETS"
echo ""

# Get current CloudFront distribution ID
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' \
    --output text 2>/dev/null || echo "")

if [ -n "$DISTRIBUTION_ID" ]; then
    echo "Current Distribution ID: $DISTRIBUTION_ID"

    # Get current distribution config
    CURRENT_ETAG=$(aws cloudfront get-distribution-config \
        --id $DISTRIBUTION_ID \
        --query 'ETag' \
        --output text)

    echo "Current ETag: $CURRENT_ETAG"
fi

echo ""
echo -e "${YELLOW}⚠️  Recommended Rollback Process:${NC}"
echo "=================================="
echo ""
echo "1. Save current distribution ID: $DISTRIBUTION_ID"
echo "2. Identify the commit with working infrastructure code"
echo "3. Checkout that version:"
echo "   git log --oneline infrastructure/cdk/"
echo "   git checkout <commit-hash> -- infrastructure/cdk/"
echo "4. Redeploy the stack:"
echo "   cd infrastructure/cdk"
echo "   npm run build"
echo "   npm run deploy:cdn"
echo "5. Verify the deployment"
echo "6. Invalidate cache if needed:"
echo "   ./scripts/invalidate-cache.sh"
echo ""

read -p "Do you want to see the git history for infrastructure? (y/n): " show_git

if [ "$show_git" == "y" ]; then
    echo ""
    echo "📖 Recent Infrastructure Changes:"
    echo "=================================="
    git log --oneline --graph --decorate -10 -- infrastructure/cdk/
    echo ""
fi

echo ""
echo -e "${GREEN}💡 Tips:${NC}"
echo "- Always test in staging before rolling back production"
echo "- Keep notes of working commit hashes"
echo "- Consider using git tags for releases: git tag -a cdn-v1.0"
echo "- Monitor CloudWatch during rollback"
echo ""

echo -e "${YELLOW}To proceed with rollback:${NC}"
echo "1. Identify the working commit hash"
echo "2. Run: git checkout <commit-hash> -- infrastructure/cdk/"
echo "3. Run: cd infrastructure/cdk && npm run deploy:cdn"
echo ""
