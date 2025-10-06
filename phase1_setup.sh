#!/bin/bash
set -e

# -------------------------------
# Phase 1 Setup for Mathpati Repo
# Author: Nakshatra
# OS: Debian 13 Trixie
# GitHub repo: https://github.com/nakshatra207/Mathpati
# -------------------------------

# Config — change if needed
GITHUB_USER="nakshatra207"
REPO_NAME="Mathpati"
REMOTE_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"

# 0️⃣ If folder already exists, skip cloning; otherwise clone it
if [ ! -d "$REPO_NAME" ]; then
  echo "Cloning repository..."
  git clone "$REMOTE_URL"
else
  echo "Repository folder already exists. Using existing copy."
fi

cd "$REPO_NAME"

# 1️⃣ Initialize Git if not already a git repo
if [ ! -d .git ]; then
  echo "Initializing Git in project..."
  git init
else
  echo "Git already initialized."
fi

# 2️⃣ Add remote origin if not already added
if git remote get-url origin >/dev/null 2>&1; then
  echo "Remote origin already exists: $(git remote get-url origin)"
else
  echo "Adding remote origin..."
  git remote add origin "$REMOTE_URL"
fi

# 3️⃣ Set branch to main and push initial commit if no commits yet
if [ -z "$(git rev-parse --quiet --verify HEAD)" ]; then
  echo "No commits yet. Creating initial commit."
  git add .
  git commit -m "Initial commit of Mathpati app"
  git branch -M main
  git push -u origin main
else
  echo "Repository already has commits."
fi

# 4️⃣ Install Husky + lint-staged
echo "Installing Husky and lint-staged..."
npm install -D husky lint-staged

echo "Initializing Husky..."
npx husky install || true
npm pkg set scripts.prepare="husky install"

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"

# 5️⃣ Configure lint-staged in package.json if not already present
if grep -q "\"lint-staged\"" package.json; then
  echo "lint-staged already configured in package.json"
else
  echo "Adding lint-staged config to package.json"
  # Use a simple echo approach since json tool may not be installed
  # We’ll add config at end of file before last }
  sed -i '/"scripts":/a \  "lint-staged": {\n    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],\n    "*.{css,scss}": ["prettier --write"]\n  },' package.json
fi

# 6️⃣ Install ESLint + Prettier
echo "Installing ESLint and Prettier..."
npm install -D eslint prettier

# 7️⃣ Initialize ESLint if no config exists
if [ ! -f .eslintrc.json ] && [ ! -f .eslintrc.js ] && [ ! -f .eslintrc ] ; then
  echo "Initializing ESLint..."
  # Use non-interactive defaults
  npx eslint --init <<EOF
  2
  1
  3
  1
  1
  1
EOF
else
  echo "ESLint config already exists."
fi

echo "Phase 1 (Git + code quality) setup complete! ✅"
echo "You can now run: npx eslint .   and   npx prettier --write ."
