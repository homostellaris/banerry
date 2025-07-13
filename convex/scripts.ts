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

export const getLearner = query({
  args: {
    learnerId: v.id("learners"),
  },
  returns: v.union(
    v.object({
      _id: v.id("learners"),
      _creationTime: v.number(),
      name: v.string(),
      bio: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.learnerId);
  },
});

export const getLearnerLink = query({
  args: {
    learnerId: v.id("learners"),
  },
  returns: v.union(
    v.object({
      _creationTime: v.number(),
      _id: v.id("learnerLinks"),
      learnerId: v.id("learners"),
      passphrase: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("learnerLinks")
      .filter((q) => q.eq(q.field("learnerId"), args.learnerId))
      .first();
  },
});

export const validatePassphrase = query({
  args: {
    passphrase: v.string(),
  },
  returns: v.union(
    v.object({
      _creationTime: v.number(),
      _id: v.id("learners"),
      name: v.string(),
      bio: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const learnerLink = await ctx.db
      .query("learnerLinks")
      .filter((q) => q.eq(q.field("passphrase"), args.passphrase))
      .first();

    if (!learnerLink) {
      return null;
    }

    const learner = await ctx.db.get(learnerLink.learnerId);
    return learner;
  },
});
