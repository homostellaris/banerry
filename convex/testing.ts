import { internalMutation } from './_generated/server'
import { v } from 'convex/values'

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
