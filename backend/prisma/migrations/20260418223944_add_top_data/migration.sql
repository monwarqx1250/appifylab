-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "topComments" JSONB DEFAULT '[]',
ADD COLUMN     "topLikers" JSONB DEFAULT '[]',
ALTER COLUMN "authorFirstName" DROP DEFAULT,
ALTER COLUMN "authorLastName" DROP DEFAULT;
