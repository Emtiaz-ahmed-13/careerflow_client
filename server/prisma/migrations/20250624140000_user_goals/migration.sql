-- CreateTable
CREATE TABLE "user_goals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "daily_target" INTEGER NOT NULL DEFAULT 1,
    "commitment_days" INTEGER NOT NULL DEFAULT 30,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_goals_user_id_key" ON "user_goals"("user_id");

-- AddForeignKey
ALTER TABLE "user_goals" ADD CONSTRAINT "user_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
