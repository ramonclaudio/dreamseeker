# Expo Starter App

Production-ready auth for Expo. Email/password + username login, password reset, rate limiting, real-time backend.

**Stack:** Expo SDK 55 (canary) · React 19 · Convex · Better Auth · Resend

## Features

- Sign up/in with email or username
- Password reset via email
- Protected routes with auto-redirect
- Rate limiting on auth endpoints
- Session persistence (7 day expiry)
- Email deliverability (SPF/DKIM/DMARC, bounce tracking)

## Quick Start

```bash
# 1. Install
npm install

# 2. Start Convex (creates deployment on first run)
npx convex dev

# 3. Create .env.local with values from Convex dashboard
cat > .env.local << 'EOF'
CONVEX_DEPLOYMENT=dev:your-deployment
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
EXPO_PUBLIC_SITE_URL=http://localhost:8081
EOF

# 4. Set server env vars
npx convex env set BETTER_AUTH_SECRET $(openssl rand -base64 32)
npx convex env set SITE_URL http://localhost:8081
npx convex env set RESEND_API_KEY re_xxxxxxxxxxxx
npx convex env set RESEND_FROM_EMAIL noreply@yourdomain.com

# 5. Run (requires Xcode, no Expo Go)
npm run ios
```

## Development

Two terminals:

```bash
npm run convex    # Terminal 1: backend
npm run ios       # Terminal 2: app (first run)
npm run start     # Terminal 2: app (subsequent)
```

## Environment Variables

**Client (.env.local):**
- `CONVEX_DEPLOYMENT` - Deployment name (e.g., `dev:amiable-seahorse-506`)
- `EXPO_PUBLIC_CONVEX_URL` - Convex cloud URL (`.convex.cloud`)
- `EXPO_PUBLIC_CONVEX_SITE_URL` - Convex site URL (`.convex.site`)
- `EXPO_PUBLIC_SITE_URL` - App URL for email links (`http://localhost:8081`)

**Server (Convex Dashboard → Settings → Environment Variables):**
- `BETTER_AUTH_SECRET` - Auth encryption key
- `SITE_URL` - App URL (same as `EXPO_PUBLIC_SITE_URL`)
- `RESEND_API_KEY` - From resend.com/api-keys
- `RESEND_FROM_EMAIL` - Verified sender domain
- `RESEND_TEST_MODE` - `false` for production (optional)
- `RESEND_WEBHOOK_SECRET` - From resend.com/webhooks (optional)

## Production

**DNS for email deliverability:**

```
@ TXT "v=spf1 include:_spf.resend.com ~all"
resend._domainkey TXT <from Resend dashboard>
_dmarc TXT "v=DMARC1; p=none;"
```

**Webhook (optional):** Point `https://your-deployment.convex.site/resend-webhook` to Resend webhooks for bounce/complaint tracking.

## Requirements

- Node 18+
- Xcode 16+ (iOS) or Android Studio
- Convex account (free)
- Resend account (free: 100 emails/day)
- **No Expo Go** - SDK 55 canary requires dev builds
