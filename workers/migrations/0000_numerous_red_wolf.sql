-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "songs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"full_text" text NOT NULL,
	CONSTRAINT "songs_name_unique" UNIQUE("name")
);

*/