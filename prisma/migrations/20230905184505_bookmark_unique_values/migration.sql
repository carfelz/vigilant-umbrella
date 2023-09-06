/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `bookmarks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[link]` on the table `bookmarks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_title_key" ON "bookmarks"("title");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_link_key" ON "bookmarks"("link");
