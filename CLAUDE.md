# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@~/code/convex.md

## Project Overview

Banerry is a communication assistance app for gestalt language processors. It's built as a Progressive Web App (PWA) using Next.js 15 with React 19, Convex for backend/database, and Convex Auth for authentication.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint linter
- `npm start` - Start production server

## Architecture

### Frontend Stack

- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** components for accessible UI primitives
- **Shadcn/ui** component library built on Radix
- **PWA** capabilities with service worker and manifest

### Backend Stack

- **Convex** for real-time database and backend functions
- **Convex Auth** for user authentication
- **OpenAI API** for text-to-speech generation
- **ElevenLabs** ConvAI widget integration

### Key Features

- **Gestalt Language Processing**: Helps users understand and communicate with "scripts" (repeated phrases)
- **Script Management**: Scripts have meanings and context for interpretation
- **Text-to-Speech**: OpenAI TTS integration with voice selection
- **Audio Caching**: Client-side audio caching for offline use
- **Role-based Access**: Mentor and learner user roles
- **PWA Support**: Installable app with offline capabilities

## Database Schema (Convex)

Key tables in `convex/schema.ts`:

- `learners` - User profiles for language learners
- `scripts` - Stored phrases with dialogue and context
- `mitigations` - Contextual interpretations of scripts
- `learnerMentorRelationships` - Connects mentors and learners
- `learnerScripts` - Associates scripts with specific learners

## Important File Locations

- `app/` - Next.js app directory with pages and components
- `convex/` - Convex backend functions and schema
- `components/ui/` - Shadcn UI components
- `app/actions/` - Server actions for TTS and other operations
- `app/data/scripts.ts` - Sample script data
- `app/contexts/voice-context.tsx` - Voice selection context
- `app/utils/audio-cache.ts` - Audio caching utilities

## Development Guidelines

### Convex Functions

Follow the patterns established in `.cursor/rules/convex_rules.mdc`:

- Use new function syntax with `args` and `returns` validators
- Always include argument and return type validators
- Use `internalQuery`/`internalMutation`/`internalAction` for private functions
- Use `query`/`mutation`/`action` for public API functions

### UI Components

- Use existing Radix UI components from `components/ui/`
- Follow established patterns in `app/components/`
- Maintain accessibility standards
- Use Tailwind classes for styling

### Authentication

- Convex Auth is configured in `convex/auth.config.ts`
- Protected routes use `ConvexAuthNextjsServerProvider`
- Sign-in flow redirects to `/mentor` for authenticated users

### Audio/TTS

- OpenAI TTS is implemented in `app/actions/tts.ts`
- Audio caching is handled in `app/utils/audio-cache.ts`
- Voice selection is managed via `VoiceProvider` context

## Testing

No specific test framework is configured. When adding tests, check the codebase for existing patterns or ask the user for preferred testing approach.
