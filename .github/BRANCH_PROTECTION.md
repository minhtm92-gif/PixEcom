# Branch Protection Rules Setup Guide

This guide will help you configure branch protection rules for the PixEcom repository to maintain code quality and prevent accidental changes.

## Table of Contents

- [Why Branch Protection?](#why-branch-protection)
- [Recommended Branch Strategy](#recommended-branch-strategy)
- [Setting Up Protection Rules](#setting-up-protection-rules)
- [Protection Rules by Branch](#protection-rules-by-branch)
- [Testing Protection Rules](#testing-protection-rules)

## Why Branch Protection?

Branch protection rules help you:
- ✅ Prevent direct commits to important branches
- ✅ Require code reviews before merging
- ✅ Ensure CI/CD checks pass before deployment
- ✅ Maintain code quality and stability
- ✅ Enable team collaboration safely

## Recommended Branch Strategy

```
main (production)
  ↑
develop (staging/integration)
  ↑
feature/* (individual features)
fix/* (bug fixes)
hotfix/* (urgent production fixes)
```

### Branch Purposes

- **`main`** - Production-ready code only. Deploys to production.
- **`develop`** - Integration branch. Deploys to staging.
- **`feature/*`** - New features (e.g., `feature/add-analytics`)
- **`fix/*`** - Bug fixes (e.g., `fix/cart-calculation`)
- **`hotfix/*`** - Critical production fixes

## Setting Up Protection Rules

### Step 1: Create Develop Branch

Before setting up protection, create the `develop` branch:

```bash
# In your local repository
git checkout -b develop
git push -u origin develop
```

### Step 2: Access Branch Protection Settings

1. Go to: https://github.com/minhtm92-gif/PixEcom/settings/branches
2. Or: Repository → Settings → Branches

### Step 3: Configure Protection for `main` Branch

Click "Add rule" and configure as follows:

#### Branch Name Pattern
```
main
```

#### Protection Settings

**Protect matching branches:**
- ☑️ **Require a pull request before merging**
  - Required approvals: `1` (or `2` for stricter control)
  - ☑️ Dismiss stale pull request approvals when new commits are pushed
  - ☑️ Require review from Code Owners (optional, requires CODEOWNERS file)

- ☑️ **Require status checks to pass before merging**
  - ☑️ Require branches to be up to date before merging
  - **Required status checks:** (add these)
    - `lint`
    - `type-check`
    - `build`
    - `test`
    - `security`

- ☑️ **Require conversation resolution before merging**
  - Ensures all review comments are addressed

- ☑️ **Require signed commits** (recommended for security)

- ☑️ **Require linear history**
  - Prevents merge commits, requires rebase or squash

- ☑️ **Do not allow bypassing the above settings**
  - Applies rules to administrators too

- ☐ **Allow force pushes** - Leave UNCHECKED

- ☐ **Allow deletions** - Leave UNCHECKED

**Click "Create" to save the rule.**

---

### Step 4: Configure Protection for `develop` Branch

Click "Add rule" again and configure:

#### Branch Name Pattern
```
develop
```

#### Protection Settings

**Slightly more relaxed than main:**

- ☑️ **Require a pull request before merging**
  - Required approvals: `1`
  - ☐ Dismiss stale pull request approvals (optional)

- ☑️ **Require status checks to pass before merging**
  - ☑️ Require branches to be up to date before merging
  - **Required status checks:**
    - `lint`
    - `type-check`
    - `build`
    - `test`

- ☑️ **Require conversation resolution before merging**

- ☐ **Require signed commits** (optional)

- ☐ **Require linear history** (optional)

- ☑️ **Do not allow bypassing the above settings**

**Click "Create" to save the rule.**

---

### Step 5: Configure Protection for Release Branches (Optional)

If you use release branches:

#### Branch Name Pattern
```
release/*
```

#### Protection Settings
Use the same settings as `main` branch.

---

## Complete Configuration Summary

### Protection Rules Table

| Setting | `main` | `develop` | `feature/*` |
|---------|--------|-----------|-------------|
| Require PR | ✅ (2 approvals) | ✅ (1 approval) | ❌ |
| Require status checks | ✅ All | ✅ All | ❌ |
| Require conversation resolution | ✅ | ✅ | ❌ |
| Require signed commits | ✅ | Optional | ❌ |
| Require linear history | ✅ | Optional | ❌ |
| Allow force push | ❌ | ❌ | ✅ |
| Allow deletion | ❌ | ❌ | ✅ |

## Required Status Checks Explained

### `lint`
- Checks code style and formatting
- Runs ESLint and Prettier
- Ensures code consistency

### `type-check`
- Validates TypeScript types
- Catches type errors early
- Ensures type safety

### `build`
- Tests that code compiles
- Checks for build errors
- Validates production build

### `test`
- Runs unit and integration tests
- Requires all tests to pass
- Ensures functionality works

### `security`
- Runs security audit
- Checks for vulnerable dependencies
- Scans for security issues

## Testing Protection Rules

### Test 1: Try to Push Directly to Main

This should fail:

```bash
git checkout main
echo "test" >> README.md
git add .
git commit -m "test: direct push to main"
git push origin main
```

**Expected Result:** ❌ Push rejected

**Error Message:**
```
remote: error: GH006: Protected branch update failed for refs/heads/main.
```

### Test 2: Create a Pull Request

This should succeed:

```bash
git checkout develop
git checkout -b feature/test-protection
echo "# Test" >> test.md
git add .
git commit -m "test: create test file"
git push origin feature/test-protection
```

Then create a PR on GitHub from `feature/test-protection` to `develop`.

**Expected Result:** ✅ PR created, CI checks run

### Test 3: Try to Merge Without Approval

Go to your PR and try to merge without approval.

**Expected Result:** ❌ Merge blocked until:
- Required approvals received
- All status checks pass
- Conversations resolved

## Workflow Example

### Feature Development Workflow

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/add-new-feature

# 3. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 4. Push to GitHub
git push origin feature/add-new-feature

# 5. Create PR on GitHub
# Go to GitHub and create PR: feature/add-new-feature → develop

# 6. Wait for CI checks and approval

# 7. Merge PR (on GitHub)

# 8. Delete feature branch
git branch -d feature/add-new-feature
git push origin --delete feature/add-new-feature
```

### Hotfix Workflow

```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# 2. Fix the bug
git add .
git commit -m "fix: resolve critical bug"

# 3. Push and create PR to main
git push origin hotfix/critical-bug-fix

# 4. After merge to main, also merge to develop
git checkout develop
git merge main
git push origin develop
```

## CODEOWNERS File (Optional)

Create a CODEOWNERS file to require specific reviewers:

**Create:** `.github/CODEOWNERS`

```
# Default owners for everything
* @minhtm92-gif

# Backend code
/apps/api/ @backend-team-lead

# Frontend code
/apps/web/ @frontend-team-lead

# Infrastructure
/infrastructure/ @devops-lead
/.github/workflows/ @devops-lead

# Database schema
/apps/api/src/prisma/ @backend-team-lead @database-admin

# Security-sensitive
/.github/workflows/deploy-*.yml @devops-lead @security-lead
```

## Bypassing Protection (Emergency Only)

### When You Might Need to Bypass

- Critical hotfix in production emergency
- Repository corruption requiring force push
- Administrative tasks

### How to Temporarily Bypass

1. Go to: Settings → Branches → Edit rule
2. Check "Allow specified actors to bypass required pull requests"
3. Add specific users/teams
4. Complete emergency action
5. **Immediately remove bypass permissions**

⚠️ **Warning:** Only use in genuine emergencies!

## Common Issues & Solutions

### Issue: Can't merge PR even after approval

**Cause:** Status checks not passing or conversations not resolved

**Solution:**
- Check Actions tab for failed workflows
- Resolve all review comments
- Ensure branch is up to date with base

### Issue: Status check never completes

**Cause:** Workflow configuration error

**Solution:**
- Check workflow file syntax
- Verify GitHub Secrets are configured
- Review workflow logs for errors

### Issue: Wrong required status checks

**Cause:** Mismatch between workflow job names and required checks

**Solution:**
- Required check names must match workflow job names exactly
- Update branch protection settings to match

## Best Practices

1. **Always work in feature branches**
   - Never commit directly to `main` or `develop`
   - Use descriptive branch names

2. **Keep PRs focused and small**
   - One feature/fix per PR
   - Easier to review and test

3. **Write clear PR descriptions**
   - Use the PR template
   - Explain what and why

4. **Respond to review feedback**
   - Address all comments
   - Ask questions if unclear

5. **Keep branches up to date**
   - Regularly rebase on develop
   - Resolve conflicts early

6. **Delete merged branches**
   - Clean up after PR merge
   - Keeps repository tidy

## Monitoring and Auditing

### View Protection Rule Activity

1. Go to: Settings → Branches
2. View rule enforcement in PR history
3. Check Actions tab for workflow runs

### Audit Log

1. Go to: Settings → Security → Audit log
2. Filter by branch protection events
3. Monitor rule changes

## Next Steps

After configuring branch protection:

1. ✅ **Create develop branch** - `git checkout -b develop && git push`
2. ✅ **Set up protection rules** - Follow steps above
3. ✅ **Test with a PR** - Create test feature branch
4. ✅ **Update team documentation** - Share workflow with team
5. ✅ **Configure CODEOWNERS** - If working with team

## Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [About CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [About Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)

---

**Last Updated:** February 2026
**Repository:** https://github.com/minhtm92-gif/PixEcom
