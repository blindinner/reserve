# Security Guidelines

## ⚠️ NEVER Commit Sensitive Files

**NEVER commit the following to git:**
- `.env.local` or any `.env*` files (except `.env.example`)
- API keys, secrets, passwords, or credentials
- Private keys (`.pem`, `.key` files)
- Database credentials
- Any file containing sensitive information

## Protection Mechanisms

This repository has multiple safeguards in place:

### 1. `.gitignore`
All sensitive file patterns are in `.gitignore` and will be automatically excluded.

### 2. Pre-commit Hook
A git pre-commit hook automatically checks for sensitive files before allowing commits.

### 3. Code Review
Always review changes before pushing to ensure no sensitive data is included.

## Environment Variables

- Use `.env.local` for local development (never commit this!)
- Use Vercel environment variables for production
- See `.env.example` for required variables

## If You Accidentally Commit Secrets

1. **IMMEDIATELY rotate/revoke all exposed keys**
2. Remove the file from git history:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. Force push (coordinate with team)
4. Notify team members

## Best Practices

- ✅ Always use environment variables
- ✅ Use `.env.example` as a template
- ✅ Review `git diff` before committing
- ✅ Never hardcode secrets in code
- ✅ Rotate keys regularly
- ❌ Never commit `.env.local`
- ❌ Never commit API keys or secrets
- ❌ Never commit credentials

