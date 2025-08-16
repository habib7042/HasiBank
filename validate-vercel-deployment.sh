#!/bin/bash

echo "🔍 Vercel Deployment Environment Validation"
echo "================================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    exit 1
fi

# Load environment variables
source .env

echo "📋 Checking environment variables..."

# Validate DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is not set"
    exit 1
fi

echo "✅ DATABASE_URL is set"

# Check URL format
if [[ "$DATABASE_URL" != postgresql://* ]] && [[ "$DATABASE_URL" != postgres://* ]]; then
    echo "❌ DATABASE_URL must start with postgresql:// or postgres://"
    echo "   Current URL: $DATABASE_URL"
    exit 1
fi

echo "✅ DATABASE_URL format is correct"

# Extract URL components

if [[ "$DATABASE_URL" =~ postgresql://([^@]+)@([^/]+)/([^?]+) ]]; then
    echo "✅ URL parsing successful"
    echo "   User: ${BASH_REMATCH[1]}"
    echo "   Host: ${BASH_REMATCH[2]}"
    echo "   Database: ${BASH_REMATCH[3]}"
else
    echo "❌ DATABASE_URL format is invalid"
    exit 1
fi

echo ""
echo "🔌 Testing database connection..."

# Test database connection
node -e "
const { PrismaClient } = require('@prisma/client');
async function test() {
    const prisma = new PrismaClient();
    try {
        await prisma.\$connect();
        console.log('✅ Database connection successful');
        
        // Test if tables exist
        const userCount = await prisma.user.count();
        const settingsCount = await prisma.settings.count();
        
        console.log('✅ Database schema is valid');
        console.log(\`   👥 Users: \${userCount}\`);
        console.log(\`   ⚙️  Settings: \${settingsCount}\`);
        
        // Test if PIN exists
        const settings = await prisma.settings.findFirst();
        if (settings) {
            console.log(\`   🔑 PIN: \${settings.pin}\`);
        } else {
            console.log('⚠️  No PIN found in settings table');
        }
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    } finally {
        await prisma.\$disconnect();
    }
}
test();
"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 All validation checks passed!"
    echo ""
    echo "📋 Vercel Deployment Instructions:"
    echo "1. Go to your Vercel project dashboard"
    echo "2. Navigate to Settings → Environment Variables"
    echo "3. Add the following environment variable:"
    echo "   Key: DATABASE_URL"
    echo "   Value: $DATABASE_URL"
    echo "4. Select Production, Preview, and Development"
    echo "5. Save and redeploy your application"
    echo ""
    echo "🚀 Your HASHI BANK application is ready for deployment!"
else
    echo ""
    echo "❌ Validation failed. Please check your database configuration."
    exit 1
fi