"use node";

import { v } from "convex/values";
import {
  query,
  mutation,
  action,
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

export const createBoard = mutation({
  args: {
    learnerId: v.id("learners"),
    name: v.string(),
  },
  returns: v.id("boards"),
  handler: async (ctx, args) => {
    // Deactivate any currently active board for this learner
    const activeBoards = await ctx.db
      .query("boards")
      .withIndex("by_learner", (q) => q.eq("learnerId", args.learnerId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    for (const board of activeBoards) {
      await ctx.db.patch(board._id, { isActive: false });
    }

    // Create default "Now, Next, Then" board
    const boardId = await ctx.db.insert("boards", {
      learnerId: args.learnerId,
      name: args.name,
      columns: [
        { title: "Now", isActive: false },
        { title: "Next", isActive: false },
        { title: "Then", isActive: false },
      ],
      isActive: true,
    });

    return boardId;
  },
});

export const listBoards = query({
  args: {
    learnerId: v.id("learners"),
  },
  returns: v.array(
    v.object({
      _id: v.id("boards"),
      _creationTime: v.number(),
      learnerId: v.id("learners"),
      name: v.string(),
      columns: v.array(
        v.object({
          title: v.string(),
          image: v.optional(v.string()),
          prompt: v.optional(v.string()),
          timerMinutes: v.optional(v.number()),
          isActive: v.boolean(),
        })
      ),
      isActive: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("boards")
      .withIndex("by_learner", (q) => q.eq("learnerId", args.learnerId))
      .order("desc")
      .collect();
  },
});

export const getActiveBoard = query({
  args: {
    learnerId: v.id("learners"),
  },
  returns: v.union(
    v.object({
      _id: v.id("boards"),
      _creationTime: v.number(),
      learnerId: v.id("learners"),
      name: v.string(),
      columns: v.array(
        v.object({
          title: v.string(),
          image: v.optional(v.string()),
          prompt: v.optional(v.string()),
          timerMinutes: v.optional(v.number()),
          isActive: v.boolean(),
        })
      ),
      isActive: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("boards")
      .withIndex("by_learner", (q) => q.eq("learnerId", args.learnerId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
  },
});

export const setActiveBoard = mutation({
  args: {
    learnerId: v.id("learners"),
    boardId: v.id("boards"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Deactivate all boards for this learner
    const allBoards = await ctx.db
      .query("boards")
      .withIndex("by_learner", (q) => q.eq("learnerId", args.learnerId))
      .collect();

    for (const board of allBoards) {
      await ctx.db.patch(board._id, { isActive: false });
    }

    // Activate the selected board
    await ctx.db.patch(args.boardId, { isActive: true });

    return null;
  },
});

export const updateColumnImage = mutation({
  args: {
    boardId: v.id("boards"),
    columnIndex: v.number(),
    image: v.string(),
    prompt: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) {
      throw new Error("Board not found");
    }

    const updatedColumns = [...board.columns];
    if (args.columnIndex >= 0 && args.columnIndex < updatedColumns.length) {
      updatedColumns[args.columnIndex] = {
        ...updatedColumns[args.columnIndex],
        image: args.image,
        prompt: args.prompt,
      };

      await ctx.db.patch(args.boardId, { columns: updatedColumns });
    }

    return null;
  },
});

export const setActiveColumn = mutation({
  args: {
    boardId: v.id("boards"),
    columnIndex: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) {
      throw new Error("Board not found");
    }

    const updatedColumns = board.columns.map((column, index) => ({
      ...column,
      isActive: index === args.columnIndex,
    }));

    await ctx.db.patch(args.boardId, { columns: updatedColumns });

    return null;
  },
});

export const setColumnTimer = mutation({
  args: {
    boardId: v.id("boards"),
    columnIndex: v.number(),
    timerMinutes: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) {
      throw new Error("Board not found");
    }

    const updatedColumns = [...board.columns];
    if (args.columnIndex >= 0 && args.columnIndex < updatedColumns.length) {
      updatedColumns[args.columnIndex] = {
        ...updatedColumns[args.columnIndex],
        timerMinutes: args.timerMinutes,
      };

      await ctx.db.patch(args.boardId, { columns: updatedColumns });
    }

    return null;
  },
});

export const deleteBoard = mutation({
  args: {
    boardId: v.id("boards"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.boardId);
    return null;
  },
});

export const generateImageForColumn = action({
  args: {
    boardId: v.id("boards"),
    columnIndex: v.number(),
    prompt: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
    image: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      // Check if API key is available
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return {
          success: false,
          error: "OpenAI API key is not configured",
        };
      }

      // Generate image using DALL-E 3
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: args.prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          response_format: "b64_json",
        }),
      });

      if (!response.ok) {
        let errorMessage = `OpenAI API error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch {
          // If we can't parse the error response, use the status
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await response.json();
      const imageBase64 = data.data[0].b64_json;

      // Update the board with the new image
      await ctx.runMutation(internal.boards.updateColumnImageInternal, {
        boardId: args.boardId,
        columnIndex: args.columnIndex,
        image: `data:image/png;base64,${imageBase64}`,
        prompt: args.prompt,
      });

      return {
        success: true,
        image: `data:image/png;base64,${imageBase64}`,
      };
    } catch (error) {
      console.error("Image generation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});

export const updateColumnImageInternal = internalMutation({
  args: {
    boardId: v.id("boards"),
    columnIndex: v.number(),
    image: v.string(),
    prompt: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) {
      throw new Error("Board not found");
    }

    const updatedColumns = [...board.columns];
    if (args.columnIndex >= 0 && args.columnIndex < updatedColumns.length) {
      updatedColumns[args.columnIndex] = {
        ...updatedColumns[args.columnIndex],
        image: args.image,
        prompt: args.prompt,
      };

      await ctx.db.patch(args.boardId, { columns: updatedColumns });
    }

    return null;
  },
});