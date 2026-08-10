# PhoenixAI Studio - Netlify Deployment Guide

## Pre-Deployment Checklist

- [ ] Application builds successfully locally: `npm run build`
- [ ] Prisma schema validated: `npx prisma validate`
- [ ] Database migrations up to date: `npx prisma migrate status`
- [ ] Production MySQL database configured (Railway)
- [ ] Domain `phoenixai.studio` purchased/available

## Manual Netlify Deployment Instructions

### Step 1: Prepare Git Repository

1. Ensure all changes are committed to Git
2. Push repository to GitHub/GitLab/Bitbucket
3. Verify repository is accessible

### Step 2: Create Netlify Site

1. Log in to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Select your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Netlify to access your repository
5. Select the `phoenixaistudio` repository
6. Click "Import site"

### Step 3: Configure Build Settings

**Build Settings:**
- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Node version:** `18.x` (or latest LTS)

**Environment Variables:**

In Netlify Dashboard → Site settings → Environment variables, add:

**Required Variables:**
```
DATABASE_URL=<your-railway-mysql-connection-string>
JWT_SECRET=<strong-random-string-min-32-chars>
NEXTAUTH_SECRET=<strong-random-string-min-32-chars>
NEXTAUTH_URL=https://phoenixai.studio
NEXT_PUBLIC_SITE_URL=https://phoenixai.studio
ADMIN_PASSWORD=<strong-production-password>
```

**Optional Variables (for AI features):**
```
GEMINI_API_KEY=<your-gemini-api-key>
OPENAI_API_KEY=<your-openai-api-key>
```

**Optional Variables (for email):**
```
EMAIL_USER=<your-email>
EMAIL_PASS=<your-email-password>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Step 4: Deploy

1. Click "Deploy site"
2. Wait for build to complete (approximately 2-5 minutes)
3. Verify deployment status shows "Published"

### Step 5: Configure Domain

1. In Netlify Dashboard → Domain settings
2. Click "Add custom domain"
3. Enter: `phoenixai.studio`
4. Follow DNS configuration instructions provided by Netlify
5. Wait for DNS propagation (typically 24-48 hours)
6. Verify SSL certificate is automatically provisioned

### Step 6: Verify Deployment

After deployment is complete, test:

**Public Pages:**
- https://phoenixai.studio
- https://phoenixai.studio/services
- https://phoenixai.studio/packages
- https://phoenixai.studio/portfolio
- https://phoenixai.studio/ai-agents
- https://phoenixai.studio/demo-models
- https://phoenixai.studio/core-systems
- https://phoenixai.studio/testimonials
- https://phoenixai.studio/salon-booking

**Admin:**
- https://phoenixai.studio/login

**API Endpoints:**
- https://phoenixai.studio/api/services/public
- https://phoenixai.studio/api/packages
- https://phoenixai.studio/api/projects
- https://phoenixai.studio/api/ai-agents/public
- https://phoenixai.studio/api/core-systems

## Troubleshooting

### Build Fails

1. Check Netlify deploy logs for specific error
2. Verify environment variables are set correctly
3. Ensure DATABASE_URL is MySQL connection string (not SQLite)
4. Check that Prisma client generation succeeds

### Database Connection Errors

1. Verify DATABASE_URL is correct MySQL connection string
2. Ensure Railway MySQL database is accessible
3. Check firewall allows Netlify IP addresses
4. Verify SSL/TLS settings match database requirements

### Page Not Found Errors

1. Verify Next.js configuration in `next.config.js`
2. Check that publish directory is `.next`
3. Ensure build command is `npm run build`

### API 500 Errors

1. Check Netlify function logs
2. Verify environment variables are loaded
3. Ensure database connection is working
4. Check for runtime errors in function logs

## Post-Deployment Database Operations

If database seeding is required on production:

1. SSH into Railway MySQL database
2. Run seed script using Railway console or direct MySQL connection
3. DO NOT run seed script on Netlify (it's a build artifact only)

## Security Notes

- Never commit `.env` files to Git
- Use strong, unique secrets for production
- Rotate secrets if compromised
- Enable 2FA on Netlify account
- Regularly update dependencies
- Monitor Netlify deploy logs for suspicious activity

## Rollback Procedure

If deployment fails or causes issues:

1. In Netlify Dashboard → Deploys
2. Click on previous successful deploy
3. Click "Rollback to this deploy"
4. Verify site is functioning correctly
5. Investigate failure in separate branch
