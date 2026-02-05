# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into your Banerry project. PostHog is now configured with:

- **Client-side tracking** via `instrumentation-client.ts` using the modern Next.js 15.3+ approach
- **Server-side client** in `lib/posthog-server.ts` for backend event capture
- **Reverse proxy** configured in `next.config.mjs` to avoid ad blockers
- **User identification** on sign-in with automatic `posthog.reset()` on sign-out
- **Exception capture** for all error handlers
- **15 custom events** tracking key user actions across the app

## Instrumented Events

| Event Name | Description | File |
|------------|-------------|------|
| `sign_in_otp_requested` | User requests an OTP code via email for sign in | `app/signin/_components/signin-form.tsx` |
| `sign_in_completed` | User successfully signs in after OTP verification | `app/signin/_components/signin-form.tsx` |
| `sign_out_clicked` | User signs out of the application | `app/mentor/_components/signout-button.tsx` |
| `learner_created` | Mentor creates a new learner profile | `app/mentor/_components/add-learner-form.tsx` |
| `learner_deleted` | Mentor deletes a learner profile | `app/mentor/_components/delete-learner-button.tsx` |
| `learner_shared` | Mentor shares learner access with another mentor | `app/mentor/_components/share-learner-form.tsx` |
| `script_created` | User adds a new script for a learner | `app/_scripts/add-script-form.tsx` |
| `script_deleted` | User deletes a script | `app/_scripts/delete-script-button.tsx` |
| `target_script_created` | User adds a new target script for a learner | `app/_target-scripts/add-target-script-form.tsx` |
| `target_script_marked_learned` | User marks a target script as learned | `app/_target-scripts/mark-as-learned-button.tsx` |
| `invitation_accepted` | User accepts an invitation to mentor a learner | `app/invitation/[token]/page.tsx` |
| `audio_played` | User plays text-to-speech audio for a script | `app/_tts/audio-button.tsx` |
| `board_generated` | User generates images for visual boards | `app/_boards/now-next-then-board.tsx` |
| `pwa_install_prompted` | User is shown the PWA install prompt | `app/_common/pwa-install.tsx` |
| `pwa_installed` | User installs the PWA application | `app/_common/pwa-install.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard
- [Analytics basics](https://eu.posthog.com/project/123493/dashboard/513819) - Core analytics dashboard tracking user onboarding, engagement, and key feature usage

### Insights
- [Sign In Conversion Funnel](https://eu.posthog.com/project/123493/insights/5Rg3gTND) - Tracks conversion from OTP request to successful sign in
- [Content Creation Trends](https://eu.posthog.com/project/123493/insights/WBRuo5ST) - Weekly trends for learner, script, and target script creation
- [Feature Engagement](https://eu.posthog.com/project/123493/insights/6t7XIePu) - Daily engagement with text-to-speech and board generation
- [Learning Progress Funnel](https://eu.posthog.com/project/123493/insights/2HtEvqU9) - Tracks conversion from creating target scripts to marking them as learned
- [PWA Installation](https://eu.posthog.com/project/123493/insights/Z0AriciG) - Tracks PWA install prompts and successful installations

### Environment Variables

Make sure to add these environment variables to your production environment (e.g., Vercel):

```
NEXT_PUBLIC_POSTHOG_KEY=phc_UMPMmOrJSeY3a0ze3KFXz3mhXkFIJoRehez84tNos61
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/posthog-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
