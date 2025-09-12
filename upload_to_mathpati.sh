#!/bin/bash
set -e

# Go to project directory
cd ~/math-pati-quiz-challenge

# Initialize git if not already
git init

# Add the new remote
git remote remove origin 2>/dev/null || true
git remote add origin git@github.com:nakshatra207/Mathpati.git

# Stage all files
git add .

# Commit changes
git commit -m "Initial upload of Mathpati quiz challenge project"

# Push to GitHub
git branch -M main
git push -u origin main --force

echo "🎉 Project uploaded successfully to Mathpati repo!"

