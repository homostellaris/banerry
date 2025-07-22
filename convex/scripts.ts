import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const create = mutation({
  args: {
    dialogue: v.string(),
    parentheticals: v.string(),
    learnerId: v.id("learners"),
  },
  returns: v.id("scripts"),
  handler: async (ctx, args) => {
    // Create the script with learnerId
    const scriptId = await ctx.db.insert("scripts", {
      dialogue: args.dialogue,
      parentheticals: args.parentheticals,
      learnerId: args.learnerId,
    });

    return scriptId;
  },
});

export const list = query({
  args: {
    learnerId: v.id("learners"),
  },
  returns: v.array(
    v.object({
      _id: v.id("scripts"),
      _creationTime: v.number(),
      dialogue: v.string(),
      parentheticals: v.string(),
      learnerId: v.id("learners"),
    })
  ),
  handler: async (ctx, args) => {
    const scripts = await ctx.db
      .query("scripts")
      .withIndex("by_learner", (q) => q.eq("learnerId", args.learnerId))
      .order("desc")
      .collect();

    return scripts;
  },
});

export const get = query({
  args: {
    id: v.id("scripts"),
  },
  returns: v.union(
    v.object({
      _id: v.id("scripts"),
      _creationTime: v.number(),
      dialogue: v.string(),
      parentheticals: v.string(),
      learnerId: v.id("learners"),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const script = await ctx.db.get(args.id);
    return script;
  },
});

export const remove = mutation({
  args: {
    id: v.id("scripts"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const script = await ctx.db.get(args.id);
    if (!script) {
      throw new Error("Script not found");
    }
    await ctx.db.delete(args.id);
    return null;
  },
});
