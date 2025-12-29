# Git History Cleanup Instructions

## ⚠️ Current Status

The security scan found that `.env.local` with exposed keys was committed to git history in **5 commits**:
- `40763b46` - removed important stuff
- `999e1e30` - working on payment and DB
- `47efacba` - favicons, emails, submission form
- `843e8541` - ciao
- `c6414b2c` - ciao

**Good news:** You've already rotated all the keys! ✅
**Action needed:** Remove the exposed keys from git history

---

## Option 1: Automated Cleanup (Recommended)

Use the provided script:

```bash
./clean-git-history.sh
```

This will:
1. Remove `.env.local` from all commits in all branches
2. Clean up git references
3. Prepare for force pushing

**After running the script:**
```bash
# Verify it worked (should show nothing)
git log --all -- .env.local

# Force push to remote (⚠️ rewrites remote history)
git push origin --force --all
```

---

## Option 2: Manual Cleanup

If you prefer manual control:

### Step 1: Remove file from all history
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all
```

### Step 2: Clean up references
```bash
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Step 3: Verify
```bash
# Should show nothing
git log --all -- .env.local
```

### Step 4: Force push
```bash
git push origin --force --all
```

---

## Option 3: Use BFG Repo-Cleaner (Alternative)

BFG is a faster alternative to git filter-branch:

1. Download BFG: https://rtyley.github.io/bfg-repo-cleaner/
2. Run:
   ```bash
   java -jar bfg.jar --delete-files .env.local
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push origin --force --all
   ```

---

## ⚠️ Important Warnings

1. **Force pushing rewrites remote history** - Coordinate with your team
2. **Team members will need to re-clone** or update their local repos
3. **Backup first** - Create a backup branch before cleanup
4. **Verify after** - Make sure the cleanup worked before pushing

---

## Before You Start

### Create a backup:
```bash
git branch backup-before-cleanup
git push origin backup-before-cleanup
```

### Check what branches you have:
```bash
git branch -a
```

### If working alone (no team):
You can safely proceed with the cleanup

### If you have a team:
1. Notify everyone first
2. Coordinate a time
3. Have everyone push their work first
4. After cleanup, everyone re-clones or resets their repos

---

## After Cleanup

1. ✅ Verify: `git log --all -- .env.local` shows nothing
2. ✅ Verify: `./check-secrets.sh` shows no exposed keys
3. ✅ Push: Force push to remote
4. ✅ Notify: Let team know to re-clone if needed
5. ✅ Verify again: Check GitHub/GitLab web interface

---

## Current Protection Status

✅ Keys rotated (all new keys in Vercel)
✅ `.env.local` removed from git tracking
✅ `.gitignore` enhanced
✅ Pre-commit hook installed
✅ Security safeguards in place

Once history is cleaned, you'll be fully secure!

