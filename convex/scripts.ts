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
    // Create the script first
    const scriptId = await ctx.db.insert("scripts", {
      dialogue: args.dialogue,
      parentheticals: args.parentheticals,
    });

    // Link the script to the learner
    await ctx.db.insert("learnerScripts", {
      learnerId: args.learnerId,
      scriptId: scriptId,
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
    })
  ),
  handler: async (ctx, args) => {
    // Get all learnerScript relationships for this learner
    const learnerScripts = await ctx.db
      .query("learnerScripts")
      .withIndex("by_learner", (q) => q.eq("learnerId", args.learnerId))
      .collect();

    // Get all the scripts
    const scripts = [];
    for (const learnerScript of learnerScripts) {
      const script = await ctx.db.get(learnerScript.scriptId);
      if (script) {
        scripts.push(script);
      }
    }

    // Sort by creation time (most recent first)
    return scripts.sort((a, b) => b._creationTime - a._creationTime);
  },
});
