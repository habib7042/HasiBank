# Database Connection Testing Guide

## Quick Methods to Check Database Connection

### Method 1: Using Prisma CLI (Fastest)
```bash
# Test basic connection
npx prisma db push

# If successful, connection is working
# If fails, check the error message
```

### Method 2: Using Prisma Studio (Visual)
```bash
# Open database browser
npx prisma studio

# This will open a web interface at http://localhost:5555
# If it connects successfully, your database is working
```

### Method 3: Using Custom Test Script (Detailed)
```bash
# Run the test script
node test-db-connection.js
```

### Method 4: Direct SQL Query
```bash
# Execute a simple query
npx prisma db execute --stdin --command="SELECT 1 as test"
```

## Common Connection Issues and Solutions

### Issue 1: "Can't reach database server"
**Error**: `P1001: Can't reach database server at 'host:port'`

**Causes**:
- Database server is not running
- Wrong host/port in URL
- Firewall blocking connection
- Network issues

**Solutions**:
```bash
# Check if database server is running (for local databases)
# For PostgreSQL:
pg_isready -h localhost -p 5432

# For MySQL:
mysqladmin ping -h localhost -p 3306

# Check network connectivity
telnet host port
```

### Issue 2: "Authentication failed"
**Error**: `P1010: User 'username' was denied access on the database 'database_name'`

**Causes**:
- Wrong username/password
- User doesn't have permissions
- Database doesn't exist

**Solutions**:
```bash
# Test credentials directly
# For PostgreSQL:
psql "postgresql://username:password@host:port/database_name"

# For MySQL:
mysql -u username -p -h host -P port database_name
```

### Issue 3: "Database does not exist"
**Error**: `P1003: Database 'database_name' does not exist`

**Solutions**:
```bash
# Create database
# For PostgreSQL:
createdb database_name

# For MySQL:
mysql -u root -p -e "CREATE DATABASE database_name"
```

### Issue 4: "URL must start with protocol"
**Error**: `the URL must start with the protocol 'postgresql://' or 'postgres://'`

**Causes**:
- Wrong database provider in schema
- Malformed URL

**Solutions**:
```bash
# Check .env file format
DATABASE_URL="postgresql://username:password@host:port/database_name?sslmode=require"

# Check schema.prisma provider
datasource db {
  provider = "postgresql"  # Must match URL protocol
  url      = env("DATABASE_URL")
}
```

## Database URL Formats

### PostgreSQL
```
postgresql://username:password@host:port/database_name?sslmode=require
```

### MySQL
```
mysql://username:password@host:port/database_name
```

### SQLite
```
file:./dev.db
```

### SQL Server
```
sqlserver://username:password@host:port/database_name
```

## Testing Checklist

### Before Testing
1. ✅ Check if database server is running
2. ✅ Verify credentials are correct
3. ✅ Ensure database exists
4. ✅ Check network connectivity
5. ✅ Verify URL format is correct

### After Testing
1. ✅ Connection successful
2. ✅ Can execute queries
3. ✅ Tables exist and are accessible
4. ✅ Prisma client is generated
5. ✅ Application can connect

## Production Environment Testing

### Vercel Environment Variables
1. Go to Vercel dashboard
2. Navigate to your project
3. Go to Settings → Environment Variables
4. Verify `DATABASE_URL` is correct
5. Redeploy the application

### Cloud Database Testing
```bash
# Test connection from your local machine first
# Then test from deployment environment

# For Neon.tech, use their connection tester
# For Supabase, use their SQL editor
# For AWS RDS, use RDS console
```

## Automated Testing

### Add to Your Application
```javascript
// lib/db-test.js
import { PrismaClient } from '@prisma/client';

export async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1 as test`;
    return { success: true, message: 'Database connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  } finally {
    await prisma.$disconnect();
  }
}
```

### Health Check Endpoint
```javascript
// pages/api/health.js
import { testDatabaseConnection } from '@/lib/db-test';

export default async function handler(req, res) {
  const dbTest = await testDatabaseConnection();
  
  if (dbTest.success) {
    res.status(200).json({ status: 'healthy', database: dbTest });
  } else {
    res.status(500).json({ status: 'unhealthy', database: dbTest });
  }
}
```

## Current Status: ✅ WORKING

Your HASHI BANK database connection is now working properly:

- ✅ **Database Engine**: PostgreSQL
- ✅ **Connection**: Neon.tech cloud database
- ✅ **Tables**: Settings, User, Deposit
- ✅ **Data**: 2 users, 1 setting record
- ✅ **Prisma Client**: Generated and ready
- ✅ **URL Format**: Correct PostgreSQL format

The application should now work correctly on Vercel with the proper database configuration.