-- CreateEnum
CREATE TYPE "status_enum" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "auth_action_type_enum" AS ENUM ('LOGIN', 'PASSWORD_RESET', 'TWO_FACTOR_VERIFICATION');

-- CreateEnum
CREATE TYPE "two_factor_method_enum" AS ENUM ('SMS', 'TOTP', 'EMAIL');

-- CreateTable
CREATE TABLE "outbox" (
    "id" UUID NOT NULL,
    "event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_data" JSONB NOT NULL,
    "status" "status_enum" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limits" (
    "id" UUID NOT NULL,
    "service_name" VARCHAR(256) NOT NULL,
    "max_attempts" INTEGER NOT NULL,
    "windows_size_seconds" INTEGER NOT NULL,
    "block_duration_seconds" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fingerprint" TEXT,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_auth_attempts" (
    "id" UUID NOT NULL,
    "rate_limit_id" UUID NOT NULL,
    "action_type" "auth_action_type_enum" NOT NULL,
    "ip_address" TEXT,
    "user_id" UUID,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "first_attempt_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_attempt_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "block_reason" TEXT,
    "block_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_auth_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_auth_credentials" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(16),
    "password_hash" VARCHAR(1024) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_auth_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_security_settings" (
    "user_id" UUID NOT NULL,    
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "account_blocked" BOOLEAN NOT NULL DEFAULT false,
    "blocked_until" TIMESTAMP(3),
    "block_reason" TEXT,
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "session_timeout" INTEGER,
    "login_notifications" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_method" "two_factor_method_enum",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_security_settings_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "session_token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "fingerprint" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_activity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "outbox_event_id_key" ON "outbox"("event_id");

-- CreateIndex
CREATE INDEX "outbox_status_idx" ON "outbox"("status");

-- CreateIndex
CREATE INDEX "outbox_created_at_idx" ON "outbox"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "rate_limits_service_name_idx" ON "rate_limits"("service_name");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_fingerprint_idx" ON "refresh_tokens"("user_id", "fingerprint");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_credentials_user_id_key" ON "user_auth_credentials"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_credentials_email_key" ON "user_auth_credentials"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_credentials_phone_key" ON "user_auth_credentials"("phone");

-- CreateIndex
CREATE INDEX "credentials_email_phone_idx" ON "user_auth_credentials"("email", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "user_security_settings_user_id_key" ON "user_security_settings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_session_token_key" ON "user_sessions"("session_token");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_auth_credentials_fkey" FOREIGN KEY ("user_id") REFERENCES "user_auth_credentials"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_auth_credentials_fkey" FOREIGN KEY ("user_id") REFERENCES "user_auth_credentials"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_auth_attempts" ADD CONSTRAINT "user_auth_attempts_auth_credentials_fkey" FOREIGN KEY ("user_id") REFERENCES "user_auth_credentials"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_auth_attempts" ADD CONSTRAINT "user_auth_attempts_rate_limits_fkey" FOREIGN KEY ("rate_limit_id") REFERENCES "rate_limits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_security_settings" ADD CONSTRAINT "user_security_settings_auth_credentials_fkey" FOREIGN KEY ("user_id") REFERENCES "user_auth_credentials"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_auth_credentials_fkey" FOREIGN KEY ("user_id") REFERENCES "user_auth_credentials"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
