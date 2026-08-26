import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
	...authTables,
	learners: defineTable({
		name: v.string(),
		bio: v.optional(v.string()),
		avatarStorageId: v.optional(v.id('_storage')),
		avatarPrompt: v.optional(v.string()),
		passphrase: v.string(),
	}).index('by_passphrase', ['passphrase']),
	learnerMentorRelationships: defineTable({
		learnerId: v.id('learners'),
		mentorId: v.id('users'),
		relationshipType: v.optional(v.string()), // e.g., "parent", "teacher", "therapist"
	})
		.index('by_learner', ['learnerId'])
		.index('by_mentor', ['mentorId']),
	learnerInvitations: defineTable({
		email: v.string(),
		learnerId: v.id('learners'),
		invitingMentorId: v.id('users'),
		token: v.string(),
		expiresAt: v.number(),
		status: v.union(
			v.literal('pending'),
			v.literal('accepted'),
			v.literal('expired'),
		),
	})
		.index('by_email', ['email'])
		.index('by_token', ['token'])
		.index('by_learner', ['learnerId']),
	scripts: defineTable({
		learnerId: v.id('learners'),
		dialogue: v.string(),
		parentheticals: v.string(),
	}).index('by_learner', ['learnerId']),
	targetScripts: defineTable({
		learnerId: v.id('learners'),
		dialogue: v.string(),
		parentheticals: v.string(),
	}).index('by_learner', ['learnerId']),
	boards: defineTable({
		learnerId: v.id('learners'),
		name: v.string(),
		columns: v.array(
			v.object({
				id: v.string(),
				title: v.string(),
				imageStorageId: v.optional(v.id('_storage')),
				imagePrompt: v.optional(v.string()),
				timerDuration: v.optional(v.number()),
				position: v.number(),
			}),
		),
		isActive: v.boolean(),
		createdAt: v.number(),
		generationPrompt: v.optional(v.string()),
	})
		.index('by_learner', ['learnerId'])
		.index('by_learner_active', ['learnerId', 'isActive']),
	canvases: defineTable({
		learnerId: v.id('learners'),
		name: v.string(),
		blocks: v.array(
			v.object({
				id: v.string(),
				type: v.string(),
				content: v.string(),
				x: v.number(),
				y: v.number(),
				width: v.optional(v.number()),
				height: v.optional(v.number()),
				color: v.optional(v.string()),
				sourceId: v.optional(v.string()),
				imageStorageId: v.optional(v.union(v.id('_storage'), v.string())),
				imageUrl: v.optional(v.string()),
				strokeWidth: v.optional(v.number()),
				strokeColor: v.optional(v.string()),
				points: v.optional(v.array(v.object({ x: v.number(), y: v.number() }))),
			}),
		),
		createdAt: v.number(),
	}).index('by_learner', ['learnerId']),
})
