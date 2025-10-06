#!/bin/bash

echo "🔧 Fixing Vite ESM issue and installing dependencies..."

# Step 1: Backup package.json and vite.config.ts
cp package.json package.json.backup
cp vite.config.ts vite.config.ts.backup
echo "💾 Backed up package.json and vite.config.ts"

# Step 2: Add "type": "module" to package.json if not present
if ! grep -q '"type": "module"' package.json; then
  sed -i '1i "type": "module",' package.json
  echo '✅ Added "type": "module" to package.json'
else
  echo 'ℹ️ "type": "module" already exists in package.json'
fi

# Step 3: Rewrite vite.config.ts for ESM compatibility
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

# Step 4: Remove old node_modules and lock file
rm -rf node_modules package-lock.json
echo "🗑️ Removed node_modules and package-lock.json"

# Step 5: Install dependencies
npm install
npm install -D @vitejs/plugin-react-swc
echo "✅ Dependencies installed"

# Step 6: Build the project
echo "🚀 Running build..."
npm run build

echo "🎉 Done! Your Vite + React-SWC project should now build correctly."
