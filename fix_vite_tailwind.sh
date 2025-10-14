#!/bin/bash
# 🔧 Fix Vite + React + TailwindCSS ESM + PostCSS issues permanently

PROJECT_DIR="$HOME/Downloads/Mathpati-main"
cd "$PROJECT_DIR" || exit

echo "💾 Backing up existing config files..."
[ -f package.json ] && cp package.json package.json.backup
[ -f vite.config.ts ] && cp vite.config.ts vite.config.ts.backup
[ -f postcss.config.cjs ] && cp postcss.config.cjs postcss.config.cjs.backup

echo "🗑 Removing old node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

echo "📦 Installing core dependencies..."
npm install react react-dom @vitejs/plugin-react-swc -D

echo "📦 Installing TailwindCSS, PostCSS, Autoprefixer..."
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss

echo "💾 Rewriting vite.config.ts..."
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
});
EOF

echo "💾 Creating postcss.config.cjs..."
cat > postcss.config.cjs << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOF

echo "💾 Creating tailwind.config.cjs..."
cat > tailwind.config.cjs << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
EOF

echo "📦 Installing all dependencies..."
npm install

echo "🚀 Building project..."
npm run build

echo "🎉 Fix complete! Your Vite + React + Tailwind project should now build successfully."

