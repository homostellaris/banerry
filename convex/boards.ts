import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getBoards = query({
  args: { learnerId: v.id("learners") },
  returns: v.array(v.object({
    _id: v.id("boards"),
    _creationTime: v.number(),
    learnerId: v.id("learners"),
    name: v.string(),
    columns: v.array(v.object({
      id: v.string(),
      title: v.string(),
      imageStorageId: v.optional(v.id("_storage")),
      imagePrompt: v.optional(v.string()),
      timerDuration: v.optional(v.number()),
      position: v.number(),
    })),
    isActive: v.boolean(),
    createdAt: v.number(),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("boards")
      .withIndex("by_learner", (q) => q.eq("learnerId", args.learnerId))
      .order("desc")
      .collect();
  },
});

export const getActiveBoard = query({
  args: { learnerId: v.id("learners") },
  returns: v.union(v.object({
    _id: v.id("boards"),
    _creationTime: v.number(),
    learnerId: v.id("learners"),
    name: v.string(),
    columns: v.array(v.object({
      id: v.string(),
      title: v.string(),
      imageStorageId: v.optional(v.id("_storage")),
      imagePrompt: v.optional(v.string()),
      timerDuration: v.optional(v.number()),
      position: v.number(),
    })),
    isActive: v.boolean(),
    createdAt: v.number(),
  }), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("boards")
      .withIndex("by_learner_active", (q) => 
        q.eq("learnerId", args.learnerId).eq("isActive", true)
      )
      .first();
  },
});

export const createBoard = mutation({
  args: {
    learnerId: v.id("learners"),
    name: v.string(),
    columns: v.optional(v.array(v.object({
      id: v.string(),
      title: v.string(),
      imageStorageId: v.optional(v.id("_storage")),
      imagePrompt: v.optional(v.string()),
      timerDuration: v.optional(v.number()),
      position: v.number(),
    }))),
  },
  returns: v.id("boards"),
  handler: async (ctx, args) => {
    // Deactivate any existing active boards
    const activeBoard = await ctx.db
      .query("boards")
      .withIndex("by_learner_active", (q) => 
        q.eq("learnerId", args.learnerId).eq("isActive", true)
      )
      .first();
    
    if (activeBoard) {
      await ctx.db.patch(activeBoard._id, { isActive: false });
    }

    // Create default columns if none provided
    const defaultColumns = args.columns || [
      { id: "now", title: "Now", position: 0 },
      { id: "next", title: "Next", position: 1 },
      { id: "then", title: "Then", position: 2 },
    ];

    return await ctx.db.insert("boards", {
      learnerId: args.learnerId,
      name: args.name,
      columns: defaultColumns,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const updateBoard = mutation({
  args: {
    boardId: v.id("boards"),
    updates: v.object({
      name: v.optional(v.string()),
      columns: v.optional(v.array(v.object({
        id: v.string(),
        title: v.string(),
        imageStorageId: v.optional(v.id("_storage")),
        imagePrompt: v.optional(v.string()),
        timerDuration: v.optional(v.number()),
        position: v.number(),
      }))),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.boardId, args.updates);
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
  },
});

export const deleteBoard = mutation({
  args: { boardId: v.id("boards") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.boardId);
    return null;
  },
});

export const renameBoard = mutation({
  args: {
    boardId: v.id("boards"),
    name: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.boardId, { name: args.name });
    return null;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateColumnImage = mutation({
  args: {
    boardId: v.id("boards"),
    columnId: v.string(),
    imageStorageId: v.id("_storage"),
    imagePrompt: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) {
      throw new Error("Board not found");
    }

    const updatedColumns = board.columns.map(column =>
      column.id === args.columnId
        ? { ...column, imageStorageId: args.imageStorageId, imagePrompt: args.imagePrompt }
        : column
    );

    await ctx.db.patch(args.boardId, { columns: updatedColumns });
  },
});

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const updateColumnTimer = mutation({
  args: {
    boardId: v.id("boards"),
    columnId: v.string(),
    timerDuration: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) {
      throw new Error("Board not found");
    }

    const updatedColumns = board.columns.map(column =>
      column.id === args.columnId
        ? { ...column, timerDuration: args.timerDuration }
        : column
    );

    await ctx.db.patch(args.boardId, { columns: updatedColumns });
  },
});