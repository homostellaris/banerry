import { internalMutation } from './_generated/server'
import { v } from 'convex/values'
import { generatePassphrase } from './learners'

function assertNotProduction() {
	if (
		process.env.VERCEL_PROJECT_PRODUCTION_URL &&
		process.env.CONVEX_SITE_URL?.includes(
			process.env.VERCEL_PROJECT_PRODUCTION_URL,
		)
	) {
		throw new Error('Test helpers must not run against production')
	}
}

export const clearVerificationCodes = internalMutation({
	args: {},
	returns: v.null(),
	handler: async ctx => {
		assertNotProduction()
		const codes = await ctx.db.query('authVerificationCodes').collect()
		for (const code of codes) {
			await ctx.db.delete(code._id)
		}
		return null
	},
})

async function deleteAccountAndDependents(
	ctx: { db: any },
	account: { _id: any },
) {
	const codes = await ctx.db
		.query('authVerificationCodes')
		.withIndex('accountId', (q: any) => q.eq('accountId', account._id))
		.collect()
	for (const code of codes) {
		await ctx.db.delete(code._id)
	}
	await ctx.db.delete(account._id)
}

async function deleteSessionAndDependents(
	ctx: { db: any },
	session: { _id: any },
) {
	const refreshTokens = await ctx.db
		.query('authRefreshTokens')
		.withIndex('sessionId', (q: any) => q.eq('sessionId', session._id))
		.collect()
	for (const token of refreshTokens) {
		await ctx.db.delete(token._id)
	}
	await ctx.db.delete(session._id)
}

export const createTestLearner = internalMutation({
	args: {
		email: v.string(),
		name: v.string(),
		bio: v.optional(v.string()),
	},
	returns: v.object({ learnerId: v.id('learners'), passphrase: v.string() }),
	handler: async (ctx, args) => {
		assertNotProduction()

		let user = await ctx.db
			.query('users')
			.withIndex('email', q => q.eq('email', args.email))
			.unique()
		if (!user) {
			const userId = await ctx.db.insert('users', {
				email: args.email,
				emailVerificationTime: Date.now(),
			})
			user = await ctx.db.get(userId)
		}

		let passphrase = generatePassphrase()
		let attempts = 0
		while (attempts < 10) {
			const existing = await ctx.db
				.query('learners')
				.withIndex('by_passphrase', q => q.eq('passphrase', passphrase))
				.first()
			if (!existing) break
			passphrase = generatePassphrase()
			attempts++
		}

		const learnerId = await ctx.db.insert('learners', {
			name: args.name,
			bio: args.bio,
			passphrase,
		})

		await ctx.db.insert('learnerMentorRelationships', {
			learnerId,
			mentorId: user!._id,
		})

		return { learnerId, passphrase }
	},
})

export const createPopulatedLearner = internalMutation({
	args: {
		email: v.string(),
		name: v.string(),
		bio: v.optional(v.string()),
	},
	returns: v.object({ learnerId: v.id('learners'), passphrase: v.string() }),
	handler: async (ctx, args) => {
		assertNotProduction()

		let user = await ctx.db
			.query('users')
			.withIndex('email', q => q.eq('email', args.email))
			.unique()
		if (!user) {
			const userId = await ctx.db.insert('users', {
				email: args.email,
				emailVerificationTime: Date.now(),
			})
			user = await ctx.db.get(userId)
		}

		let passphrase = generatePassphrase()
		let attempts = 0
		while (attempts < 10) {
			const existing = await ctx.db
				.query('learners')
				.withIndex('by_passphrase', q => q.eq('passphrase', passphrase))
				.first()
			if (!existing) break
			passphrase = generatePassphrase()
			attempts++
		}

		const learnerId = await ctx.db.insert('learners', {
			name: args.name,
			bio: args.bio ?? 'A wonderful learner profile with existing boards and activities',
			passphrase,
		})

		await ctx.db.insert('learnerMentorRelationships', {
			learnerId,
			mentorId: user!._id,
		})

		// Seed scripts
		await ctx.db.insert('scripts', {
			learnerId,
			dialogue: 'I would like some water please',
			parentheticals: 'calm and polite',
		})
		await ctx.db.insert('scripts', {
			learnerId,
			dialogue: 'Time to play outside',
			parentheticals: 'excited',
		})

		// Seed target script
		await ctx.db.insert('targetScripts', {
			learnerId,
			dialogue: 'Can I have a break?',
			parentheticals: 'raising hand',
		})

		// Seed active board with columns (activities)
		await ctx.db.insert('boards', {
			learnerId,
			name: 'Daily Schedule',
			columns: [
				{
					id: 'col-1',
					title: 'Morning Circle',
					position: 1,
					imagePrompt: 'Children sitting in morning circle',
					timerDuration: 600,
				},
				{
					id: 'col-2',
					title: 'Snack Time',
					position: 2,
					imagePrompt: 'Healthy snack bowl of apples and bananas',
					timerDuration: 900,
				},
				{
					id: 'col-3',
					title: 'Art & Painting',
					position: 3,
					imagePrompt: 'Color palette with paintbrush',
					timerDuration: 1200,
				},
			],
			isActive: true,
			createdAt: Date.now(),
		})

		// Seed initial canvas with multiple blocks
		await ctx.db.insert('canvases', {
			learnerId,
			name: 'My Starter Canvas',
			blocks: [
				{
					id: 'blk-script-1',
					type: 'script',
					content: 'I would like some water please',
					x: 40,
					y: 40,
					width: 220,
					height: 120,
				},
				{
					id: 'blk-act-1',
					type: 'activity',
					content: 'Snack Time',
					x: 300,
					y: 40,
					width: 200,
					height: 160,
				},
				{
					id: 'blk-emoji-1',
					type: 'emoji',
					content: '🌟',
					x: 60,
					y: 200,
					width: 80,
					height: 80,
				},
				{
					id: 'blk-letter-1',
					type: 'letter',
					content: 'B',
					x: 180,
					y: 200,
					width: 80,
					height: 80,
				},
				{
					id: 'blk-number-1',
					type: 'number',
					content: '7',
					x: 300,
					y: 240,
					width: 80,
					height: 80,
				},
			],
			createdAt: Date.now(),
		})

		return { learnerId, passphrase }
	},
})

export const resetCypressUsers = internalMutation({
	args: {},
	returns: v.null(),
	handler: async ctx => {
		assertNotProduction()
		const allUsers = await ctx.db.query('users').collect()
		const cypressUsers = allUsers.filter((user: any) =>
			user.email?.startsWith('cypress-'),
		)

		for (const user of cypressUsers) {
			const relationships = await ctx.db
				.query('learnerMentorRelationships')
				.withIndex('by_mentor', (q: any) => q.eq('mentorId', user._id))
				.collect()
			for (const rel of relationships) {
				const canvases = await ctx.db
					.query('canvases')
					.withIndex('by_learner', (q: any) => q.eq('learnerId', rel.learnerId))
					.collect()
				for (const c of canvases) await ctx.db.delete(c._id)
				const scripts = await ctx.db
					.query('scripts')
					.withIndex('by_learner', (q: any) => q.eq('learnerId', rel.learnerId))
					.collect()
				for (const s of scripts) await ctx.db.delete(s._id)
				const targetScripts = await ctx.db
					.query('targetScripts')
					.withIndex('by_learner', (q: any) => q.eq('learnerId', rel.learnerId))
					.collect()
				for (const ts of targetScripts) await ctx.db.delete(ts._id)
				const boards = await ctx.db
					.query('boards')
					.withIndex('by_learner', (q: any) => q.eq('learnerId', rel.learnerId))
					.collect()
				for (const b of boards) await ctx.db.delete(b._id)
				await ctx.db.delete(rel.learnerId)
				await ctx.db.delete(rel._id)
			}

			const accounts = await ctx.db
				.query('authAccounts')
				.withIndex('userIdAndProvider', (q: any) => q.eq('userId', user._id))
				.collect()
			for (const account of accounts) {
				await deleteAccountAndDependents(ctx, account)
			}

			const sessions = await ctx.db
				.query('authSessions')
				.withIndex('userId', (q: any) => q.eq('userId', user._id))
				.collect()
			for (const session of sessions) {
				await deleteSessionAndDependents(ctx, session)
			}

			if (user.email) {
				const rateLimits = await ctx.db
					.query('authRateLimits')
					.withIndex('identifier', (q: any) => q.eq('identifier', user.email!))
					.collect()
				for (const rateLimit of rateLimits) {
					await ctx.db.delete(rateLimit._id)
				}
			}

			await ctx.db.delete(user._id)
		}

		// Clean up orphaned authAccounts for cypress emails (user was deleted
		// but the account record remained).
		const allAccounts = await ctx.db
			.query('authAccounts')
			.withIndex('providerAndAccountId', (q: any) =>
				q.eq('provider', 'resend-otp'),
			)
			.collect()
		const orphanedAccounts = allAccounts.filter(
			(account: any) =>
				account.providerAccountId.startsWith('cypress-') ||
				account.providerAccountId.startsWith('cypress+'),
		)
		for (const account of orphanedAccounts) {
			// Also clean up sessions for the orphaned userId
			const sessions = await ctx.db
				.query('authSessions')
				.withIndex('userId', (q: any) => q.eq('userId', account.userId))
				.collect()
			for (const session of sessions) {
				await deleteSessionAndDependents(ctx, session)
			}

			await deleteAccountAndDependents(ctx, account)
		}

		const verifiers = await ctx.db.query('authVerifiers').collect()
		for (const verifier of verifiers) {
			await ctx.db.delete(verifier._id)
		}

		return null
	},
})

export const seedTestScript = internalMutation({
	args: {
		learnerId: v.id('learners'),
		dialogue: v.string(),
		parentheticals: v.optional(v.string()),
	},
	returns: v.id('scripts'),
	handler: async (ctx, args) => {
		assertNotProduction()
		return await ctx.db.insert('scripts', {
			learnerId: args.learnerId,
			dialogue: args.dialogue,
			parentheticals: args.parentheticals ?? '',
		})
	},
})

export const seedTestBoard = internalMutation({
	args: {
		learnerId: v.id('learners'),
		name: v.string(),
	},
	returns: v.id('boards'),
	handler: async (ctx, args) => {
		assertNotProduction()
		return await ctx.db.insert('boards', {
			learnerId: args.learnerId,
			name: args.name,
			columns: [
				{ id: '1', title: 'Now', position: 1 },
				{ id: '2', title: 'Next', position: 2 },
				{ id: '3', title: 'Then', position: 3 },
			],
			isActive: true,
			createdAt: Date.now(),
		})
	},
})

