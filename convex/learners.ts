import { v } from "convex/values";
import {
  query,
  mutation,
  action,
  internalAction,
  internalMutation,
  internalQuery,
  QueryCtx,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

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
    learnerId: v.id("learners"),
    email: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    isInvitation: v.optional(v.boolean()),
  }),
  handler: async (ctx, args) => {
    const userId = await ensureAuthenticated(ctx);

    // Verify the current user has access to this learner
    await ensureLearnerRelationship(ctx, args.learnerId);

    // Normalize email
    const email = args.email.trim().toLowerCase();

    // Prevent sharing with yourself (check current user's email)
    const currentUser = await ctx.db.get(userId);
    if (currentUser?.email?.toLowerCase() === email) {
      return {
        success: false,
        message: "You already have access to this learner.",
      };
    }

    // Check if user already exists
    const targetUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();

    if (targetUser) {
      // User exists - check for existing relationship
      const existingRelationship = await ctx.db
        .query("learnerMentorRelationships")
        .withIndex("by_mentor", (q) => q.eq("mentorId", targetUser._id))
        .filter((q) => q.eq(q.field("learnerId"), args.learnerId))
        .unique();

      if (existingRelationship) {
        return {
          success: false,
          message: "This user already has access to this learner.",
        };
      }

      // Create the new relationship
      await ctx.db.insert("learnerMentorRelationships", {
        learnerId: args.learnerId,
        mentorId: targetUser._id,
      });

      // Handle notification for existing user with invitation token
      await ctx.scheduler.runAfter(
        0,
        internal.learners.sendAccessNotificationWithToken,
        {
          email,
          learnerId: args.learnerId,
          mentorId: targetUser._id,
          invitingMentorId: userId,
        }
      );

      return {
        success: true,
        message: `Successfully shared learner with ${email}`,
        isInvitation: false,
      };
    } else {
      // User doesn't exist - check for existing invitation
      const existingInvitation = await ctx.db
        .query("learnerInvitations")
        .withIndex("by_email", (q) => q.eq("email", email))
        .filter((q) => q.eq(q.field("learnerId"), args.learnerId))
        .filter((q) => q.eq(q.field("status"), "pending"))
        .unique();

      if (existingInvitation) {
        return {
          success: false,
          message: "An invitation has already been sent to this email address.",
        };
      }

      // Create new invitation and send email
      await ctx.scheduler.runAfter(0, internal.learners.sendInvitation, {
        email,
        learnerId: args.learnerId,
        invitingMentorId: userId,
      });

      return {
        success: true,
        message: `Invitation sent to ${email}. They will receive an email to join and access the learner.`,
        isInvitation: true,
      };
    }
  },
});

export const removeMentor = mutation({
  args: {
    learnerId: v.id("learners"),
    mentorId: v.id("users"),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const userId = await ensureAuthenticated(ctx);

    // Verify the current user has access to this learner
    await ensureLearnerRelationship(ctx, args.learnerId);

    // Don't allow removing yourself if you're the only mentor
    const allRelationships = await ctx.db
      .query("learnerMentorRelationships")
      .withIndex("by_learner", (q) => q.eq("learnerId", args.learnerId))
      .collect();

    if (allRelationships.length === 1 && args.mentorId === userId) {
      return {
        success: false,
        message:
          "Cannot remove yourself - you are the only mentor for this learner.",
      };
    }

    // Find and remove the relationship
    const relationship = await ctx.db
      .query("learnerMentorRelationships")
      .withIndex("by_mentor", (q) => q.eq("mentorId", args.mentorId))
      .filter((q) => q.eq(q.field("learnerId"), args.learnerId))
      .unique();

    if (!relationship) {
      return {
        success: false,
        message: "Mentor access not found.",
      };
    }

    await ctx.db.delete(relationship._id);

    return {
      success: true,
      message: "Mentor access removed successfully.",
    };
  },
});

export const getMentors = query({
  args: {
    learnerId: v.id("learners"),
  },
  returns: v.array(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      phone: v.optional(v.string()),
      phoneVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
    })
  ),
  handler: async (ctx, args) => {
    await ensureLearnerRelationship(ctx, args.learnerId);

    const relationships = await ctx.db
      .query("learnerMentorRelationships")
      .withIndex("by_learner", (q) => q.eq("learnerId", args.learnerId))
      .collect();

    const mentors = await Promise.all(
      relationships.map((r) => ctx.db.get(r.mentorId))
    );

    return mentors.filter((mentor) => mentor !== null) as Array<Doc<"users">>;
  },
});

export const sendInvitation = internalAction({
  args: {
    email: v.string(),
    learnerId: v.id("learners"),
    invitingMentorId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Generate a secure token
    const token = generateInvitationToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days from now

    // Store the invitation
    await ctx.runMutation(internal.learners.createInvitation, {
      email: args.email,
      learnerId: args.learnerId,
      invitingMentorId: args.invitingMentorId,
      token,
      expiresAt,
    });

    // Send the invitation email
    await ctx.runAction(internal.learners.sendInvitationEmail, {
      email: args.email,
      token,
      learnerId: args.learnerId,
      invitingMentorId: args.invitingMentorId,
    });

    return null;
  },
});

export const createInvitation = internalMutation({
  args: {
    email: v.string(),
    learnerId: v.id("learners"),
    invitingMentorId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  },
  returns: v.id("learnerInvitations"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("learnerInvitations", {
      email: args.email,
      learnerId: args.learnerId,
      invitingMentorId: args.invitingMentorId,
      token: args.token,
      expiresAt: args.expiresAt,
      status: "pending",
    });
  },
});

export const sendInvitationEmail = internalAction({
  args: {
    email: v.string(),
    token: v.string(),
    learnerId: v.id("learners"),
    invitingMentorId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Get learner and inviting mentor details
    const learner = await ctx.runQuery(internal.learners.getLearnerDetails, {
      learnerId: args.learnerId,
    });
    const invitingMentor = await ctx.runQuery(
      internal.learners.getUserDetails,
      {
        userId: args.invitingMentorId,
      }
    );

    if (!learner || !invitingMentor) {
      throw new Error("Failed to get learner or mentor details");
    }

    // Create invitation URL
    const baseUrl = process.env.SITE_URL || "http://localhost:3000";
    const invitationUrl = `${baseUrl}/invitation/${args.token}`;

    // Send email using Resend
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.AUTH_RESEND_KEY);

    const { error } = await resend.emails.send({
      from: "no-reply@banerry.app",
      to: [args.email],
      subject: `${invitingMentor.name || invitingMentor.email} invited you to mentor "${learner.name}" on Banerry`,
      html: createInvitationEmailTemplate({
        learnerName: learner.name,
        inviterName: invitingMentor.name || invitingMentor.email || "A mentor",
        invitationUrl,
      }),
      text: `You've been invited to mentor "${learner.name}" on Banerry by ${invitingMentor.name || invitingMentor.email}. Click this link to accept: ${invitationUrl}`,
    });

    if (error) {
      throw new Error(
        `Failed to send invitation email: ${JSON.stringify(error)}`
      );
    }

    return null;
  },
});

export const getLearnerDetails = internalQuery({
  args: {
    learnerId: v.id("learners"),
  },
  returns: v.union(
    v.object({
      name: v.string(),
      bio: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const learner = await ctx.db.get(args.learnerId);
    if (!learner) return null;
    return {
      name: learner.name,
      bio: learner.bio,
    };
  },
});

export const getUserDetails = internalQuery({
  args: {
    userId: v.id("users"),
  },
  returns: v.union(
    v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return {
      name: user.name,
      email: user.email,
    };
  },
});

export const sendAccessNotificationEmail = internalAction({
  args: {
    email: v.string(),
    learnerId: v.id("learners"),
    mentorId: v.id("users"),
    token: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const learner = await ctx.runQuery(internal.learners.getLearnerDetails, {
      learnerId: args.learnerId,
    });

    if (!learner) {
      throw new Error("Learner not found");
    }

    const baseUrl = process.env.SITE_URL || "http://localhost:3000";
    const invitationUrl = `${baseUrl}/invitation/${args.token}`;

    // Send email using Resend
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.AUTH_RESEND_KEY);

    const { error } = await resend.emails.send({
      from: "Banerry <invitations@banerry.app>",
      to: [args.email],
      subject: `You now have access to "${learner.name}" on Banerry`,
      html: createAccessNotificationEmailTemplate({
        learnerName: learner.name,
        learnerUrl: invitationUrl,
      }),
      text: `You now have access to mentor "${learner.name}" on Banerry. Visit: ${invitationUrl}`,
    });

    if (error) {
      throw new Error(
        `Failed to send access notification email: ${JSON.stringify(error)}`
      );
    }

    return null;
  },
});

export const sendAccessNotificationWithToken = internalAction({
  args: {
    email: v.string(),
    learnerId: v.id("learners"),
    mentorId: v.id("users"),
    invitingMentorId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Generate a token for the notification invitation
    const token = generateInvitationToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days from now

    // Create an invitation record (marked as accepted since user already has access)
    await ctx.runMutation(internal.learners.createInvitationForExistingUser, {
      email: args.email,
      learnerId: args.learnerId,
      invitingMentorId: args.invitingMentorId,
      token,
      expiresAt,
    });

    // Send the notification email with invitation link
    await ctx.runAction(internal.learners.sendAccessNotificationEmail, {
      email: args.email,
      learnerId: args.learnerId,
      mentorId: args.mentorId,
      token,
    });

    return null;
  },
});

export const createInvitationForExistingUser = internalMutation({
  args: {
    email: v.string(),
    learnerId: v.id("learners"),
    invitingMentorId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  },
  returns: v.id("learnerInvitations"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("learnerInvitations", {
      email: args.email,
      learnerId: args.learnerId,
      invitingMentorId: args.invitingMentorId,
      token: args.token,
      expiresAt: args.expiresAt,
      status: "accepted", // Already accepted since user has immediate access
    });
  },
});

export const markInvitationExpired = mutation({
  args: {
    invitationId: v.id("learnerInvitations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invitationId, { status: "expired" });
    return null;
  },
});

export const getInvitation = query({
  args: {
    token: v.string(),
  },
  returns: v.union(
    v.object({
      _creationTime: v.number(),
      _id: v.id("learnerInvitations"),
      email: v.string(),
      learnerId: v.id("learners"),
      invitingMentorId: v.id("users"),
      expiresAt: v.number(),
      status: v.union(
        v.literal("pending"),
        v.literal("accepted"),
        v.literal("expired")
      ),
      learner: v.object({
        name: v.string(),
        bio: v.optional(v.string()),
      }),
      invitingMentor: v.object({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
      }),
      token: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("learnerInvitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!invitation) return null;

    // Check if expired and handle it (readonly check)
    let currentStatus = invitation.status;
    if (invitation.expiresAt < Date.now() && invitation.status === "pending") {
      currentStatus = "expired";
    }

    const learner = await ctx.db.get(invitation.learnerId);
    const invitingMentor = await ctx.db.get(invitation.invitingMentorId);

    if (!learner || !invitingMentor) return null;

    return {
      ...invitation,
      status: currentStatus,
      learner: {
        name: learner.name,
        bio: learner.bio,
      },
      invitingMentor: {
        name: invitingMentor.name,
        email: invitingMentor.email,
      },
    };
  },
});

export const acceptInvitation = mutation({
  args: {
    token: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    learnerId: v.optional(v.id("learners")),
  }),
  handler: async (ctx, args) => {
    const userId = await ensureAuthenticated(ctx);
    const user = await ctx.db.get(userId);

    if (!user?.email) {
      return {
        success: false,
        message: "User email not found",
      };
    }

    const invitation = await ctx.db
      .query("learnerInvitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!invitation) {
      return {
        success: false,
        message: "Invitation not found",
      };
    }

    if (invitation.status !== "pending") {
      return {
        success: false,
        message: "Invitation has already been used or expired",
      };
    }

    if (invitation.expiresAt < Date.now()) {
      await ctx.db.patch(invitation._id, { status: "expired" });
      return {
        success: false,
        message: "Invitation has expired",
      };
    }

    // Verify email matches
    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      return {
        success: false,
        message: "This invitation was sent to a different email address",
      };
    }

    // Check for existing relationship
    const existingRelationship = await ctx.db
      .query("learnerMentorRelationships")
      .withIndex("by_mentor", (q) => q.eq("mentorId", userId))
      .filter((q) => q.eq(q.field("learnerId"), invitation.learnerId))
      .unique();

    if (existingRelationship) {
      // Mark invitation as accepted even though relationship exists
      await ctx.db.patch(invitation._id, { status: "accepted" });
      return {
        success: true,
        message: "You already have access to this learner",
        learnerId: invitation.learnerId,
      };
    }

    // Create the relationship
    await ctx.db.insert("learnerMentorRelationships", {
      learnerId: invitation.learnerId,
      mentorId: userId,
    });

    // Mark invitation as accepted
    await ctx.db.patch(invitation._id, { status: "accepted" });

    return {
      success: true,
      message:
        "Successfully accepted invitation! You now have access to this learner.",
      learnerId: invitation.learnerId,
    };
  },
});

function generateInvitationToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function createInvitationEmailTemplate({
  learnerName,
  inviterName,
  invitationUrl,
}: {
  learnerName: string;
  inviterName: string;
  invitationUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>You're invited to Banerry</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #1f2937; margin: 0;">You're invited to Banerry!</h1>
  </div>
  
  <p style="font-size: 16px; line-height: 1.6; color: #374151;">
    Hi there!
  </p>
  
  <p style="font-size: 16px; line-height: 1.6; color: #374151;">
    <strong>${inviterName}</strong> has invited you to help mentor <strong>"${learnerName}"</strong> on Banerry, 
    a communication assistance app for gestalt language processors.
  </p>
  
  <p style="font-size: 16px; line-height: 1.6; color: #374151;">
    To accept this invitation and start collaborating:
  </p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${invitationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
      Accept Invitation
    </a>
  </div>
  
  <p style="font-size: 14px; line-height: 1.6; color: #6b7280;">
    If the button doesn't work, you can copy and paste this link into your browser:
  </p>
  <p style="font-size: 14px; color: #6b7280; word-break: break-all;">
    ${invitationUrl}
  </p>
  
  <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-top: 30px;">
    This invitation will expire in 7 days. If you have any questions, please contact the person who invited you.
  </p>
  
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  
  <p style="font-size: 12px; color: #9ca3af;">
    This email was sent by Banerry. If you didn't expect this invitation, you can safely ignore this email.
  </p>
</body>
</html>
  `.trim();
}

function createAccessNotificationEmailTemplate({
  learnerName,
  learnerUrl,
}: {
  learnerName: string;
  learnerUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>You have access to a learner on Banerry</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #1f2937; margin: 0;">You have new access on Banerry!</h1>
  </div>
  
  <p style="font-size: 16px; line-height: 1.6; color: #374151;">
    Hi there!
  </p>
  
  <p style="font-size: 16px; line-height: 1.6; color: #374151;">
    You now have access to help mentor <strong>"${learnerName}"</strong> on Banerry, 
    a communication assistance app for gestalt language processors.
  </p>
  
  <p style="font-size: 16px; line-height: 1.6; color: #374151;">
    You can start collaborating right away:
  </p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${learnerUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
      View Learner
    </a>
  </div>
  
  <p style="font-size: 14px; line-height: 1.6; color: #6b7280;">
    If the button doesn't work, you can copy and paste this link into your browser:
  </p>
  <p style="font-size: 14px; color: #6b7280; word-break: break-all;">
    ${learnerUrl}
  </p>
  
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  
  <p style="font-size: 12px; color: #9ca3af;">
    This email was sent by Banerry. If you didn't expect this access, please contact your mentor.
  </p>
</body>
</html>
  `.trim();
}

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
