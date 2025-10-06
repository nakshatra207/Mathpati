#!/bin/bash

# Fix Tailwind CSS PostCSS build error script
echo "Fixing Tailwind CSS PostCSS build error..."

# Check if we're in a Node.js project
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Please run this script in your project root."
    exit 1
fi

# Install the separate PostCSS plugin
echo "Installing @tailwindcss/postcss..."
npm install -D @tailwindcss/postcss

# Check if postcss.config.js exists and update it
if [ -f "postcss.config.js" ]; then
    echo "Updating postcss.config.js..."
    cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  }
}
EOF
else
    echo "Creating postcss.config.js..."
    cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  }
}
EOF
fi

# Clean install to ensure everything is fresh
echo "Cleaning and reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install

echo "Fix completed! Try building your project now with: npm run build"
