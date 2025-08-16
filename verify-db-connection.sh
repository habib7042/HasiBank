#!/bin/bash

echo "🔍 HASHI BANK Database Connection Verification"
echo "=============================================="

# Test 1: Check environment variable
echo "📋 Testing environment variable..."
if [ -f .env ]; then
    source .env
    echo "✅ .env file found"
    echo "📊 DATABASE_URL: ${DATABASE_URL:0:50}..."
else
    echo "❌ .env file not found"
    exit 1
fi

# Test 2: Test Prisma connection
echo ""
echo "🔌 Testing Prisma connection..."
node -e "
const { PrismaClient } = require('@prisma/client');
async function test() {
    const prisma = new PrismaClient();
    try {
        await prisma.\$connect();
        console.log('✅ Prisma connection successful');
        
        const result = await prisma.\$queryRaw\`SELECT 1 as test\`;
        console.log('✅ Query execution successful');
        
        const userCount = await prisma.user.count();
        const settingsCount = await prisma.settings.count();
        
        console.log(\`📊 Database stats:\`);
        console.log(\`   👥 Users: \${userCount}\`);
        console.log(\`   ⚙️  Settings: \${settingsCount}\`);
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
    } finally {
        await prisma.\$disconnect();
    }
}
test();
"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 All database connection tests passed!"
    echo "🚀 HASHI BANK is ready for deployment!"
else
    echo ""
    echo "❌ Database connection tests failed!"
    exit 1
fi