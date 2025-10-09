#!/bin/bash
set -e

echo "🔧 Fixing Vite config and installing required dependencies..."

# 1️⃣ Backup current vite.config.ts
cp vite.config.ts vite.config.ts.backup
echo "💾 Backed up vite.config.ts to vite.config.ts.backup"

# 2️⃣ Replace vite.config.ts with ESM-compatible version
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext'
  }
});
EOF

echo "✅ vite.config.ts updated for ESM compatibility"

# 3️⃣ Install required dependencies
npm install

# 4️⃣ Ensure @vitejs/plugin-react-swc is installed as dev dependency
npm install -D @vitejs/plugin-react-swc

echo "🎉 Dependencies installed. You can now build the project."
echo "Run: npm run build"

