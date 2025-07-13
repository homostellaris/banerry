import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listLearners = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("learners"),
    _creationTime: v.number(),
    name: v.string(),
    bio: v.optional(v.string()),
  })),
  handler: async (ctx, args) => {
    return await ctx.db.query("learners").order("desc").collect();
  },
});

export const createLearner = mutation({
  args: {
    name: v.string(),
    bio: v.optional(v.string()),
  },
  returns: v.id("learners"),
  handler: async (ctx, args) => {
    // Create the learner first
    const learnerId = await ctx.db.insert("learners", {
      name: args.name,
      bio: args.bio,
    });

    // Generate a three-word passphrase
    const words = [
      // Animals
      "elephant", "giraffe", "penguin", "dolphin", "butterfly", "rainbow", "sunshine", "mountain",
      // Colors/Nature
      "purple", "golden", "silver", "crystal", "emerald", "sapphire", "coral", "amber",
      // Actions/Feelings
      "dancing", "singing", "jumping", "flying", "sparkling", "glowing", "bouncing", "flowing"
    ];
    
    const generatePassphrase = () => {
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 3).join("-");
    };

    let passphrase = generatePassphrase();
    
    // Ensure uniqueness by checking existing passphrases
    let attempts = 0;
    while (attempts < 10) {
      const existing = await ctx.db
        .query("learnerLinks")
        .filter((q) => q.eq(q.field("passphrase"), passphrase))
        .first();
      
      if (!existing) break;
      
      passphrase = generatePassphrase();
      attempts++;
    }

    // Create the learner link
    await ctx.db.insert("learnerLinks", {
      learnerId: learnerId,
      passphrase: passphrase,
    });

    return learnerId;
  },
});

export const deleteLearner = mutation({
  args: {
    learnerId: v.id("learners"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // First, get all learnerScripts for this learner
    const learnerScripts = await ctx.db
      .query("learnerScripts")
      .withIndex("by_learner", (q) => q.eq("learnerId", args.learnerId))
      .collect();

    // Delete all learnerScript relationships
    for (const learnerScript of learnerScripts) {
      await ctx.db.delete(learnerScript._id);
    }

    // Delete all mitigations for this learner
    const mitigations = await ctx.db
      .query("mitigations")
      .filter((q) => q.eq(q.field("learnerId"), args.learnerId))
      .collect();

    for (const mitigation of mitigations) {
      await ctx.db.delete(mitigation._id);
    }

    // Delete learner links
    const learnerLinks = await ctx.db
      .query("learnerLinks")
      .filter((q) => q.eq(q.field("learnerId"), args.learnerId))
      .collect();

    for (const learnerLink of learnerLinks) {
      await ctx.db.delete(learnerLink._id);
    }

    // Delete learner mentor relationships
    const relationships = await ctx.db
      .query("learnerMentorRelationships")
      .filter((q) => q.eq(q.field("learnerId"), args.learnerId))
      .collect();

    for (const relationship of relationships) {
      await ctx.db.delete(relationship._id);
    }

    // Finally, delete the learner
    await ctx.db.delete(args.learnerId);
    
    return null;
  },
});