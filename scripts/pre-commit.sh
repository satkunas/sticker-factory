#!/bin/bash

# Pre-commit hook for automated testing
# Following behavioral guidelines: auto-run quick tests after changes

set -e

echo "🔍 Pre-commit checks..."

# Check if we're in the app directory
if [ ! -f "app/package.json" ]; then
    echo "❌ Must be run from project root"
    exit 1
fi

# Run linting first
echo "📝 Running linter..."
cd app
npm run lint 2>/dev/null || {
    echo "❌ Linting failed. Fix errors before committing."
    exit 1
}

# Run quick tests
echo "🧪 Running quick tests..."
npm run test:run 2>/dev/null || {
    echo "❌ Tests failed. Fix failing tests before committing."
    echo "💡 Run 'make test-full' for detailed output"
    exit 1
}

# Type checking
echo "🔍 Type checking..."
npm run build:check 2>/dev/null || {
    echo "❌ Type checking failed. Fix type errors before committing."
    exit 1
}

echo "✅ All pre-commit checks passed!"
exit 0