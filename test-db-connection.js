const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test query execution
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query execution successful:', result);
    
    // Check if tables exist (PostgreSQL syntax)
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `;
    console.log('📋 Available tables:', tables);
    
    // Test model access
    try {
      const userCount = await prisma.user.count();
      console.log('👥 User count:', userCount);
    } catch (error) {
      console.log('⚠️  User table may not exist yet:', error.message);
    }
    
    try {
      const settingsCount = await prisma.settings.count();
      console.log('⚙️  Settings count:', settingsCount);
    } catch (error) {
      console.log('⚠️  Settings table may not exist yet:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database');
  }
}

testConnection();