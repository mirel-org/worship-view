-- CreateTable
CREATE TABLE "songs" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "content" JSONB NOT NULL,
    "arrangements" JSONB NOT NULL,

    CONSTRAINT "songs_pkey" PRIMARY KEY ("id")
);
