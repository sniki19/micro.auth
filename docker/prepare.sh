#!/bin/bash
set -euo pipefail

if [ -z "${MODE:-}" ]; then
    echo "❌ Ошибка: MODE не задан"
    exit 1
fi
echo "🔖 Режим приложения: ${MODE:-undefined}"


# --- Подготовка ---
ORIGINAL_DIR=$(pwd)   # dir name: "docker"
SHARED_DIR="$ORIGINAL_DIR/shared"
trap 'cd "$ORIGINAL_DIR"' EXIT

# --- Конфигурация ---
ROOT_DIR="$ORIGINAL_DIR/../"
BUILD_DIR="build.$MODE"


# --- Сборка проекта ---
echo "🔧 Генерация Prisma..."
cd "$ROOT_DIR"
yarn prisma:generate

echo "🛠️ Сборка проекта..."
yarn build
cd "$ORIGINAL_DIR"

# --- Подготовка папки build ---
echo "📂 Подготовка папки $BUILD_DIR..."

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# --- Копирование основных файлов ---
echo "📦 Копирование зависимостей..."
cp "$ROOT_DIR/package.json" "$ROOT_DIR/yarn.lock" "$BUILD_DIR/"

echo "🚀 Копирование собранного кода..."
cp -r "$ROOT_DIR/dist" "$BUILD_DIR/"

echo "💥 Копирование Proto-файлов..."
cp -r "$ROOT_DIR/proto" "$BUILD_DIR/"

# --- Копирование Prisma ---
echo "🔌 Копирование Prisma-файлов..."
mkdir -p "$BUILD_DIR/prisma"
cp "$ROOT_DIR/prisma/schema.prisma" \
  -r "$ROOT_DIR/prisma/migrations" \
  -r "$ROOT_DIR/prisma/models" \
  "$BUILD_DIR/prisma/"

# --- Копирование Docker-файлов ---
echo "🐳 Копирование Docker-конфигурации..."
cp "$ORIGINAL_DIR/$MODE/.env" "$BUILD_DIR/"

cp "$SHARED_DIR/Dockerfile" \
  "$SHARED_DIR/docker-compose.database.yaml" \
  "$SHARED_DIR/docker-compose.app.yaml" \
  "$SHARED_DIR/docker-compose.yaml" \
  "$BUILD_DIR/"

cp "$SHARED_DIR/app.mk" \
  "$SHARED_DIR/database.mk" \
  "$SHARED_DIR/Makefile" \
  "$BUILD_DIR/"

echo "✅ Готово! Сборка в $BUILD_DIR/"
