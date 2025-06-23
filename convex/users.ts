import { mutation, query } from "./_generated/server";

export const store = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log(identity);
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
  handler: async (ctx, args) => {
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