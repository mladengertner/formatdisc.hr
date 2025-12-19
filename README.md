... existing code ...

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- npm or yarn
- Git
- Docker (optional, for local deployment)
- OpenSSL (for production ENV generation)

### **Installation**

```bash
# Clone the repository
git clone https://github.com/formatdisc/v0-nvidia-playground-monorepo.git
cd v0-nvidia-playground-monorepo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev
```

### **Production ENV Generation**

Generate secure production environment variables with real secrets:

```bash
# Generate production ENV with OpenSSL
chmod +x scripts/generate-production-env.sh
./scripts/generate-production-env.sh

# Edit generated .env.production with real URLs
nano .env.production

# Add to Vercel
vercel env add STRIPE_SECRET_KEY production < .env.production
# ... repeat for all variables

# Deploy to production
npm run deploy:production
```

**Security Notes:**
- Never commit `.env.production` to Git (already in `.gitignore`)
- Rotate all secrets every 90 days
- Use 1Password or HashiCorp Vault for team secret sharing
- Enable 2FA on all service accounts (Supabase, Stripe, Vercel)

... existing code ...
```

```json file="" isHidden
