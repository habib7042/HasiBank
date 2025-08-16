-- HASHI BANK Database Setup Script
-- For new Neon.tech database: ep-red-dew-a1dte3uq-pooler.ap-southeast-1.aws.neon.tech

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS "Deposit" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Settings" CASCADE;

-- Create the Settings table (matches Prisma schema)
CREATE TABLE "Settings" (
    "id" SERIAL PRIMARY KEY,
    "pin" TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the User table (matches Prisma schema)
CREATE TABLE "User" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the Deposit table (matches Prisma schema)
CREATE TABLE "Deposit" (
    "id" SERIAL PRIMARY KEY,
    "amount" DOUBLE PRECISION NOT NULL,
    "month" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE INDEX "Deposit_userId_idx" ON "Deposit"("userId");

-- Insert the settings with PIN 7042
INSERT INTO "Settings" ("pin") VALUES ('7042');

-- Insert the two users
INSERT INTO "User" ("name") VALUES ('Shobuj');
INSERT INTO "User" ("name") VALUES ('Shitu');

-- Verify the setup
SELECT 'Database setup completed successfully!' as status;

-- Display the created data
SELECT 'Settings:' as table;
SELECT * FROM "Settings";

SELECT 'Users:' as table;
SELECT * FROM "User";