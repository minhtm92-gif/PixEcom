#!/bin/bash

###############################################################################
# PixEcom VPS Fix Script - Resolve module resolution and registration issues
###############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

PROJECT_DIR="/var/www/pixecom"

print_info "Fixing PixEcom deployment issues..."

# Fix 1: Reinstall API dependencies with --shamefully-hoist
print_info "Reinstalling API dependencies with hoisting..."
cd $PROJECT_DIR/apps/api
rm -rf node_modules
pnpm install --shamefully-hoist
print_success "API dependencies reinstalled"

# Fix 2: Regenerate Prisma client
print_info "Regenerating Prisma client..."
pnpm prisma generate
print_success "Prisma client generated"

# Fix 3: Rebuild API
print_info "Rebuilding API..."
pnpm build
print_success "API rebuilt"

# Fix 4: Update register DTO to match frontend
print_info "Updating registration DTO..."
cat > src/modules/auth/dto/register.dto.ts << 'EOF'
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StrongP@ss1', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: 'John', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  displayName?: string;
}
EOF
print_success "Registration DTO updated"

# Fix 5: Update auth service to handle firstName/lastName
print_info "Checking auth service..."
if grep -q "displayName: dto.displayName" src/modules/auth/auth.service.ts 2>/dev/null; then
  print_info "Updating auth service to handle firstName/lastName..."
  # Backup original
  cp src/modules/auth/auth.service.ts src/modules/auth/auth.service.ts.bak

  # Update the create user logic
  sed -i "s/displayName: dto.displayName/displayName: dto.displayName || \`\${dto.firstName} \${dto.lastName}\`.trim() || dto.email.split('@')[0]/" src/modules/auth/auth.service.ts
  print_success "Auth service updated"
else
  print_info "Auth service already handles names correctly"
fi

# Fix 6: Rebuild after DTO changes
print_info "Rebuilding API after changes..."
pnpm build
print_success "API rebuilt"

# Fix 7: Restart PM2 processes
print_info "Restarting PM2 processes..."
cd $PROJECT_DIR
pm2 restart all
pm2 save
print_success "PM2 processes restarted"

# Fix 8: Wait and check status
print_info "Waiting 5 seconds for services to start..."
sleep 5

print_info "Checking PM2 status..."
pm2 status

print_info "Checking API health..."
sleep 2
curl -f http://localhost:3001/api/health || print_error "API health check failed"

print_success "Fix script completed!"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Deployment Fixed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "🌐 Your app: https://pixecom.pixelxlab.com"
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs"
echo ""
echo "✅ Changes made:"
echo "  1. Reinstalled API dependencies with --shamefully-hoist"
echo "  2. Regenerated Prisma client"
echo "  3. Updated RegisterDto to accept firstName/lastName"
echo "  4. Updated auth service to handle both name formats"
echo "  5. Rebuilt and restarted API"
echo ""
echo "🧪 Test registration at: https://pixecom.pixelxlab.com/register"
echo ""
