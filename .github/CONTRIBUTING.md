# Contributing to PixEcom

Thank you for your interest in contributing to PixEcom! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](.github/CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm 9.15.0+
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (optional, for local services)

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/PixEcom.git
   cd PixEcom
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/PixEcom.git
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

5. **Start services**
   ```bash
   # Start PostgreSQL and Redis
   docker-compose up -d

   # Setup database
   pnpm db:push
   pnpm db:seed

   # Start dev servers
   pnpm dev
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names following this pattern:

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates
- `chore/description` - Maintenance tasks

Examples:
- `feature/add-oauth-login`
- `fix/cart-calculation-bug`
- `docs/update-api-endpoints`

### Workflow Steps

1. **Create a feature branch**
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Follow existing code patterns
   - Add tests for new functionality

3. **Test your changes**
   ```bash
   pnpm lint
   pnpm test
   pnpm build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Keep your branch updated**
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to GitHub and create a PR from your fork
   - Fill out the PR template completely
   - Link related issues

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types - use proper typing
- Use interfaces for object shapes
- Use enums for fixed sets of values

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
pnpm lint

# Auto-fix issues
pnpm lint:fix

# Format code
pnpm format
```

### Best Practices

**General:**
- Keep functions small and focused
- Use meaningful variable and function names
- Avoid deep nesting (max 3 levels)
- Comment complex logic
- Don't commit commented-out code

**NestJS Backend:**
- Use dependency injection
- Follow module structure
- Use DTOs for validation
- Use decorators appropriately
- Handle errors with proper HTTP status codes

**Next.js Frontend:**
- Use functional components
- Use hooks appropriately
- Keep components small and reusable
- Use TypeScript interfaces for props
- Follow App Router conventions

**Database:**
- Use Prisma schema for all database changes
- Create migrations for schema changes
- Use transactions for multi-step operations
- Index frequently queried fields
- Use UUIDs for primary keys

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```bash
feat(auth): add OAuth2 login support

Add Google and GitHub OAuth2 providers for user authentication.
Includes new auth strategies and UI components.

Closes #123

---

fix(cart): correct total calculation for discounts

The cart total was not properly accounting for percentage-based
discounts when multiple items were present.

Fixes #456

---

docs(api): update authentication endpoint documentation

---

chore(deps): update dependencies to latest versions
```

## Pull Request Process

### Before Submitting

1. **Update documentation** - Update README, API docs, or comments
2. **Add tests** - Ensure adequate test coverage
3. **Run all checks** - Lint, test, and build must pass
4. **Update CHANGELOG** - Add your changes to CHANGELOG.md (if applicable)
5. **Rebase on latest** - Ensure your branch is up to date

### PR Requirements

- [ ] Descriptive title following conventional commits
- [ ] Complete PR template
- [ ] All CI checks pass
- [ ] No merge conflicts
- [ ] At least one approval from maintainer
- [ ] Updated documentation
- [ ] Added/updated tests

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge your PR

### After Merging

1. Delete your feature branch
2. Pull the latest changes from upstream
3. Update your fork

## Testing Guidelines

### Test Structure

```typescript
describe('FeatureName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something specific', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Types of Tests

**Unit Tests:**
- Test individual functions/methods
- Mock external dependencies
- Fast and isolated

**Integration Tests:**
- Test multiple components together
- Use test database
- Test API endpoints

**E2E Tests:**
- Test complete user workflows
- Test through UI
- Use in critical paths

### Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# Specific file
pnpm test path/to/test
```

### Coverage Requirements

- Minimum 80% coverage for new code
- Critical paths should have 100% coverage
- Test edge cases and error scenarios

## Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Document complex algorithms
- Explain "why" not just "what"
- Keep comments up to date

### API Documentation

- Use Swagger/OpenAPI decorators
- Document all endpoints
- Include request/response examples
- Document error responses

### User Documentation

- Update README for user-facing changes
- Add setup instructions for new features
- Include screenshots/videos when helpful
- Write clear, concise instructions

## Questions?

- Open a [Discussion](https://github.com/YOUR_USERNAME/PixEcom/discussions)
- Join our community chat (if available)
- Review existing issues and PRs

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Community highlights

Thank you for contributing to PixEcom! 🎉
