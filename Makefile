.PHONY: help install clean dev build lint start stop test check

# Default target
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Installation
install: ## Install all dependencies
	npm install

install-app: ## Install app dependencies only
	cd app && npm install

# Development
dev: stop ## Start development server
	npm run dev &

dev-open: stop ## Start development server and open browser
	npm run dev:open &

# Building
build: ## Build app for production
	npm run build

# Linting
lint: ## Run linting on app code
	npm run lint

lint-fix: ## Fix linting issues automatically
	cd app && npm run lint -- --fix || true

# Production
start: stop ## Start production server
	npm start &

start-open: stop ## Start production server and open browser
	npm run start:open &

# Browser
open: ## Open app in browser (http://localhost:3000)
	npm run open:app

# Maintenance
clean: ## Clean all build artifacts and dependencies
	npm run clean

clean-deps: ## Remove all node_modules
	rm -rf node_modules app/node_modules

clean-build: ## Remove build artifacts
	rm -rf app/dist

# Git helpers
status: ## Show git status
	git status

commit: ## Stage and commit changes (use MESSAGE="your message")
	git add .
	git commit -m "$(MESSAGE)"

push: ## Push changes to remote
	git push origin main

# Process Management
stop: ## Stop any running servers on ports 3000-3001
	@echo "🛑 Stopping servers..."
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	@lsof -ti:3001 | xargs kill -9 2>/dev/null || true
	@echo "✅ Servers stopped"

# Utility
check: ## Check project health
	@echo "🔍 Checking project health..."
	@echo "📦 Root dependencies:"
	@npm list --depth=0 2>/dev/null || echo "  No dependencies or issues found"
	@echo "🎯 App dependencies:" 
	@cd app && npm list --depth=0 2>/dev/null || echo "  No dependencies or issues found"
	@echo "✅ Health check complete"