import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check all environment variables
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? '***SET***' : '***NOT SET***',
      DATABASE_URL_LENGTH: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
      DATABASE_URL_START: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) : '',
      ALL_ENV_KEYS: Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('DB')),
    }

    console.log('Environment Variables Debug:', envVars)

    // Test database connection
    let dbTest = { success: false, error: '', tables: null }
    
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient({
        log: ['error'],
      })

      await prisma.$connect()
      
      // Simple query test
      const result = await prisma.$queryRaw`SELECT 1 as test`
      
      // Check tables
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      `
      
      dbTest = { 
        success: true, 
        error: '', 
        tables: tables 
      }
      
      await prisma.$disconnect()
    } catch (dbError) {
      dbTest = { 
        success: false, 
        error: dbError.message, 
        tables: null 
      }
    }

    return NextResponse.json({
      environment: envVars,
      database: dbTest,
      timestamp: new Date().toISOString(),
      vercel: {
        region: process.env.VERCEL_REGION || 'unknown',
        url: process.env.VERCEL_URL || 'unknown'
      }
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({
      error: 'Debug endpoint failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}