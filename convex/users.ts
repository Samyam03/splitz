import { internal } from "./_generated/api";
import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const store = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    const displayName = identity.name || 
                       [identity.firstName, identity.lastName].filter(Boolean).join(' ') || 
                       identity.email?.split('@')[0] || 
                       "Anonymous User";

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user !== null) {
      if (user.name !== displayName) {
        await ctx.db.patch(user._id, { name: displayName });
      }
      if (!user.email && identity.email) {
        await ctx.db.patch(user._id, { email: identity.email });
      }
      return user._id;
    }

    return await ctx.db.insert("users", {
      name: displayName,
      email: identity.email ?? null, // Now matches schema
      tokenIdentifier: identity.tokenIdentifier,
      createdAt: Date.now(),
    });
  },
});

export const getUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const user = await ctx.db.query("users").withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    ).first();
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },
});

export const getCurrentUser = internalQuery({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db.query("users").withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    ).first();
    return user;
  },
});

export const searchUsers = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args): Promise<Array<{
    id: Id<"users">;
    name: string;
    email: string | null;
    imageUrl?: string;
  }>> => {
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser);

    if (args.query.length === 0) return [];

    const nameResults = await ctx.db.query("users").withSearchIndex("search_name", (q) =>
      q.search("name", args.query)
    ).collect();

    const emailResults = await ctx.db.query("users").withSearchIndex("search_email", (q) =>
      q.search("email", args.query)
    ).collect();

    // Combine and deduplicate results using a Map
    const userMap = new Map();
    
    [...nameResults, ...emailResults].forEach((user) => {
      if (user._id !== currentUser?._id) {
        userMap.set(user._id, user);
      }
    });

    return Array.from(userMap.values()).map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
    }));
  },
});

export const skip = query({
  args: {},
  handler: async () => {
    return null;
  },
});