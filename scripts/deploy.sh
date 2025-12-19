#!/bin/bash
# FormatDisc.hr Production Deployment Script
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
echo "🚀 Deploying FormatDisc.hr to ${ENVIRONMENT}..."

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    export $(cat .env.${ENVIRONMENT} | xargs)
else
    echo "❌ Environment file .env.${ENVIRONMENT} not found!"
    exit 1
fi

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check if required environment variables are set
REQUIRED_VARS=(
    "POSTGRES_URL"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "STRIPE_SECRET_KEY"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set!"
        exit 1
    fi
done

echo "✅ All required environment variables are set"

# Build Docker images
echo "🏗️ Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Run database migrations
echo "📊 Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm frontend npm run db:migrate

# Start services
echo "🎬 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Health check
echo "🏥 Running health checks..."
FRONTEND_HEALTH=$(curl -sf http://localhost/health || echo "unhealthy")

if [ "$FRONTEND_HEALTH" = "healthy" ]; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed!"
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "🌐 Application is running at https://formatdisc.hr"
echo "📊 Monitoring dashboard: https://monitoring.formatdisc.hr"
echo ""
echo "📝 Useful commands:"
echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Restart: docker-compose -f docker-compose.prod.yml restart"
echo "  - Stop: docker-compose -f docker-compose.prod.yml down"
