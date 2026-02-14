# PixEcom v2.0

**OnePage OneProduct Store Builder System** - A modern, enterprise-grade e-commerce platform for creating high-converting product landing pages and managing multi-product stores.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.4-red)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.1-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-Proprietary-yellow)](LICENSE)

---

## 🌐 Deploy to Production (Cloudflare + CDN)

**📚 Deployment Guides:**
- **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** - ⚡ 5-minute deployment guide
- **[CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md)** - Complete Cloudflare setup
- **[DEPLOY_COMMANDS.md](DEPLOY_COMMANDS.md)** - CLI commands reference

```bash
# Deploy frontend to Cloudflare Pages (with automatic global CDN)
pnpm deploy:cloudflare

# Deploy API to Railway - see QUICK_DEPLOY.md for full instructions
```

**What you get:**
- ✅ **Global CDN** via Cloudflare (200+ locations)
- ✅ **Automatic SSL** certificates
- ✅ **Edge caching** for static assets
- ✅ **Auto deployments** from Git
- ✅ **$0-5/month** hosting cost

---

## 🚀 Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL + Redis
docker-compose up -d

# 3. Setup database
pnpm db:push
pnpm db:seed

# 4. Start dev servers
pnpm dev
```

**Access Points:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api/docs
- DB Studio: `pnpm db:studio`

**Default Login:**
- Email: `admin@pixecom.io`
- Password: `Admin123!`

---

## 📋 What's Included

✅ **Multi-tenant workspace system** with RBAC
✅ **Visual sellpage builder** with pre-built sections
✅ **Product management** with variants & inventory
✅ **Shopping cart** & checkout flow
✅ **Order management** dashboard
✅ **Payment integration** (Stripe, PayPal, Tazapay)
✅ **Authentication** (JWT + refresh tokens)
✅ **Legal policies** management
✅ **Admin dashboard** with full UI

---

## 🏗️ Tech Stack

**Backend:**
- NestJS 10.4 + TypeScript
- PostgreSQL + Prisma ORM
- Redis for caching
- JWT authentication
- Swagger/OpenAPI docs

**Frontend:**
- Next.js 14.1 (App Router)
- React 18.2 + TypeScript
- Tailwind CSS 3.4
- Zustand state management
- Stripe UI components

**Infrastructure:**
- Turborepo monorepo
- pnpm workspaces
- Docker + Docker Compose
- Nginx reverse proxy
- AWS CloudFront CDN (optional)

---

## 📁 Project Structure

```
.
├── apps/
│   ├── api/                # NestJS backend (13 modules)
│   └── web/                # Next.js frontend
├── packages/
│   └── shared/             # Shared types & constants
├── infrastructure/
│   └── cdk/                # AWS CDN infrastructure
├── nginx/                  # Nginx config
├── docker-compose.yml      # Dev environment
└── .env                    # Environment variables
```

---

## 🎯 Key Features

### **For Store Owners**
- Create unlimited sellpages with visual builder
- Manage products with variants and inventory
- Accept payments via multiple providers
- Track orders and fulfillment
- Configure store branding and domains

### **For Agencies**
- Multi-workspace support for clients
- Team collaboration with role-based access
- White-label sellpages
- Centralized order management

### **For Developers**
- TypeScript everywhere
- Auto-generated API docs
- Hot reload in dev mode
- Prisma Studio for DB management
- Modular architecture

---

## 📊 Database Schema

**Core Models:**
- User, Workspace, Membership (multi-tenancy)
- Store, Product, ProductVariant, ProductMedia
- Sellpage (with JSON sections)
- Cart, CartItem, Order, OrderItem
- PaymentProvider, LegalPolicy
- GeneralSettings

**Data Types:**
- UUID primary keys
- Prisma Decimal for currency
- JSON for flexible configs
- Auto timestamps

---

## 🔧 Development

### **Available Scripts**

```bash
# Development
pnpm dev              # Start all apps
pnpm build            # Build all apps
pnpm lint             # Lint all packages

# Database
pnpm db:generate      # Generate Prisma Client
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema (dev only)
pnpm db:seed          # Seed demo data
pnpm db:studio        # Open Prisma Studio

# Individual apps
pnpm --filter api dev           # Backend only
pnpm --filter @pixecom/web dev  # Frontend only
```

### **Environment Variables**

Key settings in `.env`:
```bash
# Database
DATABASE_URL=postgresql://pixecom:pixecom_dev@localhost:5434/pixecom

# Auth
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# App
DEV_MODE=true                           # Auto-login enabled
NODE_ENV=development

# API
API_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Payments (optional)
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=...
```

---

## 🎨 Demo Data

After running `pnpm db:seed`, you get:

- ✅ 1 Admin user (superadmin)
- ✅ 1 Workspace ("Pixel Team")
- ✅ 1 Store ("Lilly Goodies")
- ✅ 2 Products:
  - FlexFit Compression Shirt (4 variants)
  - AquaPure Water Bottle (3 variants)
- ✅ 2 Sellpages (fully configured)
- ✅ 2 Sample orders
- ✅ 3 Legal policies
- ✅ 1 Payment provider (Stripe test)

---

## 🔐 Security

- **Authentication**: JWT access + refresh tokens
- **Password Hashing**: Bcrypt (12 rounds)
- **Payment Encryption**: AES-256-GCM for credentials
- **RBAC**: 4 roles (OWNER, ADMIN, EDITOR, VIEWER)
- **Rate Limiting**: API throttling
- **CORS**: Configurable origins
- **Helmet**: Security headers

---

## 📈 API Modules

13 implemented modules:

1. **auth** - Login, register, refresh
2. **users** - User management
3. **workspaces** - Tenant management
4. **stores** - Store config
5. **products** - Product catalog
6. **sellpages** - Page builder
7. **cart** - Shopping cart
8. **checkout** - Checkout flow
9. **orders** - Order management
10. **payments** - Payment providers
11. **settings** - Workspace settings
12. **legal** - Legal policies
13. **public** - Storefront API

---

## 🚀 Deployment

### **Production**

```bash
# Build for production
pnpm build

# Start with Docker
docker-compose -f docker-compose.prod.yml up -d
```

**Production Checklist:**
- [ ] Set `NODE_ENV=production`
- [ ] Set `DEV_MODE=false`
- [ ] Change all secrets in `.env`
- [ ] Configure SSL/TLS
- [ ] Setup production database
- [ ] Configure Redis
- [ ] Setup domain DNS

### **AWS CDN (Optional)**

Deploy a global CloudFront CDN for improved performance:

**Manual Deployment:**
```bash
cd infrastructure/cdk
npm install
cp .env.example .env
# Edit .env with your AWS account and origin domain
.\scripts\deploy.ps1  # Windows
# or
./scripts/deploy.sh   # Linux/Mac
```

**Automatic Deployment (GitHub Actions):**
- Configure AWS credentials in GitHub Secrets
- Push to main branch → Auto-deploys CDN
- Automatic cache invalidation
- Deployment notifications (Slack/Discord/Teams)

**Benefits:**
- ⚡ Global edge locations for low latency
- 💰 Reduced origin server load
- 🔒 HTTPS and WAF protection
- 📊 CloudWatch monitoring and logs
- 🤖 CI/CD automation with GitHub Actions

**Documentation:**
- **Setup Guide**: [infrastructure/cdk/README.md](infrastructure/cdk/README.md)
- **Quick Start**: [infrastructure/cdk/QUICKSTART.md](infrastructure/cdk/QUICKSTART.md)
- **Automation**: [infrastructure/AUTOMATION-SUMMARY.md](infrastructure/AUTOMATION-SUMMARY.md)

---

## 📚 Documentation

- **Full Project Description**: [PROJECT_DESCRIPTION.md](PROJECT_DESCRIPTION.md)
- **API Documentation**: http://localhost:3001/api/docs (dev mode)
- **Prisma Schema**: `apps/api/src/prisma/schema.prisma`
- **CDN Setup Guide**: [infrastructure/cdk/README.md](infrastructure/cdk/README.md)
- **CDN Quick Start**: [infrastructure/cdk/QUICKSTART.md](infrastructure/cdk/QUICKSTART.md)

---

## 🔄 Version History

- **v2.0** (Current) - TypeScript/NestJS rewrite
- **v1.5** (Legacy) - Python/FastAPI version

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](.github/CONTRIBUTING.md) and [Code of Conduct](.github/CODE_OF_CONDUCT.md).

### **Reporting Issues**
- Use our [issue templates](.github/ISSUE_TEMPLATE/) for bug reports and feature requests
- Check existing issues before creating a new one
- Provide clear reproduction steps for bugs

### **Pull Requests**
- Fork the repository
- Create a feature branch from `develop`
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

---

## 📞 Support

**For Development:**
- API Docs: Swagger UI at `/api/docs`
- Database: Prisma Studio (`pnpm db:studio`)
- Logs: Check Docker logs or dev console

**Project Team:**
- Tech Lead/Architect
- Backend Team (NestJS)
- Frontend Team (Next.js)
- DevOps

---

## 🏆 Status

**Phase 1: ✅ COMPLETE**
- All backend modules implemented
- Core frontend pages built
- Authentication & authorization
- Multi-tenant system
- Docker setup

**Phase 2: 📋 PLANNED**
- Analytics dashboard
- Email automation
- A/B testing
- Customer portal
- Advanced SEO

---

## 📄 License

Proprietary - All Rights Reserved
© 2026 Pixel Team

---

**Built with ❤️ using NestJS, Next.js, and TypeScript**
