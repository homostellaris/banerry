# Testing the Invitation System

This document explains how to test the invitation system for sharing learners with non-users.

## Quick Validation

Run the basic validation script to check if the invitation system is properly set up:

```bash
./test-invitation.sh
```

This script validates:
- File structure
- Function definitions
- Email template configuration
- TypeScript compilation
- Build process
- URL format correctness

## End-to-End Testing with Cypress

## Prerequisites

⚠️ **Environment Setup Required** ⚠️

1. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.sample .env.local
   ```
   
   Ensure `.env.local` contains:
   ```
   CONVEX_DEPLOYMENT=dev:content-toucan-531
   NEXT_PUBLIC_CONVEX_URL=https://content-toucan-531.convex.cloud
   SITE_URL=http://localhost:3000
   ```

3. **Verify setup:**
   ```bash
   ./test-invitation.sh
   ```

📚 **Having Issues?** See [INVITATION_TROUBLESHOOTING.md](./INVITATION_TROUBLESHOOTING.md) for detailed debugging steps.

### Running Tests

#### Interactive Mode (Recommended for Development)

1. Start the frontend development server:
   ```bash
   npm run dev:frontend
   ```

2. In another terminal, open Cypress:
   ```bash
   npm run cy:open
   ```

3. Select "E2E Testing" and choose a browser
4. Run the `invitation-flow.cy.ts` test

#### Headless Mode (For CI/Automation)

Run tests in headless mode:
```bash
npm run test:e2e
```

Or run just Cypress tests (requires dev server to be running):
```bash
npm run cy:run
```

### Test Coverage

The Cypress tests cover:

1. **UI Structure Tests**
   - Invitation page loads correctly
   - Proper error states for invalid tokens
   - Navigation to sign-in page

2. **Invitation Flow Tests**
   - Sign-in redirection with invitation tokens
   - Proper button behavior
   - URL parameter handling

### Testing the Full Flow Manually

1. **Set up a mentor account:**
   - Visit `/signin` and create an account
   - Go to `/mentor` and create a learner

2. **Share with a non-user:**
   - Click the share button on a learner
   - Enter an email address that doesn't have an account
   - Verify you see "Invitation sent to [email]"

3. **Test the invitation email:**
   - Check your email service (Resend) for the invitation email
   - Verify the email contains the correct learner information
   - Click the "Accept Invitation" button in the email

4. **Test invitation acceptance:**
   - The link should take you to `/invitation/[token]`
   - You should see the invitation details
   - Clicking "Sign In to Accept" should take you to the sign-in page
   - After signing in, you should be redirected back and able to accept

### Troubleshooting

#### Email Not Sending

1. Check your `.env.local` file has `AUTH_RESEND_KEY` set
2. Verify your Resend domain is configured
3. Check the Convex logs for email sending errors

#### Invitation Page Not Loading

1. Verify the token is valid (check the database)
2. Check browser console for JavaScript errors
3. Ensure the Convex backend is running

#### Build/Test Failures

1. Run `npm run lint` to check for linting issues
2. Run `npm run build` to check for build errors
3. Ensure all dependencies are installed with `--legacy-peer-deps`

### Adding New Tests

To add new Cypress tests:

1. Create test files in `cypress/e2e/`
2. Use the custom commands defined in `cypress/support/commands.ts`
3. Add test IDs (`data-testid`) to UI elements for reliable testing

### Test Environment Notes

- Tests use `http://localhost:3000` as the base URL
- Database state is not automatically reset between tests
- Email delivery testing requires proper Resend configuration
- Some tests may require manual database setup for specific scenarios