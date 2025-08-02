-- SQL Commands to fix "Data too long for column 'address'" error
-- Run these commands in your MySQL database

-- Update customprof table to support longer addresses
ALTER TABLE customprof MODIFY COLUMN address TEXT;

-- Update task table to support longer addresses (if it has an address column)
ALTER TABLE task MODIFY COLUMN address TEXT;

-- Check the updated table structures
DESCRIBE customprof;
DESCRIBE task;

-- Alternative option if you want to set a specific limit (e.g., 2000 characters):
-- ALTER TABLE customprof MODIFY COLUMN address VARCHAR(2000);
-- ALTER TABLE task MODIFY COLUMN address VARCHAR(2000);

-- Note: TEXT datatype can store up to 65,535 characters
-- VARCHAR(n) can store up to n characters (max 65,535 in MySQL)
