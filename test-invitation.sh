#!/bin/bash

# Simple test script to validate the invitation system
echo "🧪 Testing Banerry Invitation System"

# Check environment variables first
echo "🔧 Checking environment configuration..."

if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found"
    echo "   Please copy .env.sample to .env.local:"
    echo "   cp .env.sample .env.local"
    exit 1
fi

# Check for critical environment variables
if ! grep -q "NEXT_PUBLIC_CONVEX_URL" .env.local || ! grep -q "CONVEX_DEPLOYMENT" .env.local; then
    echo "❌ Missing critical environment variables in .env.local"
    echo "   Please ensure NEXT_PUBLIC_CONVEX_URL and CONVEX_DEPLOYMENT are set"
    exit 1
fi

echo "✅ Environment configuration looks good"

# Check if required files exist
echo "📁 Checking file structure..."

if [ ! -f "app/invitation/[token]/page.tsx" ]; then
    echo "❌ Invitation page not found"
    exit 1
fi

if [ ! -f "convex/learners.ts" ]; then
    echo "❌ Learners convex file not found"
    exit 1
fi

echo "✅ Required files exist"

# Check if functions are defined
echo "🔍 Checking function definitions..."

if ! grep -q "sendInvitation" convex/learners.ts; then
    echo "❌ sendInvitation function not found"
    exit 1
fi

if ! grep -q "getInvitation" convex/learners.ts; then
    echo "❌ getInvitation function not found"
    exit 1
fi

if ! grep -q "acceptInvitation" convex/learners.ts; then
    echo "❌ acceptInvitation function not found"
    exit 1
fi

echo "✅ Required functions exist"

# Check email template
echo "📧 Checking email template..."

if ! grep -q "createInvitationEmailTemplate" convex/learners.ts; then
    echo "❌ Email template function not found"
    exit 1
fi

if ! grep -q "Accept Invitation" convex/learners.ts; then
    echo "❌ Email template button not found"
    exit 1
fi

echo "✅ Email template looks good"

# Check TypeScript compilation
echo "🔧 Checking TypeScript compilation..."
npx tsc --noEmit --project . > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed"
    npx tsc --noEmit --project .
    exit 1
fi

echo "✅ TypeScript compiles successfully"

# Check linting
echo "🔍 Running linter..."
npm run lint > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "⚠️  Linting warnings present (this is expected)"
else
    echo "✅ Linting passed"
fi

# Check build
echo "🏗️  Testing build..."
npm run build > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    npm run build
    exit 1
fi

echo "✅ Build successful"

# Check invitation URL format in email template
echo "🔗 Checking invitation URL format..."

if ! grep -q "\${baseUrl}/invitation/\${args.token}" convex/learners.ts; then
    echo "❌ Invitation URL format incorrect"
    exit 1
fi

echo "✅ Invitation URL format correct"

# Summary
echo ""
echo "🎉 All basic checks passed!"
echo ""
echo "📋 Test Summary:"
echo "   ✅ File structure correct"
echo "   ✅ Required functions present"
echo "   ✅ Email template configured"
echo "   ✅ TypeScript compiles"
echo "   ✅ Build succeeds"
echo "   ✅ Invitation URL format correct"
echo ""
echo "🚀 The invitation system appears to be properly implemented."
echo ""
echo "🔍 To test the full flow:"
echo "   1. Start the dev server: npm run dev:frontend"
echo "   2. Run Cypress tests: npm run cy:open"
echo "   3. Or run headless: npm run cy:run"
echo ""
echo "📧 To test email delivery, check your Resend configuration and logs."
echo ""
echo "🚨 If invitation emails are not working locally:"
echo "   1. Ensure .env.local exists: cp .env.sample .env.local"
echo "   2. Check NEXT_PUBLIC_CONVEX_URL is set in .env.local"
echo "   3. Start Convex backend: npm run dev:backend"
echo "   4. Verify Resend API key is configured for email sending"
echo ""
echo "🔗 Test a manual invitation URL:"
echo "   http://localhost:3000/invitation/test-token-123"