#!/bin/bash

set -e  # Exit on any error

REPO_URL="git@github.com:nakshatra207/math-pati-quiz-challenge.git"
CLONE_DIR="mathpati-clean"

echo "🔁 Cloning fresh copy of the repo..."
rm -rf "$CLONE_DIR"
git clone --mirror "$REPO_URL" "$CLONE_DIR"

cd "$CLONE_DIR"

echo "🧹 Removing all commits by 'lovable' or '[bot]' users..."
git filter-repo --force --commit-callback '
if b"lovable" in commit.author_name.lower() or b"[bot]" in commit.author_name.lower() or b"github-actions" in commit.author_email:
    commit.skip()
'

echo "🚀 Pushing cleaned history to GitHub..."
git push --force --mirror

echo "✅ Done. All bot commits removed and force-pushed."
