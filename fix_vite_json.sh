#!/bin/bash

echo "🔧 Fixing package.json and Vite ESM issue..."

# Backup package.json and vite.config.ts
cp package.json package.json.backup
cp vite.config.ts vite.config.ts.backup
echo "💾 Backed up package.json and vite.config.ts"

# Step 1: Insert "type": "module" safely
# Remove old type if exists
jq 'del(.type) | . + {"type": "module"}' package.json > package.json.tmp && mv package.json.tmp package.json
echo "✅ Added/updated \"type\": \"module\" in package.json"

# Step 2: Rewrite vite.config.ts for ESM
cat > vite.config.ts << EOL
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext'
  }
});
EOL
echo "✅ Rewritten vite.config.ts for ESM"

# Step 3: Remove old node_modules and lock file
rm -rf node_modules package-lock.json
echo "🗑️ Removed node_modules and package-lock.json"

# Step 4: Install dependencies
npm install
npm install -D @vitejs/plugin-react-swc
echo "✅ Dependencies installed"

# Step 5: Build project
echo "🚀 Building project..."
npm run build

echo "🎉 Done! Your project should now build correctly."
