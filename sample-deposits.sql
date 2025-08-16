-- HASHI BANK Sample Deposits (Optional)
-- Add some sample deposits to test the application

-- First, get the user IDs (run this to see the IDs)
SELECT * FROM "User";

-- Then insert sample deposits (replace the userId values with actual IDs from your database)
-- Example: If Shobuj has id=1 and Shitu has id=2:

-- Sample deposits for Shobuj
INSERT INTO "Deposit" ("amount", "month", "year", "userId") VALUES (1000.00, 'August', '2025', 1);
INSERT INTO "Deposit" ("amount", "month", "year", "userId") VALUES (1500.00, 'July', '2025', 1);
INSERT INTO "Deposit" ("amount", "month", "year", "userId") VALUES (2000.00, 'June', '2025', 1);

-- Sample deposits for Shitu
INSERT INTO "Deposit" ("amount", "month", "year", "userId") VALUES (1200.00, 'August', '2025', 2);
INSERT INTO "Deposit" ("amount", "month", "year", "userId") VALUES (1800.00, 'July', '2025', 2);
INSERT INTO "Deposit" ("amount", "month", "year", "userId") VALUES (2500.00, 'June', '2025', 2);

-- Verify all data
SELECT 'All data in database:' as status;
SELECT * FROM "Settings";
SELECT * FROM "User";
SELECT * FROM "Deposit";

-- Check totals (this should match what the app shows)
SELECT 
  u.name,
  SUM(d.amount) as total_amount,
  COUNT(d.id) as deposit_count
FROM "User" u
LEFT JOIN "Deposit" d ON u.id = d.userId
GROUP BY u.id, u.name;