-- CreateTable
CREATE TABLE "user_profiles" (
    "user_id" TEXT NOT NULL,
    "bio" TEXT,
    "followers_count" INTEGER NOT NULL DEFAULT 0,
    "response_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "response_time" TEXT,
    "joined_since" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
