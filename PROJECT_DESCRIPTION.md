# PixEcom v2.0 - OnePage OneProduct Store Builder System

## 🎯 Project Overview

**PixEcom v2.0** is a modern, enterprise-grade e-commerce platform designed specifically for creating high-converting single-product landing pages (sellpages) and managing multi-product stores. Built from the ground up with scalability, security, and developer experience in mind, it enables businesses to quickly launch and manage product-focused e-commerce sites with advanced page building capabilities.

### **Core Value Proposition**
- 🚀 **Rapid Deployment**: Launch professional product landing pages in minutes
- 🎨 **Visual Page Builder**: Drag-and-drop sections without coding
- 🏢 **Multi-Tenancy**: Workspace-based isolation for agencies and teams
- 💳 **Payment Ready**: Integrated Stripe, PayPal, and Tazapay support
- 📊 **Performance Focused**: Optimized for conversion with built-in A/B testing capabilities
- 🔒 **Enterprise Security**: JWT authentication, role-based access, encrypted credentials

---

## 🏗️ Architecture

### **Technology Stack**

#### **Backend (NestJS)**
- **Framework**: NestJS 10.4 (Node.js + TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (access + refresh tokens with rotation)
- **Caching**: Redis for sessions and rate limiting
- **API Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, throttling, AES-256-GCM encryption

#### **Frontend (Next.js)**
- **Framework**: Next.js 14.1 (App Router)
- **UI Library**: React 18.2 with TypeScript
- **Styling**: Tailwind CSS 3.4 + CVA (Class Variance Authority)
- **State Management**: Zustand for lightweight global state
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Payment UI**: Stripe React components

#### **Infrastructure**
- **Monorepo**: Turborepo + pnpm workspaces
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx (production)
- **Package Manager**: pnpm 9.15.0
- **Node Version**: 20+

---

## 📦 Project Structure

```
D:\Pixel Team\NEW-PixEcom\Rebuild/
├── apps/
│   ├── api/                    # NestJS Backend (Port 3001)
│   │   ├── src/
│   │   │   ├── common/         # Shared utilities, decorators, filters
│   │   │   ├── modules/        # Feature modules (13 modules)
│   │   │   │   ├── auth/       # Authentication & authorization
│   │   │   │   ├── users/      # User management
│   │   │   │   ├── workspaces/ # Multi-tenant workspace management
│   │   │   │   ├── stores/     # Store configuration
│   │   │   │   ├── products/   # Product catalog with variants
│   │   │   │   ├── sellpages/  # Landing page builder
│   │   │   │   ├── cart/       # Shopping cart (session-based)
│   │   │   │   ├── checkout/   # Checkout flow
│   │   │   │   ├── orders/     # Order management
│   │   │   │   ├── payments/   # Payment provider integration
│   │   │   │   ├── settings/   # Workspace settings
│   │   │   │   ├── legal/      # Legal policies (refund, shipping, privacy)
│   │   │   │   ├── public/     # Public storefront API
│   │   │   │   └── health/     # Health check endpoints
│   │   │   ├── prisma/         # Database schema & migrations
│   │   │   └── main.ts         # Application entry point
│   │   └── package.json
│   │
│   └── web/                    # Next.js Frontend (Port 3000)
│       ├── src/
│       │   ├── app/            # Next.js App Router pages
│       │   │   ├── (auth)/     # Auth pages (login, register)
│       │   │   ├── admin/      # Admin dashboard
│       │   │   │   ├── dashboard/
│       │   │   │   ├── products/
│       │   │   │   ├── orders/
│       │   │   │   ├── sellpages/
│       │   │   │   └── settings/
│       │   │   └── layout.tsx
│       │   ├── components/     # Reusable React components
│       │   │   ├── ui/         # Base UI components
│       │   │   └── admin/      # Admin-specific components
│       │   ├── stores/         # Zustand state stores
│       │   ├── lib/            # Utilities & API client
│       │   └── styles/         # Global styles
│       └── package.json
│
├── packages/
│   └── shared/                 # Shared TypeScript types & constants
│       ├── src/
│       │   ├── types/          # Common type definitions
│       │   └── constants/      # Shared constants
│       └── package.json
│
├── nginx/                      # Nginx configuration for production
├── docker-compose.yml          # Development environment
├── docker-compose.prod.yml     # Production environment
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # pnpm workspace definition
├── .env                        # Environment variables
└── package.json                # Root package.json
```

---

## 🎨 Key Features

### **1. Multi-Tenant Workspace System**
- **Workspace Isolation**: Complete data separation per workspace
- **Role-Based Access Control (RBAC)**: 4 roles - OWNER, ADMIN, EDITOR, VIEWER
- **Team Collaboration**: Invite members with granular permissions
- **Workspace Context**: All API requests scoped via `X-Workspace-Id` header

### **2. Advanced Product Management**
- **Product Variants**: Unlimited variants with custom options (size, color, etc.)
- **Inventory Tracking**: Real-time stock management per variant
- **Media Gallery**: Multiple product images with ordering
- **Pricing**: Base price, compare-at price, cost price, variant overrides
- **Rich Descriptions**: HTML editor + structured description blocks
- **SEO Optimization**: Meta titles, descriptions, and slugs
- **Tags & Categories**: Flexible product organization

### **3. Visual Sellpage Builder**
- **Section-Based Architecture**: JSON-driven page composition
- **Pre-Built Sections**:
  - Announcement Bar
  - Hero Section (with badge, pricing display)
  - Features Grid
  - Problem/Solution Sections
  - Social Proof (reviews, ratings)
  - FAQ Accordion
  - Sticky CTA
  - Custom HTML/Content blocks
- **Customization**: Per-section visibility, positioning, and configuration
- **Templates**: Pre-designed layouts for quick starts
- **Boost Modules**: Trust badges, urgency timers, scarcity indicators
- **Discount Rules**: Quantity-based automatic discounts

### **4. Store Management**
- **Multi-Store Support**: Multiple stores per workspace
- **Custom Domains**: Primary domain + subdomain routing
- **Branding**: Logo, favicon, brand colors
- **Homepage Builder**: Same section system as sellpages
- **Theme Configuration**: Global styling options
- **SEO Settings**: Store-level meta configuration

### **5. Smart Shopping Cart**
- **Session-Based**: Cookie-backed cart (no login required)
- **Auto-Merge**: Guest cart persists after login
- **Variant Selection**: Full support for product variants
- **Real-Time Updates**: Instant price calculations
- **Discount Application**: Automatic quantity discounts

### **6. Checkout & Orders**
- **Multi-Step Checkout**: Customer info → Shipping → Payment
- **Address Validation**: Real-time address verification
- **Multiple Payment Methods**: Stripe, PayPal, Tazapay
- **Order Tracking**: Real-time status updates
- **Order Management**: Admin dashboard for fulfillment
- **Email Notifications**: Automated order confirmations (ready for integration)

### **7. Payment Integration**
- **Secure Credentials**: AES-256-GCM encryption for API keys
- **Multiple Providers**: Stripe, PayPal, Tazapay support
- **Default Provider**: Automatic provider selection
- **Webhook Handling**: Real-time payment status updates
- **Test Mode**: Separate test/production credentials

### **8. Authentication & Security**
- **JWT Authentication**: Access tokens (15min) + refresh tokens (7d)
- **Refresh Token Rotation**: Database-backed token management
- **Password Security**: Bcrypt hashing (12 rounds)
- **HTTP-Only Cookies**: Secure refresh token storage
- **Rate Limiting**: API throttling to prevent abuse
- **CORS Protection**: Configurable origin whitelisting
- **Helmet Security**: HTTP header protection
- **Superadmin Role**: System-wide administrative access

### **9. Legal & Compliance**
- **Policy Management**: Refund, Shipping, Privacy policies
- **Per-Store Policies**: Attach specific policies to stores
- **Version Control**: Track policy updates
- **Display Order**: Control policy visibility order

### **10. Developer Experience**
- **TypeScript First**: Full type safety across the stack
- **API Documentation**: Auto-generated Swagger docs
- **Development Mode**: Auto-login, hot reload, debugging
- **Database Tools**: Prisma Studio for visual database management
- **Seed Data**: Quick setup with realistic demo data
- **Error Handling**: Structured error responses with validation details
- **Code Organization**: Module-based architecture for maintainability

---

## 🗄️ Database Schema

### **Core Entities**

#### **User & Workspace Management**
- `User` - User accounts with authentication
- `Workspace` - Tenant isolation units
- `Membership` - User-workspace relationships with roles
- `RefreshToken` - Secure token rotation

#### **Store & Products**
- `Store` - Store configurations with branding
- `Product` - Product catalog
- `ProductVariant` - Product variations
- `ProductMedia` - Product images/videos

#### **Pages & Content**
- `Sellpage` - Landing pages with sections
- `LegalPolicy` - Legal documents
- `StorePolicy` - Policy assignments
- `GeneralSettings` - Workspace-level settings

#### **Commerce**
- `Cart` - Shopping carts
- `CartItem` - Cart line items
- `Order` - Customer orders
- `OrderItem` - Order line items
- `PaymentProvider` - Payment integrations

### **Data Types**
- **IDs**: UUID primary keys everywhere
- **Decimals**: Prisma Decimal for precise currency handling
- **JSON**: Flexible configuration storage (sections, settings)
- **Timestamps**: Auto-managed createdAt/updatedAt

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 20+ (LTS recommended)
- pnpm 9.15.0
- Docker & Docker Compose (for PostgreSQL + Redis)
- Git

### **Quick Start**

1. **Clone & Install**
```bash
cd "D:\Pixel Team\NEW-PixEcom\Rebuild"
pnpm install
```

2. **Environment Setup**
```bash
# .env file already configured with development defaults
# Key settings:
# - DATABASE_URL: PostgreSQL connection
# - JWT_SECRET: Authentication secret
# - PAYMENT_ENCRYPTION_KEY: Payment credential encryption
# - DEV_MODE=true: Auto-login + debugging enabled
```

3. **Start Services**
```bash
# Start PostgreSQL + Redis
docker-compose up -d

# Push database schema
pnpm db:push

# Seed demo data
pnpm db:seed

# Start development servers
pnpm dev
```

4. **Access Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs
- **Prisma Studio**: `pnpm db:studio` → http://localhost:5555

### **Default Credentials**
With `DEV_MODE=true`:
- **Auto-login**: Enabled (no credentials needed)
- **Manual Login**:
  - Email: `admin@pixecom.io`
  - Password: `Admin123!`

### **Demo Data Included**
- ✅ 1 Superadmin user
- ✅ 1 Workspace ("Pixel Team")
- ✅ 1 Store ("Lilly Goodies")
- ✅ 2 Products (FlexFit Compression Shirt, AquaPure Water Bottle)
- ✅ 2 Sellpages (fully configured with sections)
- ✅ 2 Sample orders
- ✅ 3 Legal policies
- ✅ 1 Payment provider (Stripe test mode)

---

## 📋 Available Scripts

### **Root Level**
```bash
pnpm dev              # Start all apps in development mode
pnpm build            # Build all apps for production
pnpm lint             # Run linters across all packages

# Database Management
pnpm db:generate      # Generate Prisma Client
pnpm db:migrate       # Create and apply migrations
pnpm db:push          # Push schema changes (dev only)
pnpm db:seed          # Seed database with demo data
pnpm db:studio        # Open Prisma Studio (DB GUI)
```

### **Backend (apps/api)**
```bash
pnpm --filter api dev         # Start API in watch mode
pnpm --filter api build       # Build for production
pnpm --filter api start:prod  # Run production build
```

### **Frontend (apps/web)**
```bash
pnpm --filter @pixecom/web dev    # Start Next.js dev server
pnpm --filter @pixecom/web build  # Build for production
pnpm --filter @pixecom/web start  # Run production build
```

---

## 🔐 Security Features

### **Authentication Flow**
1. User logs in with email/password
2. Backend validates credentials (bcrypt)
3. Issues JWT access token (15min expiry)
4. Issues refresh token (7 days, stored in DB)
5. Refresh token sent as HTTP-only cookie
6. Access token auto-refreshes before expiry
7. Logout invalidates refresh token in database

### **Authorization**
- **Public Routes**: `@Public()` decorator bypasses auth
- **Protected Routes**: Require valid JWT
- **Workspace Scoping**: `@CurrentWorkspace()` decorator
- **Role Guards**: `@Roles(MemberRole.ADMIN)` enforces permissions
- **Superadmin**: Bypasses workspace restrictions

### **Data Protection**
- **Payment Credentials**: AES-256-GCM encryption at rest
- **Passwords**: Bcrypt with salt rounds = 12
- **Session Tokens**: Secure, HTTP-only cookies
- **API Rate Limiting**: Throttling to prevent abuse
- **CORS**: Configurable origin whitelisting
- **SQL Injection**: Prevented by Prisma ORM
- **XSS Protection**: Helmet middleware

---

## 🏢 Multi-Tenancy Architecture

### **Workspace Isolation**
Every data-modifying operation requires workspace context:

```typescript
// Backend: Workspace extracted from header
@Get('products')
async getProducts(@CurrentWorkspace() workspace: Workspace) {
  return this.productsService.findAll(workspace.id);
}

// Frontend: API client auto-adds header
headers['X-Workspace-Id'] = workspaceId;
```

### **Role Hierarchy**
1. **OWNER**: Full control, can delete workspace, manage billing
2. **ADMIN**: Can manage all resources, invite members
3. **EDITOR**: Can create/edit products, orders, pages
4. **VIEWER**: Read-only access to all resources

### **Superadmin Override**
- System-wide access across all workspaces
- Can impersonate any workspace
- Access to platform-level settings
- Enabled via `isSuperadmin` flag on User model

---

## 🎯 Use Cases

### **1. Solo Entrepreneurs**
- Launch single-product landing pages
- Manage orders and fulfillment
- Accept payments with minimal setup

### **2. Small E-Commerce Businesses**
- Build multi-product stores
- Create dedicated landing pages for each product
- A/B test different page layouts

### **3. Marketing Agencies**
- Manage multiple client workspaces
- White-label sellpages
- Team collaboration with role-based access

### **4. SaaS Companies**
- Sell digital products with landing pages
- Integrate with existing payment flows
- Customize checkout experience

### **5. Dropshippers**
- Quick product testing with dedicated pages
- Low overhead store management
- Integrated order tracking

---

## 🔄 Previous Versions

### **v1.5 (Python/FastAPI)**
- Located at: `D:\Pixel Team\PixEcom_v1_5/` and `PixEcom_v1_5_3/`
- Technology: Python, FastAPI, SQLAlchemy
- Status: Legacy, replaced by v2.0

### **v2.0 (Current - TypeScript/NestJS)**
- Complete rewrite in TypeScript
- Modern architecture with better scalability
- Enhanced developer experience
- Improved type safety and maintainability

---

## 📊 API Modules (13 Total)

1. **auth** - Authentication & authorization
2. **users** - User management
3. **workspaces** - Multi-tenant workspaces
4. **stores** - Store configuration
5. **products** - Product catalog
6. **sellpages** - Landing page builder
7. **cart** - Shopping cart
8. **checkout** - Checkout flow
9. **orders** - Order management
10. **payments** - Payment processing
11. **settings** - Workspace settings
12. **legal** - Legal policies
13. **public** - Public storefront API
14. **health** - Health checks

---

## 🎨 Frontend Pages

### **Authentication**
- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Password recovery

### **Admin Dashboard**
- `/admin` - Dashboard overview
- `/admin/products` - Product management
- `/admin/products/new` - Create product
- `/admin/products/[id]/edit` - Edit product
- `/admin/orders` - Order management
- `/admin/orders/[id]` - Order details
- `/admin/sellpages` - Sellpage management
- `/admin/sellpages/new` - Create sellpage
- `/admin/sellpages/[id]/edit` - Edit sellpage
- `/admin/settings` - Workspace settings
- `/admin/settings/general` - General settings
- `/admin/settings/payments` - Payment providers
- `/admin/settings/team` - Team management
- `/admin/settings/legal` - Legal policies

---

## 🚀 Deployment

### **Production Build**
```bash
# Build all packages
pnpm build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### **Environment Variables (Production)**
```bash
# Update these in production:
NODE_ENV=production
DEV_MODE=false
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<another-strong-secret>
PAYMENT_ENCRYPTION_KEY=<64-char-hex-string>
DATABASE_URL=<production-postgres-url>
REDIS_URL=<production-redis-url>
```

### **Nginx Reverse Proxy**
- Configured in `nginx/` directory
- Routes `/api/*` to backend (port 3001)
- Routes everything else to frontend (port 3000)

---

## 🔧 Development Patterns

### **Backend Patterns**
```typescript
// Public route (no auth required)
@Public()
@Get('public/product/:slug')
async getProduct(@Param('slug') slug: string) {}

// Protected route with workspace context
@Get('products')
async getProducts(@CurrentWorkspace() workspace: Workspace) {}

// Role-based access
@Roles(MemberRole.ADMIN)
@Delete('products/:id')
async deleteProduct(@Param('id') id: string) {}

// Current user access
@Get('profile')
async getProfile(@CurrentUser() user: User) {}
```

### **Frontend Patterns**
```typescript
// API client with auto-retry and token refresh
const products = await apiClient.get<Product[]>('/products');

// Zustand store usage
const { user, workspace, login, logout } = useAuthStore();

// Protected page (requires auth)
export default function AdminPage() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) redirect('/login');
  // ...
}
```

---

## 📈 Future Roadmap (Phase 2+)

- [ ] **Analytics Dashboard**: Sales metrics, conversion tracking
- [ ] **Email Marketing**: Abandoned cart recovery, newsletters
- [ ] **A/B Testing**: Built-in split testing for sellpages
- [ ] **Affiliate System**: Partner/referral tracking
- [ ] **Inventory Alerts**: Low stock notifications
- [ ] **Multi-Currency**: Dynamic currency conversion
- [ ] **Shipping Integration**: Real-time shipping rates
- [ ] **Customer Portal**: Order tracking, account management
- [ ] **Webhooks**: Real-time event notifications
- [ ] **API Rate Plans**: Usage-based billing
- [ ] **Mobile App**: React Native companion app
- [ ] **Advanced SEO**: Structured data, sitemaps
- [ ] **Live Chat**: Customer support integration
- [ ] **Product Reviews**: Customer feedback system
- [ ] **Subscription Products**: Recurring billing

---

## 🤝 Contributing

This is a private project by **Pixel Team**. Internal contributions should follow:
- TypeScript strict mode
- ESLint + Prettier code style
- Conventional commits
- PR review before merge
- Unit tests for business logic
- E2E tests for critical flows

---

## 📄 License

Proprietary - All Rights Reserved
© 2026 Pixel Team

---

## 👥 Project Team

- **Tech Lead/Architect**: Responsible for architecture and technical decisions
- **Backend Team**: NestJS API development
- **Frontend Team**: Next.js UI development
- **DevOps**: Infrastructure and deployment

---

## 📞 Support

For internal support:
- **Documentation**: This README and inline code comments
- **API Docs**: http://localhost:3001/api/docs (dev mode)
- **Database GUI**: `pnpm db:studio`
- **Issues**: Internal issue tracker

---

## 🏆 Project Status

**Phase 1: ✅ COMPLETE**
- All 13 backend modules implemented
- Core frontend pages (auth, dashboard, products, orders, settings)
- Docker containerization
- Database schema with seed data
- Authentication & authorization
- Multi-tenant workspace system

**Phase 2: 📋 PLANNED**
- Advanced analytics
- Email automation
- Enhanced page builder
- Customer portal
- Marketing integrations

---

**Built with ❤️ by Pixel Team**
