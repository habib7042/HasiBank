-- HASHI BANK Initial Data Insertion
-- Insert PIN and users into the new Neon.tech database

-- Insert the settings with PIN 7042
INSERT INTO "Settings" ("pin") VALUES ('7042');

-- Insert the two users
INSERT INTO "User" ("name") VALUES ('Shobuj');
INSERT INTO "User" ("name") VALUES ('Shitu');

-- Verify the data insertion
SELECT 'Data insertion completed!' as status;

-- Display the inserted data
SELECT 'Settings:' as table;
SELECT * FROM "Settings";

SELECT 'Users:' as table;
SELECT * FROM "User";

SELECT 'Deposits (should be empty):' as table;
SELECT * FROM "Deposit";