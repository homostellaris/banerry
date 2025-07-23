import { v } from "convex/values";
import { query, mutation, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";

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
    const userId = await ensureAuthenticated(ctx);
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

    await ctx.db.insert("learnerMentorRelationships", {
      learnerId,
      mentorId: userId,
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
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Unauthenticated");
    const learnerMentorRelationships = await ctx.db
      .query("learnerMentorRelationships")
      .withIndex("by_mentor", (q) => q.eq("mentorId", userId))
      .collect();
    const learners = await Promise.all(
      learnerMentorRelationships.map((r) => ctx.db.get(r.learnerId))
    );

    return learners.filter((learner) => learner !== null) as Array<
      Doc<"learners">
    >; // TODO: Consolidate Convex and main TS config so that this doesn't throw during Convex build
  },
});

export const del = mutation({
  args: {
    learnerId: v.id("learners"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureLearnerRelationship(ctx, args.learnerId);

    const scripts = await ctx.db
      .query("scripts")
      .withIndex("by_learner", (q) => q.eq("learnerId", args.learnerId))
      .collect();

    for (const script of scripts) {
      await ctx.db.delete(script._id);
    }

    const targetScripts = await ctx.db
      .query("targetScripts")
      .withIndex("by_learner", (q) => q.eq("learnerId", args.learnerId))
      .collect();

    for (const targetScript of targetScripts) {
      await ctx.db.delete(targetScript._id);
    }

    const relationships = await ctx.db
      .query("learnerMentorRelationships")
      .filter((q) => q.eq(q.field("learnerId"), args.learnerId))
      .collect();

    for (const relationship of relationships) {
      await ctx.db.delete(relationship._id);
    }

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
    await ensureLearnerRelationship(ctx, args.learnerId);
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
      targetScripts: v.array(
        v.object({
          _id: v.id("targetScripts"),
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
    await ensureLearnerRelationship(ctx, args.learnerId);
    const learner = await ctx.db.get(args.learnerId);
    if (!learner) return null;

    const scripts = await ctx.db
      .query("scripts")
      .withIndex("by_learner", (q) => q.eq("learnerId", learner._id))
      .order("desc")
      .collect();

    const targetScripts = await ctx.db
      .query("targetScripts")
      .withIndex("by_learner", (q) => q.eq("learnerId", learner._id))
      .order("desc")
      .collect();

    return {
      ...learner,
      scripts,
      targetScripts,
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
      targetScripts: v.array(
        v.object({
          _id: v.id("targetScripts"),
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
      .unique();
    if (!learner) return null;

    const scripts = await ctx.db
      .query("scripts")
      .withIndex("by_learner", (q) => q.eq("learnerId", learner._id))
      .order("desc")
      .collect();

    const targetScripts = await ctx.db
      .query("targetScripts")
      .withIndex("by_learner", (q) => q.eq("learnerId", learner._id))
      .order("desc")
      .collect();

    return {
      ...learner,
      scripts,
      targetScripts,
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

export const share = mutation({
  args: {
    email: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await ensureAuthenticated(ctx);
    const learnerMentorRelationship = await ctx.db
      .query("learnerMentorRelationships")
      .withIndex("by_mentor", (q) => q.eq("mentorId", userId))
      .first();

    if (!learnerMentorRelationship) {
      throw new Error("Unauthorized");
    }

    // Here you would implement the logic to share the learner with the email
    // This could involve sending an email or creating a new relationship
    // For now, we just log it
    console.log(`Sharing learner with email: ${args.email}`);

    return null;
  },
});

async function ensureLearnerRelationship(
  ctx: QueryCtx,
  learnerId: Id<"learners">
) {
  const userId = await ensureAuthenticated(ctx);
  const learnerMentorRelationship = await ctx.db
    .query("learnerMentorRelationships")
    .withIndex("by_mentor", (q) => q.eq("mentorId", userId))
    .filter((q) => q.eq(q.field("learnerId"), learnerId)) // TODO: Use compound index instead?
    .unique();
  if (learnerMentorRelationship === null) throw new Error("Unauthorized");
  return learnerMentorRelationship;
}

async function ensureAuthenticated(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new Error("Unauthenticated");
  return userId;
}
