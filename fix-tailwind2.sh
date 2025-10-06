#!/bin/bash

# Fix Tailwind CSS unknown utility class error
echo "Fixing Tailwind CSS unknown utility class error..."

# Check if we're in a Node.js project
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Please run this script in your project root."
    exit 1
fi

# Check if src/index.css exists
if [ -f "src/index.css" ]; then
    echo "Checking src/index.css for issues..."
    
    # Check if there's a @reference directive needed
    if grep -q "border-border" src/index.css; then
        echo "Found border-border class. Adding @reference directive..."
        
        # Create a backup
        cp src/index.css src/index.css.backup
        
        # Add @reference directive at the top if it doesn't exist
        if ! grep -q "@reference" src/index.css; then
            sed -i '1s/^/@reference "tailwindcss";\n/' src/index.css
        fi
        
        echo "Updated src/index.css with @reference directive"
    fi
fi

# Check tailwind.config.js for custom classes
if [ -f "tailwind.config.js" ]; then
    echo "Checking tailwind.config.js..."
    
    # Check if theme extension is needed for border-border
    if ! grep -q "border-border" tailwind.config.js; then
        echo "Adding border-border to tailwind.config.js..."
        
        # Create a modified tailwind.config.js
        cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderColor: {
        'border': 'var(--border)',
      },
      colors: {
        border: 'var(--border)',
      }
    },
  },
  plugins: [],
}
EOF
    fi
else
    echo "Creating tailwind.config.js..."
    cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderColor: {
        'border': 'var(--border)',
      },
      colors: {
        border: 'var(--border)',
      }
    },
  },
  plugins: [],
}
EOF
fi

# Alternative: If the above doesn't work, let's check what's actually in index.css
if [ -f "src/index.css" ]; then
    echo "Current content of src/index.css:"
    echo "=================================="
    head -20 src/index.css
    echo "=================================="
fi

echo "Fix applied! Try building again: npm run build"
