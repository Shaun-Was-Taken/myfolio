import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.string(),
    hasGeneratedPortfolio: v.optional(v.boolean()),
    displayId: v.string()

    
  }).index("by_clerkId", ["clerkId"] ).index("by_displayId", ["displayId"]),

  resume: defineTable({
    clerkId: v.string(),
    fileName: v.string(),
    fileId: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    status: v.string(),
    createdAt: v.number(),
    resumeText: v.optional(v.string()),
    fieldJSON: v.any(),
  }).index("by_clerkId", ["clerkId"]),
});
