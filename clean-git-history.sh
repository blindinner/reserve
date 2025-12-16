#!/bin/bash
#
# ⚠️ WARNING: This script rewrites git history!
# Only run this if you understand the implications
# This will require force pushing
#

echo "⚠️  WARNING: This will rewrite git history!"
echo "This script will remove .env.local from all git history"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "🧹 Cleaning git history..."
echo ""

# Remove .env.local from all branches and tags
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up refs
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d

# Expire reflog
git reflog expire --expire=now --all

# Garbage collect
git gc --prune=now --aggressive

echo ""
echo "✅ Git history cleaned!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Verify the cleanup worked: git log --all -- .env.local"
echo "2. Force push to remote: git push origin --force --all"
echo "3. Notify team members (they'll need to re-clone)"
echo ""
echo "⚠️  WARNING: Force pushing rewrites history on the remote!"
echo "Make sure all team members are aware before force pushing."

