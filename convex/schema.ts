import { defineSchema, defineTable} from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users:defineTable({
    name: v.string(),
    email: v.union(v.string(), v.null()),
    tokenIdentifier: v.string(),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
}).index("by_token", ["tokenIdentifier"]),
})