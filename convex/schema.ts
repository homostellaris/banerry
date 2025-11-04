import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  learners: defineTable({
    name: v.string(),
    bio: v.optional(v.string()),
    passphrase: v.string(),
  }).index("by_passphrase", ["passphrase"]),
  learnerMentorRelationships: defineTable({
    learnerId: v.id("learners"),
    mentorId: v.id("users"),
    relationshipType: v.optional(v.string()), // e.g., "parent", "teacher", "therapist"
  })
    .index("by_learner", ["learnerId"])
    .index("by_mentor", ["mentorId"]),
  learnerInvitations: defineTable({
    email: v.string(),
    learnerId: v.id("learners"),
    invitingMentorId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired")),
  })
    .index("by_email", ["email"])
    .index("by_token", ["token"])
    .index("by_learner", ["learnerId"]),
  scripts: defineTable({
    learnerId: v.id("learners"),
    dialogue: v.string(),
    parentheticals: v.string(),
  }).index("by_learner", ["learnerId"]),
  targetScripts: defineTable({
    learnerId: v.id("learners"),
    dialogue: v.string(),
    parentheticals: v.string(),
  }).index("by_learner", ["learnerId"]),
  boards: defineTable({
    learnerId: v.id("learners"),
    name: v.string(),
    columns: v.array(
      v.object({
        title: v.string(),
        image: v.optional(v.string()), // Base64 encoded image
        prompt: v.optional(v.string()), // Original prompt used to generate the image
        timerMinutes: v.optional(v.number()), // Timer duration in minutes
        isActive: v.boolean(), // Whether this column is currently active/highlighted
      })
    ),
    isActive: v.boolean(), // Whether this board is currently being used
  }).index("by_learner", ["learnerId"]),
});
