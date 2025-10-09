#!/bin/bash
set -e

PROJECT="$HOME/Downloads/Mathpati-main"
cd "$PROJECT"

echo "💾 Backing up configs..."
cp postcss.config.cjs postcss.config.cjs.backup 2>/dev/null || true
cp tailwind.config.cjs tailwind.config.cjs.backup 2>/dev/null || true

echo "🗑 Cleaning node_modules and lock files..."
rm -rf node_modules package-lock.json

echo "📦 Installing TailwindCSS, PostCSS, Autoprefixer..."
npm install -D tailwindcss postcss autoprefixer

echo "💾 Writing correct postcss.config.cjs..."
cat > postcss.config.cjs << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

echo "💾 Writing tailwind.config.cjs..."
cat > tailwind.config.cjs << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
EOF

echo "📦 Installing dependencies fresh..."
npm install

echo "🚀 Building project..."
npm run build

echo "✅ Tailwind + PostCSS fixed permanently!"

