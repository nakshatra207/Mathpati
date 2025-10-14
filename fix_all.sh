#!/bin/bash
set -e

PROJECT_DIR="$PWD"
echo "🔧 Starting full project fix in $PROJECT_DIR..."

# Backup important files
echo "💾 Backing up package.json, vite.config.ts, postcss.config.js..."
cp package.json package.json.backup || true
cp vite.config.ts vite.config.ts.backup || true
cp postcss.config.js postcss.config.js.backup || true 2>/dev/null || true

# Fix package.json: add "type": "module"
echo "💾 Updating package.json for ESM..."
jq '. + {"type":"module"}' package.json.backup > package.json.tmp && mv package.json.tmp package.json

# Remove old node_modules and lockfile
echo "🗑️ Removing old node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# Install core dependencies
echo "✅ Installing React, ReactDOM, Vite React plugin..."
npm install react react-dom
npm install -D @vitejs/plugin-react-swc vite

# Install TailwindCSS and PostCSS
echo "✅ Installing TailwindCSS, PostCSS, Autoprefixer..."
npm install -D tailwindcss postcss autoprefixer

# Fix vite.config.ts for ESM
echo "💾 Rewriting vite.config.ts for ESM..."
cat > vite.config.ts <<'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
EOF

# Fix PostCSS config: rename to .cjs
if [ -f postcss.config.js ]; then
  echo "💾 Converting postcss.config.js to CommonJS (.cjs)..."
  mv postcss.config.js postcss.config.cjs
fi

# Create Tailwind config if missing
if [ ! -f tailwind.config.cjs ]; then
  echo "💾 Creating tailwind.config.cjs..."
  cat > tailwind.config.cjs <<'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF
fi

# Final install to make sure everything is correct
echo "📦 Running npm install..."
npm install

# Build project
echo "🚀 Building project..."
npm run build || echo "❗ Build failed. Check errors above."

echo "🎉 All fixes applied. Your project should now build successfully!"

