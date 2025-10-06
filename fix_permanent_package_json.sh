#!/bin/bash

echo "🔧 Fixing package.json permanently..."

# Backup current package.json
cp package.json package.json.backup
echo "💾 Backed up broken package.json to package.json.backup"

# Replace with a clean, valid package.json
cat > package.json << 'EOF'
{
  "name": "mathpati",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "gh-pages -d dist"
  },
  "dependencies": {},
  "devDependencies": {}
}
EOF

echo "✅ Replaced package.json with a clean, valid JSON"

# Remove old node_modules and lock file
rm -rf node_modules package-lock.json
echo "🗑️ Removed node_modules and package-lock.json"

# Install dependencies
npm install
npm install -D vite @vitejs/plugin-react-swc gh-pages
echo "✅ Installed core dependencies"

# Create a clean vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext'
  }
});
EOF

echo "✅ Created vite.config.ts compatible with ESM"

# Build project
echo "🚀 Building project..."
npm run build

echo "🎉 Done! package.json is now valid and project should build successfully."
