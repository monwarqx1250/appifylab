-- AlterTable
ALTER TABLE "Post" ADD COLUMN "authorFirstName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "authorLastName" TEXT NOT NULL DEFAULT '';

-- Backfill existing posts with author names
UPDATE "Post" p
SET "authorFirstName" = u."firstName", "authorLastName" = u."lastName"
FROM "User" u
WHERE p."authorId" = u.id AND p."authorFirstName" = '';