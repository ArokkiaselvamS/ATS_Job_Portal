INSERT INTO "User" ("firstName", "lastName", "email", "passwordHash", "role", "isActive", "isEmailVerified", "updatedAt")
VALUES ('John', 'Doe', 'john@example.com', '$2b$10$sWr1zJmqHSL2ba7Y2frFQ.JebQ76oNkw.BLDVMKJBfzL8AxzdTvby', 'JOB_SEEKER', true, true, NOW())
ON CONFLICT ("email") DO NOTHING;
