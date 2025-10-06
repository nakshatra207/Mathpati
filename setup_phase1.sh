#!/bin/bash
set -e

# -------------------------------
# Phase 1: Git + Code Quality Setup
# Author: Nakshatra
# OS: Debian 13 Trixie
# GitHub: https://github.com/nakshatra207
# -------------------------------

# 1️⃣ Initialize Git repository
echo "Initializing Git repository..."
git init

# 2️⃣ Add all files and make first commit
echo "Adding all files..."
git add .
git commit -m "Initial commit of Mathpati app"

# 3️⃣ Connect to GitHub
GITHUB_USER="nakshatra207"
REPO_NAME="Mathpati"
echo "Connecting to GitHub repo..."
git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git
git branch -M main
git push -u origin main

# 4️⃣ Install Husky + lint-staged
echo "Installing Husky and lint-staged..."
npm install -D husky lint-staged

echo "Initializing Husky..."
npx husky install
npm pkg set scripts.prepare="husky install"

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"

# 5️⃣ Configure lint-staged in package.json
echo "Configuring lint-staged..."
npx json -I -f package.json -e 'this["lint-staged"]={"*.{ts,tsx}":["eslint --fix","prettier --write"],"*.{css,scss}":["prettier --write"]}'

# 6️⃣ Install ESLint + Prettier
echo "Installing ESLint and Prettier..."
npm install -D eslint prettier

echo "Initializing ESLint..."
npx eslint --init

echo "Phase 1 setup complete! ✅"
echo "Now you can run 'npx eslint .' and 'npx prettier --write .' to test linting/formatting."
