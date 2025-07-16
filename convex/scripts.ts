import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const createScript = mutation({
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

export const listScriptsForLearner = query({
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
