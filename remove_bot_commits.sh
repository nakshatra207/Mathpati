#!/bin/bash
set -e

# === Configuration ===
YOUR_NAME="Nakshatra Mudgil"
YOUR_EMAIL="nakshatra207@example.com"   # <-- put your GitHub email here

# === Detect bot commits ===
echo "🔍 Checking for commits by bots..."
if ! git log --author="\[bot\]" --oneline | grep .; then
  echo "✅ No bot commits found. Nothing to clean."
  exit 0
fi

# === Rewriting history ===
echo "⚙️ Rewriting history to remove bot authors..."
git filter-branch --env-filter "
if [[ \"\$GIT_AUTHOR_NAME\" == *'[bot]'* ]]; then
    export GIT_AUTHOR_NAME=\"$YOUR_NAME\"
    export GIT_AUTHOR_EMAIL=\"$YOUR_EMAIL\"
    export GIT_COMMITTER_NAME=\"$YOUR_NAME\"
    export GIT_COMMITTER_EMAIL=\"$YOUR_EMAIL\"
fi
" --tag-name-filter cat -- --branches --tags

# === Force push cleaned history ===
echo "📤 Pushing cleaned history to origin..."
git push origin --force

echo "🎉 Done! All bot commits have been rewritten under your name."
