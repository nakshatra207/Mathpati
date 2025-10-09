#!/bin/bash

echo "🔧 Fixing package.json and installing dependencies..."

# Move to the project directory (adjust path if needed)
cd ~/Downloads/Mathpati-main || { echo "❌ Directory not found!"; exit 1; }

# Backup existing package.json
if [ -f package.json ]; then
    cp package.json package.json.backup
    echo "💾 Backed up old package.json to package.json.backup"
fi

# Write a clean package.json
cat > package.json <<EOL
{
  "name": "mathpati",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "gh-pages -d dist"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "eslint": "^9.0.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0",
    "prettier": "^3.0.0",
    "gh-pages": "^6.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  },
  "homepage": "https://nakshatra207.github.io/Mathpati"
}
EOL

echo "✅ package.json replaced with a clean version."

# Install all dependencies
npm install

echo "🎉 Dependencies installed successfully!"
echo "You can now run: npm run deploy"

