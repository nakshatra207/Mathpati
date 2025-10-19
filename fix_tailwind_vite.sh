#!/bin/bash
set -e

# Go to project root
PROJECT_DIR="$PWD"
echo "🔧 Fixing TailwindCSS + Vite project in $PROJECT_DIR..."

# Backup important files
echo "💾 Backing up package.json, vite.config.ts, postcss.config.cjs..."
cp package.json package.json.backup || true
cp vite.config.ts vite.config.ts.backup || true
cp postcss.config.cjs postcss.config.cjs.backup || true 2>/dev/null || true

# Remove old node_modules and lockfile
echo "🗑️ Removing old node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# Install all required dependencies
echo "📦 Installing dependencies..."
npm install react react-dom
npm install -D @vitejs/plugin-react-swc vite
npm install -D tailwindcss @tailwindcss/postcss postcss autoprefixer

# Rewrite vite.config.ts for ESM
echo "💾 Updating vite.config.ts..."
vim -c ":%d|r !echo \"import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react-swc'\n\nexport default defineConfig({\n  plugins: [react()],\n})\"|wq" vite.config.ts

# Fix PostCSS config for ESM + Tailwind
echo "💾 Creating correct postcss.config.cjs..."
vim -c ":%d|r !echo \"module.exports = {\n  plugins: {\n    '@tailwindcss/postcss': {},\n    autoprefixer: {},\n  },\n}\"|wq" postcss.config.cjs

# Create Tailwind config if missing
if [ ! -f tailwind.config.cjs ]; then
  echo "💾 Creating tailwind.config.cjs..."
  vim -c ":%d|r !echo \"/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  content: [\"./index.html\", \"./src/**/*.{js,ts,jsx,tsx}\"],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n}\"|wq" tailwind.config.cjs
fi

# Final install
echo "📦 Running npm install..."
npm install

# Build project
echo "🚀 Building project..."
npm run build || echo "❗ Build failed. Check errors above."

echo "🎉 Tailwind + Vite fixed!"

