-- HASHI BANK Sample Data Insertion
-- Insert PIN, users, and sample deposits

-- Insert the settings with PIN 7042
INSERT INTO "Settings" ("pin") VALUES ('7042');

-- Insert the two users
INSERT INTO "User" ("name") VALUES ('Shobuj');
INSERT INTO "User" ("name") VALUES ('Shitu');

-- Insert sample deposits (optional - for testing)
-- Get the user IDs first (they will be auto-generated)
-- Assuming Shobuj gets id=1 and Shitu gets id=2

-- Sample deposits for Shobuj
INSERT INTO "Deposit" ("amount", "month", "year", "userId") VALUES (5000.00, 'January', '2024', 1);
INSERT INTO "Deposit" ("amount", "month", "year", "userId") VALUES (4500.00, 'February', '2024', 1);
INSERT INTO "Deposit" ("amount", "month", "year", "userId") VALUES (6000.00, 'March', '2024', 1);

-- Sample deposits for Shitu
INSERT INTO "Deposit" ("amount", "month", "year", "userId") VALUES (5500.00, 'January', '2024', 2);
INSERT INTO "Deposit" ("amount", "month", "year", "userId") VALUES (4800.00, 'February', '2024', 2);
INSERT INTO "Deposit" ("amount", "month", "year", "userId") VALUES (5200.00, 'March', '2024', 2);

-- Verify all data
SELECT 'All data insertion completed!' as status;

-- Display all data
SELECT 'Settings:' as table;
SELECT * FROM "Settings";

SELECT 'Users:' as table;
SELECT * FROM "User";

SELECT 'Deposits:' as table;
SELECT * FROM "Deposit";