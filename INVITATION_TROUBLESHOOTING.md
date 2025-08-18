# Invitation System Troubleshooting Guide

This guide helps diagnose and fix common issues with the Banerry invitation system.

## Quick Diagnostics

Run the automated validation script:
```bash
./test-invitation.sh
```

## Common Issues and Solutions

### 1. "Invitation emails not working locally"

**Symptoms:**
- Email invitation buttons don't work when clicked
- Invitation page shows loading indefinitely 
- Console errors about missing environment variables

**Solution:**
```bash
# 1. Copy environment template
cp .env.sample .env.local

# 2. Verify environment variables are set
grep "NEXT_PUBLIC_CONVEX_URL" .env.local
grep "CONVEX_DEPLOYMENT" .env.local

# 3. Restart development server
npm run dev:frontend
```

### 2. "Missing environment variable NEXT_PUBLIC_CONVEX_URL"

**Symptoms:**
- Application crashes with environment variable errors
- Cypress tests fail with missing env var errors

**Solution:**
Ensure `.env.local` contains:
```
CONVEX_DEPLOYMENT=dev:content-toucan-531
NEXT_PUBLIC_CONVEX_URL=https://content-toucan-531.convex.cloud
SITE_URL=http://localhost:3000
```

### 3. "Invitation page loads but shows 'Invalid Invitation'"

**Symptoms:**
- Email button works, invitation page loads
- Page immediately shows "Invalid Invitation" error

**Possible Causes:**
- Convex backend not running
- Database connection issues
- Token not found in database

**Solution:**
```bash
# Start the full development stack
npm run dev  # Starts both frontend and backend

# Or start backend separately
npm run dev:backend
```

### 4. "TypeError: Cannot read properties of undefined"

**Symptoms:**
- JavaScript errors in browser console
- Invitation page partially loads but crashes

**Solution:**
Check that all required dependencies are installed:
```bash
npm install --legacy-peer-deps
```

### 5. Email URLs pointing to wrong domain

**Symptoms:**
- Email invitation URLs point to production/wrong URL
- Local testing shows incorrect base URL

**Solution:**
Verify `SITE_URL` in `.env.local`:
```
SITE_URL=http://localhost:3000
```

## Manual Testing Steps

### Test Invitation Page Directly

1. Start development server:
   ```bash
   npm run dev:frontend
   ```

2. Visit test invitation URL:
   ```
   http://localhost:3000/invitation/test-token-123
   ```

3. Expected behavior:
   - Page loads without errors
   - Shows "Invalid Invitation" (expected for fake token)
   - "Go to Sign In" button works

### Test Email Template Generation

Check that email templates generate correct URLs by examining the Convex functions:

```bash
# Search for invitation URL generation
grep -A 5 -B 5 "invitation.*baseUrl" convex/learners.ts
```

Expected format: `${baseUrl}/invitation/${token}`

### Test Complete Flow

1. **Prerequisites:**
   - `.env.local` properly configured
   - Development server running (`npm run dev:frontend`)
   - Convex backend accessible

2. **Run automated tests:**
   ```bash
   npm run cy:run
   ```

3. **Manual flow test:**
   - Navigate to mentor dashboard
   - Share a learner with a test email
   - Check browser network tab for API calls
   - Verify no console errors

## Environment Setup Checklist

- [ ] `.env.local` file exists
- [ ] `NEXT_PUBLIC_CONVEX_URL` is set
- [ ] `CONVEX_DEPLOYMENT` is set  
- [ ] `SITE_URL=http://localhost:3000` for local development
- [ ] Dependencies installed with `npm install --legacy-peer-deps`
- [ ] Frontend server running on port 3000
- [ ] No JavaScript console errors
- [ ] Invitation page loads at `/invitation/test-token`

## Debugging Commands

```bash
# Check environment variables
cat .env.local

# Validate TypeScript compilation
npx tsc --noEmit

# Test build process
npm run build

# Run linting
npm run lint

# Check for missing dependencies
npm install --dry-run

# Validate invitation system components
./test-invitation.sh
```

## Still Having Issues?

If problems persist after following this guide:

1. **Clear browser cache and restart browser**
2. **Check browser developer console for errors**
3. **Verify Convex dashboard shows active deployment**
4. **Test with different email addresses**
5. **Check Resend dashboard for email delivery logs**

## Contact Information

If you continue experiencing issues, please provide:
- Output of `./test-invitation.sh`
- Browser console error messages
- Network tab showing failed requests
- Your `.env.local` file (with sensitive values redacted)