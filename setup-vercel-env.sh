#!/bin/bash

echo "🔧 Setting up Vercel Environment Variables for HASHI BANK"
echo "========================================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Login to Vercel
echo "🔐 Logging in to Vercel..."
vercel login

# Set the environment variable
echo "📝 Setting DATABASE_URL environment variable..."
echo "Please select Production, Preview, and Development when prompted."
echo ""

vercel env add DATABASE_URL

echo ""
echo "✅ Environment variable added successfully!"
echo ""
echo "🚀 Redeploying application..."
vercel --prod

echo ""
echo "🎉 Setup complete! Your HASHI BANK application should now work with PIN: 7042"