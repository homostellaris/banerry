import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const columnValidator = v.object({
  id: v.string(),
  title: v.string(),
  imageStorageId: v.optional(v.id("_storage")),
  imagePrompt: v.optional(v.string()),
  timerDuration: v.optional(v.number()),
  position: v.number(),
});

const boardValidator = v.object({
  _id: v.id("boards"),
  _creationTime: v.number(),
  learnerId: v.id("learners"),
  name: v.string(),
  columns: v.array(columnValidator),
  isActive: v.boolean(),
  createdAt: v.number(),
  generationPrompt: v.optional(v.string()),
});

export const getBoards = query({
  args: { learnerId: v.id("learners") },
  returns: v.array(boardValidator),
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
  returns: v.union(boardValidator, v.null()),
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
    columns: v.optional(v.array(columnValidator)),
  },
  returns: v.id("boards"),
  handler: async (ctx, args) => {
    const activeBoard = await ctx.db
      .query("boards")
      .withIndex("by_learner_active", (q) =>
        q.eq("learnerId", args.learnerId).eq("isActive", true)
      )
      .first();

    if (activeBoard) {
      await ctx.db.patch(activeBoard._id, { isActive: false });
    }

    const defaultColumns = args.columns || [
      { id: "column-1", title: "Step 1", position: 0 },
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
      columns: v.optional(v.array(columnValidator)),
      generationPrompt: v.optional(v.string()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.boardId, args.updates);
    return null;
  },
});

export const addColumn = mutation({
  args: {
    boardId: v.id("boards"),
    title: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) {
      throw new Error("Board not found");
    }

    const position = board.columns.length;
    const columnNumber = position + 1;
    const newColumn = {
      id: `column-${Date.now()}`,
      title: args.title || `Step ${columnNumber}`,
      position,
    };

    await ctx.db.patch(args.boardId, {
      columns: [...board.columns, newColumn],
    });
    return null;
  },
});

export const deleteColumn = mutation({
  args: {
    boardId: v.id("boards"),
    columnId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) {
      throw new Error("Board not found");
    }

    const filteredColumns = board.columns.filter(
      (column) => column.id !== args.columnId
    );

    const reindexedColumns = filteredColumns.map((column, index) => ({
      ...column,
      position: index,
    }));

    await ctx.db.patch(args.boardId, { columns: reindexedColumns });
    return null;
  },
});

export const updateColumnTitle = mutation({
  args: {
    boardId: v.id("boards"),
    columnId: v.string(),
    title: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) {
      throw new Error("Board not found");
    }

    const updatedColumns = board.columns.map((column) =>
      column.id === args.columnId ? { ...column, title: args.title } : column
    );

    await ctx.db.patch(args.boardId, { columns: updatedColumns });
    return null;
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

export const updateAllColumnImages = mutation({
  args: {
    boardId: v.id("boards"),
    columnImages: v.array(
      v.object({
        columnId: v.string(),
        title: v.string(),
        imageStorageId: v.id("_storage"),
        imagePrompt: v.string(),
      })
    ),
    boardName: v.optional(v.string()),
    generationPrompt: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) {
      throw new Error("Board not found");
    }

    const newColumns = args.columnImages.map((img, index) => ({
      id: img.columnId,
      title: img.title,
      imageStorageId: img.imageStorageId,
      imagePrompt: img.imagePrompt,
      position: index,
    }));

    const updates: {
      columns: typeof newColumns;
      name?: string;
      generationPrompt?: string;
    } = { columns: newColumns };

    if (args.boardName) {
      updates.name = args.boardName;
    }
    if (args.generationPrompt) {
      updates.generationPrompt = args.generationPrompt;
    }

    await ctx.db.patch(args.boardId, updates);
    return null;
  },
});