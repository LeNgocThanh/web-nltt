/*
  Warnings:

  - Added the required column `content_en` to the `posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_en` to the `posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description_en` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_en` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "content_en" TEXT NOT NULL,
    "excerpt" TEXT,
    "excerpt_en" TEXT,
    "featuredImage" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_posts" ("category", "content", "createdAt", "excerpt", "featuredImage", "id", "published", "slug", "title", "updatedAt") SELECT "category", "content", "createdAt", "excerpt", "featuredImage", "id", "published", "slug", "title", "updatedAt" FROM "posts";
DROP TABLE "posts";
ALTER TABLE "new_posts" RENAME TO "posts";
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");
CREATE TABLE "new_projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "image" TEXT,
    "category" TEXT NOT NULL,
    "capacity" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_projects" ("capacity", "category", "createdAt", "description", "id", "image", "location", "priority", "status", "title", "updatedAt") SELECT "capacity", "category", "createdAt", "description", "id", "image", "location", "priority", "status", "title", "updatedAt" FROM "projects";
DROP TABLE "projects";
ALTER TABLE "new_projects" RENAME TO "projects";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
