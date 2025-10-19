#!/bin/bash

set -e

PROJECT_DIR="$HOME/Downloads/Mathpati-main"
cd "$PROJECT_DIR"

echo "💾 Backing up project files..."
cp package.json package.json.backup 2>/dev/null || true
cp vite.config.ts vite.config.ts.backup 2>/dev/null || true

echo "🗑 Cleaning old node_modules and lock files..."
rm -rf node_modules package-lock.json yarn.lock

echo "📦 Installing core dependencies..."
npm install react react-dom react-router-dom @tanstack/react-query @tanstack/react-query-devtools

echo "📦 Installing Vite React plugin..."
npm install -D @vitejs/plugin-react-swc vite

echo "📦 Installing TailwindCSS, PostCSS, Autoprefixer, @tailwindcss/postcss..."
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss

echo "💾 Fixing package.json type..."
jq '. + {"type":"module"}' package.json > package.tmp.json && mv package.tmp.json package.json

echo "💾 Rewriting vite.config.ts for ESM..."
cat > vite.config.ts <<EOL
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
});
EOL

echo "💾 Creating postcss.config.cjs..."
cat > postcss.config.cjs <<EOL
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOL

echo "💾 Creating tailwind.config.cjs..."
cat > tailwind.config.cjs <<EOL
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
EOL

echo "📦 Installing all dependencies..."
npm install

echo "🚀 Building project..."
npm run build

echo "🎉 All packages installed and project built successfully!"

