import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const create = mutation({
  args: {
    dialogue: v.string(),
    parentheticals: v.string(),
    learnerId: v.id("learners"),
  },
  returns: v.union(v.id("targetScripts"), v.null()),
  handler: async (ctx, args) => {
    // Check if learner already has 3 target scripts (limit)
    const existingTargetScripts = await ctx.db
      .query("targetScripts")
      .withIndex("by_learner", (q) => q.eq("learnerId", args.learnerId))
      .collect();

    if (existingTargetScripts.length >= 3) {
      return null; // Cannot create more than 3 target scripts
    }

    // Create the target script with learnerId
    const targetScriptId = await ctx.db.insert("targetScripts", {
      dialogue: args.dialogue,
      parentheticals: args.parentheticals,
      learnerId: args.learnerId,
    });

    return targetScriptId;
  },
});

export const list = query({
  args: {
    learnerId: v.id("learners"),
  },
  returns: v.array(
    v.object({
      _id: v.id("targetScripts"),
      _creationTime: v.number(),
      dialogue: v.string(),
      parentheticals: v.string(),
      learnerId: v.id("learners"),
    })
  ),
  handler: async (ctx, args) => {
    const targetScripts = await ctx.db
      .query("targetScripts")
      .withIndex("by_learner", (q) => q.eq("learnerId", args.learnerId))
      .order("desc")
      .collect();

    return targetScripts;
  },
});

export const get = query({
  args: {
    id: v.id("targetScripts"),
  },
  returns: v.union(
    v.object({
      _id: v.id("targetScripts"),
      _creationTime: v.number(),
      dialogue: v.string(),
      parentheticals: v.string(),
      learnerId: v.id("learners"),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const targetScript = await ctx.db.get(args.id);
    return targetScript;
  },
});

export const update = mutation({
  args: {
    id: v.id("targetScripts"),
    dialogue: v.string(),
    parentheticals: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const targetScript = await ctx.db.get(args.id);
    if (!targetScript) {
      throw new Error("Target script not found");
    }
    await ctx.db.patch(args.id, {
      dialogue: args.dialogue,
      parentheticals: args.parentheticals,
    });
    return null;
  },
});

export const remove = mutation({
  args: {
    id: v.id("targetScripts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const targetScript = await ctx.db.get(args.id);
    if (!targetScript) {
      throw new Error("Target script not found");
    }
    await ctx.db.delete(args.id);
    return null;
  },
});

export const count = query({
  args: {
    learnerId: v.id("learners"),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const targetScripts = await ctx.db
      .query("targetScripts")
      .withIndex("by_learner", (q) => q.eq("learnerId", args.learnerId))
      .collect();

    return targetScripts.length;
  },
});