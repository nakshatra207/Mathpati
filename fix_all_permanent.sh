#!/bin/bash
set -e

PROJECT_DIR="$HOME/Downloads/Mathpati-main"

echo "🔧 Starting permanent fix for Vite + React + Tailwind project..."

cd "$PROJECT_DIR"

# 1️⃣ Backup important files
echo "💾 Backing up existing package.json, vite.config.ts, tailwind & postcss configs..."
cp package.json package.json.backup 2>/dev/null || true
cp vite.config.ts vite.config.ts.backup 2>/dev/null || true
cp tailwind.config.cjs tailwind.config.cjs.backup 2>/dev/null || true
cp postcss.config.cjs postcss.config.cjs.backup 2>/dev/null || true

# 2️⃣ Clean old dependencies
echo "🗑 Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# 3️⃣ Install core dependencies
echo "📦 Installing React, ReactDOM, React Router, TanStack Query, Vite React plugin..."
npm install react react-dom react-router-dom @tanstack/react-query
npm install -D @vitejs/plugin-react-swc vite typescript

# 4️⃣ Install TailwindCSS + PostCSS
echo "📦 Installing TailwindCSS, PostCSS, Autoprefixer..."
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss

# 5️⃣ Ensure package.json has "type": "module"
echo "💾 Updating package.json to 'type: module'..."
jq '. + {type: "module"}' package.json > package.json.tmp && mv package.json.tmp package.json

# 6️⃣ Rewrite vite.config.ts
echo "💾 Writing vite.config.ts for ESM + React..."
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: '/src' }
    ]
  }
})
EOF

# 7️⃣ Create TailwindCSS config
echo "💾 Creating tailwind.config.cjs..."
cat > tailwind.config.cjs << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
EOF

# 8️⃣ Create proper PostCSS config
echo "💾 Creating postcss.config.cjs..."
cat > postcss.config.cjs << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# 9️⃣ Install all dependencies fresh
echo "📦 Installing all dependencies fresh..."
npm install

# 🔟 Build project
echo "🚀 Building project..."
npm run build

echo "✅ Permanent fix applied! Your project should now build successfully!"

