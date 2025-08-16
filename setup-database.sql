-- HASHI BANK Database Setup Script
-- This script creates the necessary tables and sets up the initial data

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS "Deposit" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Settings" CASCADE;

-- Create the Settings table
CREATE TABLE "Settings" (
    "id" SERIAL PRIMARY KEY,
    "pin" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the User table
CREATE TABLE "User" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the Deposit table
CREATE TABLE "Deposit" (
    "id" SERIAL PRIMARY KEY,
    "amount" DECIMAL(10,2) NOT NULL,
    "month" VARCHAR(255) NOT NULL,
    "year" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE INDEX "Deposit_userId_idx" ON "Deposit"("userId");
CREATE INDEX "Deposit_month_year_idx" ON "Deposit"("month", "year");

-- Insert the settings with PIN 7042
INSERT INTO "Settings" ("id", "pin") VALUES (1, '7042');

-- Insert the two users
INSERT INTO "User" ("id", "name") VALUES (1, 'Shobuj');
INSERT INTO "User" ("id", "name") VALUES (2, 'Shitu');

-- Verify the setup
SELECT 'Database setup completed successfully!' as status;

-- Display the created data
SELECT 'Settings:' as table;
SELECT * FROM "Settings";

SELECT 'Users:' as table;
SELECT * FROM "User";