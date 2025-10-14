#!/bin/bash
set -e

PROJECT_DIR=$(pwd)

echo "💾 Backing up config files..."
cp package.json package.json.backup 2>/dev/null || true
cp vite.config.ts vite.config.ts.backup 2>/dev/null || true
cp postcss.config.cjs postcss.config.cjs.backup 2>/dev/null || true
cp tailwind.config.cjs tailwind.config.cjs.backup 2>/dev/null || true

echo "🗑 Cleaning node_modules and lock files..."
rm -rf node_modules package-lock.json

echo "📦 Installing React, ReactDOM, Vite plugin..."
npm install react react-dom @vitejs/plugin-react-swc --save

echo "📦 Installing TailwindCSS, PostCSS, Autoprefixer, @tailwindcss/postcss..."
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss

echo "💾 Fixing package.json type..."
jq '. + {"type":"module"}' package.json.backup > package.json

echo "💾 Creating vite.config.ts with alias for @ -> src..."
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
EOF

echo "💾 Creating postcss.config.cjs..."
cat > postcss.config.cjs << 'EOF'
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
EOF

echo "💾 Creating tailwind.config.cjs..."
cat > tailwind.config.cjs << 'EOF'
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
EOF

echo "📦 Installing all dependencies..."
npm install

echo "🚀 Building project..."
npm run build

echo "✅ Permanent fix applied! Vite + React + Tailwind should now build successfully."

