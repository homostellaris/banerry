import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

const blockValidator = v.object({
	id: v.string(),
	type: v.union(
		v.literal('script'),
		v.literal('activity'),
		v.literal('emoji'),
		v.literal('letter'),
		v.literal('number'),
		v.literal('paint'),
	),
	content: v.string(),
	label: v.optional(v.string()),
	phrase: v.optional(v.string()),
	seed: v.optional(v.string()),
})

const canvasValidator = v.object({
	_id: v.id('canvases'),
	_creationTime: v.number(),
	learnerId: v.optional(v.id('learners')),
	title: v.string(),
	blocks: v.array(blockValidator),
	createdAt: v.optional(v.number()),
	updatedAt: v.optional(v.number()),
})

export const getCanvases = query({
	args: { learnerId: v.optional(v.id('learners')) },
	returns: v.array(canvasValidator),
	handler: async (ctx, args) => {
		if (!args.learnerId) return []
		return await ctx.db
			.query('canvases')
			.withIndex('by_learner', q => q.eq('learnerId', args.learnerId))
			.order('desc')
			.collect()
	},
})

export const getCanvasesByPassphrase = query({
	args: { passphrase: v.string() },
	returns: v.array(canvasValidator),
	handler: async (ctx, args) => {
		const learner = await ctx.db
			.query('learners')
			.withIndex('by_passphrase', q => q.eq('passphrase', args.passphrase))
			.unique()
		if (!learner) return []
		return await ctx.db
			.query('canvases')
			.withIndex('by_learner', q => q.eq('learnerId', learner._id))
			.order('desc')
			.collect()
	},
})

export const getCanvas = query({
	args: { id: v.id('canvases') },
	returns: v.union(canvasValidator, v.null()),
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id)
	},
})

export const createCanvas = mutation({
	args: {
		learnerId: v.optional(v.id('learners')),
		title: v.string(),
		blocks: v.array(blockValidator),
	},
	returns: v.id('canvases'),
	handler: async (ctx, args) => {
		const now = Date.now()
		return await ctx.db.insert('canvases', {
			learnerId: args.learnerId,
			title: args.title,
			blocks: args.blocks,
			createdAt: now,
			updatedAt: now,
		})
	},
})

export const updateCanvas = mutation({
	args: {
		canvasId: v.id('canvases'),
		title: v.optional(v.string()),
		blocks: v.optional(v.array(blockValidator)),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const updates: {
			title?: string
			blocks?: typeof args.blocks
			updatedAt: number
		} = { updatedAt: Date.now() }
		if (args.title !== undefined) updates.title = args.title
		if (args.blocks !== undefined) updates.blocks = args.blocks
		await ctx.db.patch(args.canvasId, updates)
		return null
	},
})

export const deleteCanvas = mutation({
	args: { canvasId: v.id('canvases') },
	returns: v.null(),
	handler: async (ctx, args) => {
		await ctx.db.delete(args.canvasId)
		return null
	},
})
