import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const listItems = query({
	args: { learnerId: v.id('learners') },
	returns: v.array(
		v.object({
			_id: v.id('canvasItems'),
			_creationTime: v.number(),
			learnerId: v.id('learners'),
			type: v.union(
				v.literal('activity'),
				v.literal('script'),
				v.literal('color'),
			),
			sourceId: v.optional(v.string()),
			gridX: v.number(),
			gridY: v.number(),
			color: v.optional(v.string()),
		}),
	),
	handler: async (ctx, args) => {
		return await ctx.db
			.query('canvasItems')
			.withIndex('by_learner', q => q.eq('learnerId', args.learnerId))
			.collect()
	},
})

export const addItem = mutation({
	args: {
		learnerId: v.id('learners'),
		type: v.union(
			v.literal('activity'),
			v.literal('script'),
			v.literal('color'),
		),
		sourceId: v.optional(v.string()),
		gridX: v.number(),
		gridY: v.number(),
		color: v.optional(v.string()),
	},
	returns: v.id('canvasItems'),
	handler: async (ctx, args) => {
		return await ctx.db.insert('canvasItems', {
			learnerId: args.learnerId,
			type: args.type,
			sourceId: args.sourceId,
			gridX: args.gridX,
			gridY: args.gridY,
			color: args.color,
		})
	},
})

export const moveItem = mutation({
	args: {
		itemId: v.id('canvasItems'),
		gridX: v.number(),
		gridY: v.number(),
	},
	returns: v.null(),
	handler: async (ctx, args) => {
		await ctx.db.patch(args.itemId, { gridX: args.gridX, gridY: args.gridY })
		return null
	},
})

export const removeItem = mutation({
	args: { itemId: v.id('canvasItems') },
	returns: v.null(),
	handler: async (ctx, args) => {
		await ctx.db.delete(args.itemId)
		return null
	},
})
