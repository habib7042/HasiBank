-- Create Settings table
CREATE TABLE "Settings" (
    "id" SERIAL PRIMARY KEY,
    "pin" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create User table
CREATE TABLE "User" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Deposit table
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

-- Insert initial data
INSERT INTO "Settings" ("id", "pin") VALUES (1, '7042');
INSERT INTO "User" ("id", "name") VALUES (1, 'Shobuj');
INSERT INTO "User" ("id", "name") VALUES (2, 'Shitu');

-- Verify the setup
SELECT 'Database setup completed successfully!' as status;
SELECT 'Settings:' as table;
SELECT * FROM "Settings";
SELECT 'Users:' as table;
SELECT * FROM "User";