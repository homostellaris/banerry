import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  learners: defineTable({
    name: v.string(),
    bio: v.optional(v.string()),
  }),
  learnerLinks: defineTable({
    learnerId: v.id("learners"),
    passphrase: v.string(),
  }),
  learnerMentorRelationships: defineTable({
    learnerId: v.id("learners"),
    mentorId: v.id("learners"),
    relationshipType: v.string(), // e.g., "parent", "teacher", "therapist"
  }),
  learnerScripts: defineTable({
    learnerId: v.id("learners"),
    scriptId: v.id("scripts"),
  }),
  mentors: defineTable({
    name: v.string(),
  }),
  mitigations: defineTable({
    learnerId: v.id("learners"),
    scriptId: v.id("scripts"),
    rationale: v.string(),
  }),
  scripts: defineTable({
    dialogue: v.string(),
    parentheticals: v.string(),
  }),
});
