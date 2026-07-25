-- CreateTable
CREATE TABLE "SavedList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedListItem" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedListItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedList_userId_idx" ON "SavedList"("userId");

-- CreateIndex
CREATE INDEX "SavedListItem_listId_idx" ON "SavedListItem"("listId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedListItem_listId_productId_key" ON "SavedListItem"("listId", "productId");

-- AddForeignKey
ALTER TABLE "SavedList" ADD CONSTRAINT "SavedList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedListItem" ADD CONSTRAINT "SavedListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "SavedList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
