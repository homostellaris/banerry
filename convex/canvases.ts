import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const blockValidator = v.object({
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
	isTransparent: v.optional(v.boolean()),
})

export const canvasDocValidator = v.object({
	_id: v.id('canvases'),
	_creationTime: v.number(),
	learnerId: v.id('learners'),
	name: v.string(),
	blocks: v.array(blockValidator),
	createdAt: v.number(),
})

export const getByPassphrase = query({
	args: {
		passphrase: v.string(),
	},
	returns: v.array(canvasDocValidator),
	handler: async (ctx, args) => {
		const learner = await ctx.db
			.query('learners')
			.withIndex('by_passphrase', q => q.eq('passphrase', args.passphrase))
			.unique()

		if (!learner) {
			return []
		}

		return await ctx.db
			.query('canvases')
			.withIndex('by_learner', q => q.eq('learnerId', learner._id))
			.order('desc')
			.collect()
	},
})

export const getByLearnerId = query({
	args: {
		learnerId: v.id('learners'),
	},
	returns: v.array(canvasDocValidator),
	handler: async (ctx, args) => {
		return await ctx.db
			.query('canvases')
			.withIndex('by_learner', q => q.eq('learnerId', args.learnerId))
			.order('desc')
			.collect()
	},
})

export const create = mutation({
	args: {
		passphrase: v.string(),
		name: v.string(),
		blocks: v.array(blockValidator),
	},
	returns: v.id('canvases'),
	handler: async (ctx, args) => {
		const learner = await ctx.db
			.query('learners')
			.withIndex('by_passphrase', q => q.eq('passphrase', args.passphrase))
			.unique()

		if (!learner) {
			throw new Error('Invalid passphrase')
		}

		const canvasId = await ctx.db.insert('canvases', {
			learnerId: learner._id,
			name: args.name,
			blocks: args.blocks,
			createdAt: Date.now(),
		})

		return canvasId
	},
})

export const getById = query({
	args: {
		id: v.id('canvases'),
	},
	returns: v.union(canvasDocValidator, v.null()),
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id)
	},
})

export const update = mutation({
	args: {
		id: v.id('canvases'),
		passphrase: v.string(),
		name: v.string(),
		blocks: v.array(blockValidator),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const learner = await ctx.db
			.query('learners')
			.withIndex('by_passphrase', q => q.eq('passphrase', args.passphrase))
			.unique()

		if (!learner) {
			throw new Error('Invalid passphrase')
		}

		const canvas = await ctx.db.get(args.id)
		if (!canvas) {
			throw new Error('Canvas not found')
		}

		if (canvas.learnerId !== learner._id) {
			throw new Error('Unauthorized')
		}

		await ctx.db.patch(args.id, {
			name: args.name,
			blocks: args.blocks,
		})
		return null
	},
})

export const remove = mutation({
	args: {
		id: v.id('canvases'),
		passphrase: v.string(),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		const learner = await ctx.db
			.query('learners')
			.withIndex('by_passphrase', q => q.eq('passphrase', args.passphrase))
			.unique()

		if (!learner) {
			throw new Error('Invalid passphrase')
		}

		const canvas = await ctx.db.get(args.id)
		if (!canvas) {
			throw new Error('Canvas not found')
		}

		if (canvas.learnerId !== learner._id) {
			throw new Error('Unauthorized')
		}

		await ctx.db.delete(args.id)
		return null
	},
})
