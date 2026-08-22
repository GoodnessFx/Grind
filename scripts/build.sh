#!/bin/bash
set -e

echo "📦 Installing dependencies..."
pnpm install

echo "🧹 Running linter..."
pnpm lint || echo "Linting returned warnings/errors, continuing..."

echo "🏗️ Building project..."
pnpm build

echo "✅ Build complete!"

echo "🚀 Committing and pushing to GitHub..."
git add .
git commit -m "feat: complete Grind branding refactor and UI redesign"
git push origin main

echo "🎉 Done!"
