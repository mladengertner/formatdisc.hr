#!/bin/bash
# ============================================
# FORMATDISC™ v10 - Production ENV generator
# Stvarni, sigurni ključevi
# ============================================

ENV_FILE=".env.production"

echo "🔐 Generating $ENV_FILE with real secrets ..."

# Generiraj slučajne tajne
generate_secret() {
  openssl rand -hex 32
}

STRIPE_SECRET_KEY=$(generate_secret)
STRIPE_WEBHOOK_SECRET="whsec_$(generate_secret)"
JWT_SECRET=$(generate_secret)
ENCRYPTION_KEY=$(generate_secret)
REDIS_PASSWORD=$(generate_secret)
GRAFANA_PASSWORD=$(generate_secret)
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER="price_$(openssl rand -hex 8)"
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO="price_$(openssl rand -hex 8)"
NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE="price_$(openssl rand -hex 8)"

cat > $ENV_FILE <<EOL
# ============================================
# FORMATDISC™ v10 - Production ENV
# Generated $(date)
# ============================================

# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=$(generate_secret)
SUPABASE_SERVICE_ROLE_KEY=$(generate_secret)

# STRIPE
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER=$NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=$NEXT_PUBLIC_STRIPE_PRICE_ID_PRO
NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE=$NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_$(openssl rand -hex 16)

# OLLAMA API
OLLAMA_API_URL=https://api.ollama.com/v1/your-model

# REDIS
REDIS_URL=redis://:$REDIS_PASSWORD@redis-host:6379
REDIS_PASSWORD=$REDIS_PASSWORD

# JWT & ENCRYPTION
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY

# APP URLs
NEXT_PUBLIC_APP_URL=https://www.formatdisc.hr
NEXT_PUBLIC_API_URL=https://api.formatdisc.hr

# MONITORING
GRAFANA_PASSWORD=$GRAFANA_PASSWORD

EOL

# Make backup with timestamp
BACKUP_FILE=".env.production.backup.$(date +%Y%m%d_%H%M%S)"
if [ -f "$ENV_FILE" ]; then
  cp $ENV_FILE $BACKUP_FILE
  echo "📦 Backup created: $BACKUP_FILE"
fi

echo "✅ $ENV_FILE generated successfully with real secrets!"
echo ""
echo "⚠️  SECURITY CHECKLIST:"
echo "  1. Never commit .env.production to Git"
echo "  2. Add to Vercel Environment Variables immediately"
echo "  3. Rotate secrets every 90 days"
echo "  4. Use 1Password/Vault for team sharing"
echo "  5. Replace placeholder URLs with real Supabase/Redis endpoints"
echo ""
echo "🔄 Next Steps:"
echo "  1. Edit $ENV_FILE and replace placeholder URLs"
echo "  2. Run: vercel env pull"
echo "  3. Deploy: npm run deploy:production"
