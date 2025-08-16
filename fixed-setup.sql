-- HASHI BANK Database Setup Script
-- Fixed version for Neon.tech PostgreSQL

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS "Deposit" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Settings" CASCADE;

-- Create the Settings table (fixed for PostgreSQL)
CREATE TABLE "Settings" (
    "id" TEXT PRIMARY KEY,
    "pin" TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the User table (fixed for PostgreSQL)
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the Deposit table (fixed for PostgreSQL)
CREATE TABLE "Deposit" (
    "id" TEXT PRIMARY KEY,
    "amount" DOUBLE PRECISION NOT NULL,
    "month" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE INDEX "Deposit_userId_idx" ON "Deposit"("userId");

-- Insert the settings with PIN 7042 (using a simple UUID)
INSERT INTO "Settings" ("id", "pin") VALUES ('550e8400-e29b-41d4-a716-446655440000', '7042');

-- Insert the two users (using simple UUIDs)
INSERT INTO "User" ("id", "name") VALUES ('550e8400-e29b-41d4-a716-446655440001', 'Shobuj');
INSERT INTO "User" ("id", "name") VALUES ('550e8400-e29b-41d4-a716-446655440002', 'Shitu');

-- Verify the setup
SELECT 'Database setup completed successfully!' as status;

-- Display the created data
SELECT 'Settings:' as table;
SELECT * FROM "Settings";

SELECT 'Users:' as table;
SELECT * FROM "User";