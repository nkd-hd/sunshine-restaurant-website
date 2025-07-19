#!/bin/bash

# Production Database Deployment Script
# This script handles the complete production database setup and migration

set -e  # Exit on any error

echo "🚀 Starting Production Database Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    required_vars=("DATABASE_URL" "AUTH_SECRET" "NODE_ENV")
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    print_success "All required environment variables are set"
}

# Test database connection
test_connection() {
    print_status "Testing database connection..."
    
    if npm run db:test; then
        print_success "Database connection successful"
    else
        print_error "Database connection failed"
        exit 1
    fi
}

# Backup existing database (if applicable)
backup_database() {
    print_status "Creating database backup..."
    
    # This is a placeholder - implement actual backup logic based on your database provider
    # For SingleStore Cloud, you might use their backup API
    # For other providers, use mysqldump or similar tools
    
    timestamp=$(date +"%Y%m%d_%H%M%S")
    backup_name="backup_${timestamp}"
    
    print_warning "Backup functionality not implemented - please ensure you have a backup strategy"
    print_status "Recommended backup name: $backup_name"
}

# Generate and review migrations
generate_migrations() {
    print_status "Generating database migrations..."
    
    if npm run db:generate; then
        print_success "Migrations generated successfully"
        
        # List generated migration files
        if [ -d "drizzle" ]; then
            print_status "Generated migration files:"
            ls -la drizzle/
        fi
    else
        print_error "Failed to generate migrations"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    if npm run db:migrate; then
        print_success "Migrations completed successfully"
    else
        print_error "Migration failed"
        print_warning "You may need to rollback or fix the migration manually"
        exit 1
    fi
}

# Verify database schema
verify_schema() {
    print_status "Verifying database schema..."
    
    # Test basic database operations
    if npm run db:test; then
        print_success "Database schema verification passed"
    else
        print_error "Database schema verification failed"
        exit 1
    fi
}

# Seed initial data (optional)
seed_data() {
    if [ "$1" = "--seed" ]; then
        print_status "Seeding initial data..."
        
        if npm run db:seed; then
            print_success "Database seeded successfully"
        else
            print_warning "Database seeding failed - continuing anyway"
        fi
    else
        print_status "Skipping data seeding (use --seed flag to enable)"
    fi
}

# Test application endpoints
test_endpoints() {
    print_status "Testing application endpoints..."
    
    # Test health endpoint
    if curl -f http://localhost:3000/api/health/database > /dev/null 2>&1; then
        print_success "Health endpoint responding"
    else
        print_warning "Health endpoint not responding (app may not be running)"
    fi
}

# Main deployment function
deploy() {
    print_status "Starting production database deployment..."
    
    # Pre-deployment checks
    check_env_vars
    test_connection
    
    # Backup (if needed)
    backup_database
    
    # Migration process
    generate_migrations
    
    # Confirm before proceeding
    echo ""
    print_warning "About to run migrations on production database"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled by user"
        exit 0
    fi
    
    # Run migrations
    run_migrations
    verify_schema
    
    # Optional seeding
    seed_data "$1"
    
    # Post-deployment tests
    test_endpoints
    
    print_success "🎉 Production database deployment completed successfully!"
    
    # Print next steps
    echo ""
    print_status "Next steps:"
    echo "1. Monitor application logs for any issues"
    echo "2. Test all application features"
    echo "3. Monitor database performance"
    echo "4. Set up monitoring and alerts"
    echo ""
    print_status "Health check URL: /api/health/database"
}

# Script usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --seed    Seed the database with initial data"
    echo "  --help    Show this help message"
    echo ""
    echo "Environment variables required:"
    echo "  DATABASE_URL    Production database connection string"
    echo "  AUTH_SECRET     Authentication secret key"
    echo "  NODE_ENV        Should be set to 'production'"
    echo ""
    echo "Example:"
    echo "  $0 --seed"
}

# Parse command line arguments
case "${1:-}" in
    --help)
        usage
        exit 0
        ;;
    --seed)
        deploy --seed
        ;;
    "")
        deploy
        ;;
    *)
        print_error "Unknown option: $1"
        usage
        exit 1
        ;;
esac
