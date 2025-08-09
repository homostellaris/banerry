# Banerry GitHub Copilot Instructions

**ALWAYS FOLLOW THESE INSTRUCTIONS FIRST.** Only search for additional context or use other tools if the information here is incomplete or incorrect.

Banerry is a speech and transition assistance Progressive Web App (PWA) for gestalt language processors. Built with Next.js 15, React 19, Convex backend, Tailwind CSS, and comprehensive accessibility features.

## Critical Setup Requirements

### Environment Setup
- Copy environment template: `cp .env.sample .env.local`
- Required environment variables:
  - `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` (pre-configured in sample)
  - `OPENAI_API_KEY` and `ELEVENLABS_API_KEY` (for TTS features)
  - `AUTH_RESEND_KEY`, `JWKS`, `JWT_PRIVATE_KEY` (for authentication)

### Dependency Installation
- **CRITICAL**: ALWAYS use `npm install --legacy-peer-deps`
- **NEVER CANCEL**: Installation takes ~2 minutes. Set timeout to 5+ minutes.
- React 19 compatibility requires the legacy peer deps flag due to package conflicts
- **DO NOT use regular `npm install`** - it will fail with ERESOLVE errors

### ESLint Setup (Required for Linting)
- Install required packages: `npm install --save-dev eslint eslint-config-next @typescript-eslint/eslint-plugin @typescript-eslint/parser --legacy-peer-deps`
- **TIMING**: Additional package installation takes ~30 seconds

## Development Workflow

### Build Process
- **Production build**: `npm run build`
- **NEVER CANCEL**: Build takes ~25 seconds. Set timeout to 60+ seconds.
- **IMPORTANT**: Build ignores TypeScript errors and ESLint warnings (configured in next.config.mjs)
- **NETWORK DEPENDENCY**: Google Fonts have been replaced with system fonts to avoid network issues

### Development Server
- **Frontend only**: `npm run dev:frontend` - starts in ~1.5 seconds
- **Full development**: `npm run dev` - runs frontend and Convex backend in parallel
- **CONVEX SETUP**: Backend requires authentication setup but frontend works independently
- **ACCESS**: http://localhost:3000

### Linting and Code Quality
- **Run linter**: `npm run lint`
- **TIMING**: ~3 seconds. Set timeout to 30+ seconds.
- **EXPECTED**: Linting will show warnings and some errors but build still succeeds
- **VALIDATION**: Always run linting before committing changes

### Testing and Validation
- **NO FORMAL TEST FRAMEWORK**: No Jest, Cypress, or other testing tools configured
- **MANUAL VALIDATION REQUIRED**: Always test user scenarios after making changes:
  1. Navigate to homepage (http://localhost:3000)
  2. Test PWA install prompt functionality
  3. Click "Mentor" button to verify authentication flow (redirects to /signin)
  4. Click "Learner" button to test learner flow
  5. Verify responsive design and accessibility features

## Architecture Overview

### Frontend Stack
- **Next.js 15** with App Router (file-based routing in `/app` directory)
- **React 19** with TypeScript and Tailwind CSS
- **Radix UI + Shadcn/ui** for accessible components (`/components/ui/`)
- **PWA capabilities** with service worker (`app/sw.ts`) and manifest (`app/manifest.ts`)

### Backend Stack
- **Convex** real-time database and backend functions (`/convex/` directory)
- **Convex Auth** for authentication (`convex/auth.config.ts`)
- **OpenAI TTS integration** (`app/_tts/` directory)
- **ElevenLabs ConvAI** widget support

### Key Database Tables (Convex Schema)
- `learners` - User profiles for language learners with passphrases
- `scripts` - Stored phrases with dialogue and context for learners
- `targetScripts` - Goal phrases for learner progression
- `learnerMentorRelationships` - Connects mentors with their learners
- `authTables` - Convex Auth user management tables

## Important Codebase Locations

### Frequently Modified Areas
- **App pages**: `/app/` - Next.js 13+ app directory structure
- **UI components**: `/components/ui/` - Reusable Shadcn/ui components
- **Convex functions**: `/convex/` - Database queries, mutations, and actions
- **TTS features**: `/app/_tts/` - Text-to-speech and audio caching
- **Authentication**: `/app/signin/` and `/convex/auth.ts`

### Page Structure
- **Homepage**: `/app/page.tsx` - Main landing with Mentor/Learner options
- **Mentor flow**: `/app/mentor/` - Mentor management interface  
- **Learner flow**: `/app/learner/` - Learner communication interface
- **Authentication**: `/app/signin/` - Sign-in forms and flows

### Key Utilities
- **Audio caching**: `/app/_tts/audio-cache.ts` and `/app/_tts/use-cached-tts.ts`
- **Voice selection**: `/app/_tts/voice-context.tsx` and `/app/_tts/voice-selector.tsx`
- **Middleware**: `/middleware.ts` - Route protection and authentication

## Development Guidelines

### Convex Functions
- **ALWAYS use new function syntax** with `args` and `returns` validators
- **Use proper function types**: `query`, `mutation`, `action` for public APIs
- **Use internal types**: `internalQuery`, `internalMutation`, `internalAction` for private functions
- **Authentication**: Use `getAuthUserId()` from `@convex-dev/auth/server`

### UI Development
- **Use existing Radix components** from `/components/ui/`
- **Follow Tailwind patterns** established in existing components
- **Maintain accessibility** - all components use proper ARIA attributes
- **Test PWA features** - verify offline functionality and install prompts

### Code Quality
- **TypeScript strict mode** enabled - fix type errors when possible
- **ESLint warnings expected** - focus on errors, not warnings
- **Accessibility first** - use semantic HTML and ARIA attributes
- **Mobile responsive** - test on multiple screen sizes

## Common Tasks and Troubleshooting

### Adding New Dependencies
- **ALWAYS use `--legacy-peer-deps`** flag with npm install
- Update both regular and dev dependencies as needed
- Test build process after adding new packages

### Database Changes (Convex)
- **Schema modifications**: Edit `/convex/schema.ts`
- **Add indexes** for query performance following existing patterns
- **Use proper validators** from `convex/values` for all fields

### TTS and Audio Features
- **OpenAI integration**: `/app/_tts/tts.ts` handles text-to-speech
- **Audio caching**: Client-side caching in `/app/_tts/audio-cache.ts`
- **Voice selection**: Context provider in `/app/_tts/voice-context.tsx`

### Authentication Issues
- **Check environment variables** for Convex Auth setup
- **Verify Convex deployment** is properly configured
- **Test sign-in flow** manually after changes

## Build Validation Checklist

Before considering any change complete:

1. **Run full build**: `npm run build` (25 seconds)
2. **Start dev server**: `npm run dev:frontend` (1.5 seconds)  
3. **Test core functionality**:
   - Homepage loads at http://localhost:3000
   - PWA install prompt appears and works
   - Mentor button redirects to authentication
   - Learner button shows learner interface
4. **Run linter**: `npm run lint` (3 seconds)
5. **Check console** for runtime errors (some warnings expected)

## Network and Environment Limitations

- **Google Fonts disabled**: Uses system fonts to avoid network dependencies
- **External API access**: May be limited - OpenAI and ElevenLabs require API keys
- **Convex authentication**: May require manual setup in restricted environments
- **Build process**: Designed to work offline after initial dependency installation

---

**Remember**: These instructions prioritize functionality in restricted environments while maintaining full development capabilities. Always validate your changes with the manual testing checklist above.