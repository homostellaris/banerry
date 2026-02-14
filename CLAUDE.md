# CLAUDE.md

@~/code/convex.md

## Project Overview

Banerry is a communication assistance app for gestalt language processors. It's built as a Progressive Web App (PWA) using Next.js 15 with React 19, Convex for backend/database, and Convex Auth for authentication.

## Development Commands

```
bun dev              # Start frontend + backend in parallel
bun dev:frontend     # Next.js dev server only (port 6604)
bun dev:backend      # Convex dev server only
bun typecheck        # Run TypeScript compiler
bun lint             # Run ESLint
bun format           # Run Prettier
bun unit             # Run Bun unit tests
bun integration      # Run Cypress E2E tests
bun test             # Run all checks (typecheck, lint, unit, integration)
bun run build        # Build for production
```

Run a single unit test:
```
bun test app/_image-generation/parse-board-prompt.test.ts
```

Run a single Cypress spec:
```
bun --env-file .env.test --env-file .env.test.local cypress run --spec cypress/e2e/mentor.cy.ts
```

Always use `bun` / `bunx` as the package runner — never `npm` / `npx`.

### Husky Hooks

- **pre-commit**: `bun test` (typecheck + lint + unit + integration)
- **pre-push**: `bun run integration` (Cypress E2E only)

## Architecture

### Dual Access Pattern

The app has two distinct access modes:

- **Mentors** (parents, teachers, therapists) authenticate via email OTP using Convex Auth. They manage learners, scripts, boards, and invitations under `/mentor/*` routes.
- **Learners** access the app without authentication via a passphrase (three random words joined by dashes, e.g. `elephant-purple-dancing`). The passphrase is stored in `localStorage` and all learner routes live under `/learner/[passphrase]/*`.

### Authorization

Authorization helpers live in `convex/learners.ts`:

- `ensureAuthenticated(ctx)` — throws if user is not logged in
- `ensureLearnerRelationship(ctx, learnerId)` — throws if the authenticated user has no mentor-learner relationship with the given learner

Learner-facing queries use the `by_passphrase` index and require no authentication.

### Underscore-Prefix Convention

Shared modules in `app/` use an underscore prefix to indicate they are not routes:

- `app/_common/` — shared UI components, hooks, navigation
- `app/_tts/` — text-to-speech (OpenAI TTS, audio caching, voice context)
- `app/_scripts/` — script management UI (mentor-facing)
- `app/_target-scripts/` — target script UI (learner goals)
- `app/_boards/` — board/visual schedule management
- `app/_learners/` — learner-specific utilities
- `app/_mitigations/` — mitigation/interpretation UI
- `app/_image-generation/` — AI image generation for avatars and boards
- `app/_posthog/` — PostHog analytics provider

### Tech Stack

- **Next.js 15** with App Router, **React 19**, **TypeScript**
- **Tailwind CSS**, **Radix UI**, **Shadcn/ui** (`components/ui/`)
- **Convex** for real-time database and backend functions
- **Convex Auth** with Resend OTP (email-based, 8-digit code)
- **OpenAI API** for TTS (`app/_tts/`) and image generation
- **ElevenLabs** ConvAI widget integration
- **PostHog** for analytics
- PWA with service worker and manifest

## Database Schema (Convex)

Tables in `convex/schema.ts` (plus `authTables` from `@convex-dev/auth`):

| Table | Purpose |
|---|---|
| `learners` | Learner profiles (name, bio, avatar, passphrase). Index: `by_passphrase` |
| `learnerMentorRelationships` | Links mentors to learners. Indexes: `by_learner`, `by_mentor` |
| `learnerInvitations` | Email invitations to join as mentor for a learner. Indexes: `by_email`, `by_token`, `by_learner` |
| `scripts` | Gestalt scripts (dialogue + parentheticals) per learner. Index: `by_learner` |
| `targetScripts` | Target/goal scripts per learner. Index: `by_learner` |
| `boards` | Visual schedule boards with columns. Indexes: `by_learner`, `by_learner_active` |

## Testing

### Unit Tests (Bun)

Bun's built-in test runner. Test files live alongside source code with `.test.ts` suffix (e.g. `app/_image-generation/parse-board-prompt.test.ts`).

### E2E Tests (Cypress)

Tests are organized to mirror the route they test:

```
cypress/e2e/
  signin.cy.ts                      # /signin
  learner.cy.ts                     # /learner
  mentor.cy.ts                      # /mentor
  mentor/learner/id.cy.ts           # /mentor/learner/[id]
  mentor/learner/id/boards.cy.ts    # /mentor/learner/[id]/boards
  mentor/learner/id/scripts.cy.ts   # /mentor/learner/[id]/scripts
  mentor/learner/id/timer.cy.ts     # /mentor/learner/[id]/timer
  invitation/token.cy.ts            # /invitation/[token]
```

#### Custom Commands (`cypress/support/commands.ts`)

- `cy.signIn(email)` — signs in with OTP using `CYPRESS_OTP_OVERRIDE` env var
- `cy.createLearner(name, bio?)` — creates a new learner through the UI
- `cy.getByName(name)` — shorthand for `cy.get([data-name="..."])`

#### Conventions

- **Test emails**: use `cypress-*@banerry.app` (e.g. `cypress-test@banerry.app`)
- **Element selectors**: use `data-name` attributes, never CSS classes or tag-based selectors
- **Setup**: each test suite resets state via `cy.task('resetCypressUsers')` and `cy.task('clearVerificationCodes')` in `beforeEach` (configured in `cypress/support/e2e.ts`)
- **Convex test helpers**: `convex/testing.ts` provides `resetCypressUsers` and `clearVerificationCodes` tasks
