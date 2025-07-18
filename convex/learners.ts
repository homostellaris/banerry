import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const words = [
  // Animals
  "elephant",
  "giraffe",
  "penguin",
  "dolphin",
  "butterfly",
  "rainbow",
  "sunshine",
  "mountain",
  // Colors/Nature
  "purple",
  "golden",
  "silver",
  "crystal",
  "emerald",
  "sapphire",
  "coral",
  "amber",
  // Actions/Feelings
  "dancing",
  "singing",
  "jumping",
  "flying",
  "sparkling",
  "glowing",
  "bouncing",
  "flowing",
];

const generatePassphrase = () => {
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).join("-");
};

export const create = mutation({
  args: {
    name: v.string(),
    bio: v.optional(v.string()),
  },
  returns: v.id("learners"),
  handler: async (ctx, args) => {
    let passphrase = generatePassphrase();

    // Ensure uniqueness by checking existing passphrases
    let attempts = 0;
    while (attempts < 10) {
      const existing = await ctx.db
        .query("learners")
        .filter((q) => q.eq(q.field("passphrase"), passphrase))
        .first();

      if (!existing) break;

      passphrase = generatePassphrase();
      attempts++;
    }

    const learnerId = await ctx.db.insert("learners", {
      name: args.name,
      bio: args.bio,
      passphrase,
    });

    return learnerId;
  },
});

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("learners"),
      _creationTime: v.number(),
      name: v.string(),
      bio: v.optional(v.string()),
      passphrase: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db.query("learners").order("desc").collect();
  },
});

export const del = mutation({
  args: {
    learnerId: v.id("learners"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // First, get all scripts for this learner
    const scripts = await ctx.db
      .query("scripts")
      .withIndex("by_learner", (q) => q.eq("learnerId", args.learnerId))
      .collect();

    // Delete all scripts for this learner
    for (const script of scripts) {
      await ctx.db.delete(script._id);
    }

    // Delete all mitigations for this learner
    const mitigations = await ctx.db
      .query("mitigations")
      .filter((q) => q.eq(q.field("learnerId"), args.learnerId))
      .collect();

    for (const mitigation of mitigations) {
      await ctx.db.delete(mitigation._id);
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

export const get = query({
  args: {
    learnerId: v.id("learners"),
  },
  returns: v.union(
    v.object({
      _id: v.id("learners"),
      _creationTime: v.number(),
      name: v.string(),
      bio: v.optional(v.string()),
      passphrase: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.learnerId);
  },
});

export const getWithScripts = query({
  args: {
    learnerId: v.id("learners"),
  },
  returns: v.union(
    v.object({
      _id: v.id("learners"),
      _creationTime: v.number(),
      name: v.string(),
      bio: v.optional(v.string()),
      passphrase: v.string(),
      scripts: v.array(
        v.object({
          _id: v.id("scripts"),
          _creationTime: v.number(),
          dialogue: v.string(),
          parentheticals: v.string(),
          learnerId: v.id("learners"),
        })
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const learner = await ctx.db.get(args.learnerId);
    if (!learner) return null;

    const scripts = await ctx.db
      .query("scripts")
      .withIndex("by_learner", (q) => q.eq("learnerId", learner._id))
      .order("desc")
      .collect();

    return {
      ...learner,
      scripts,
    };
  },
});

export const getByPassphrase = query({
  args: {
    passphrase: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("learners"),
      _creationTime: v.number(),
      name: v.string(),
      bio: v.optional(v.string()),
      passphrase: v.string(),
      scripts: v.array(
        v.object({
          _id: v.id("scripts"),
          _creationTime: v.number(),
          dialogue: v.string(),
          parentheticals: v.string(),
          learnerId: v.id("learners"),
        })
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const learner = await ctx.db
      .query("learners")
      .withIndex("by_passphrase", (q) => q.eq("passphrase", args.passphrase))
      .filter((q) => q.eq(q.field("passphrase"), args.passphrase))
      .unique();
    if (!learner) return null;

    const scripts = await ctx.db
      .query("scripts")
      .withIndex("by_learner", (q) => q.eq("learnerId", learner._id))
      .order("desc")
      .collect();

    return {
      ...learner,
      scripts,
    };
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
      passphrase: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const learner = await ctx.db
      .query("learners")
      .filter((q) => q.eq(q.field("passphrase"), args.passphrase))
      .unique();

    return learner;
  },
});
