import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const get = query({
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

export const validate = query({
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
