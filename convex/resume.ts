import {
  action,
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";
import OpenAI from "openai";
import { getUserByClerkId } from "./user";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("not_authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveResume = mutation({
  args: {
    fileName: v.string(),
    fileId: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    resumeText: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const userId = identity.subject;

    // Verify the file exists in storage
    const exists = (await ctx.storage.getUrl(args.fileId)) !== null;
    if (!exists) {
      throw new ConvexError("File not found in storage");
    }

    // Save the resume metadata
    const resumeId = await ctx.db.insert("resume", {
      clerkId: userId,
      fileName: args.fileName,
      fileId: args.fileId,
      fileSize: args.fileSize,
      fileType: args.fileType,
      status: "uploaded",
      createdAt: Date.now(),
      resumeText: args.resumeText,
      fieldJSON: {},
    });

    // Process the resume with DeepSeek
    await ctx.scheduler.runAfter(0, internal.resume.processWithDeepSeek, {
      resumeId,
      fileId: args.fileId,
      fileType: args.fileType,
    });

    return resumeId;
  },
});
export const getResumeById = query({
  args: { resumeId: v.id("resume") },
  handler: async (ctx, args) => {
    // This is an internal query that doesn't require authentication
    // since it's called from an internal action
    const resume = await ctx.db.get(args.resumeId);
    if (!resume) {
      throw new ConvexError("Resume not found");
    }
    return resume;
  },
});

export const processWithDeepSeek = internalAction({
  args: {
    resumeId: v.id("resume"),
    fileId: v.string(),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the resume directly from the database instead of using getUserResumes
    const resume = await ctx.runQuery(api.resume.getResumeById, {
      resumeId: args.resumeId,
    });

    try {
      // Update status to processing
      await ctx.runMutation(internal.resume.updateResumeStatus, {
        resumeId: args.resumeId,
        status: "processing",
      });

      const client = new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: "https://api.deepseek.com",
      });

      const systemPrompt = `
You are an expert resume parser that extracts detailed information from resumes. 
Follow these instructions carefully:

1. Read the entire resume thoroughly
2. Extract ALL available information
3. Pay special attention to:
   - Header section (name, contact info)
   - Education section (schools, degrees)
   - Work experience (companies, positions)
   - Skills and certifications
   - Any other relevant sections

IMPORTANT: You MUST return actual values found in the resume. ALSO, words are merged togher split them apart, based on what makes most since, with a space, each english word MUST have a space between them. Do NOT return empty fields unless absolutely nothing is found. Do not add additional fields beyond the given structure.

Required JSON format with example values:
{
  "name": "John Doe (from header)",
  "profilePicture": "can be null",
  contact: {
  "email": "john.doe@example.com (from contact info)",
  "phone": "+1 (555) 123-4567 (from contact info)",
  "location": "San Francisco, CA (from address)"
  },
  "title": "generate from the context of the resume e.g Software Engineer, Manager, etc.",
  
  "about": ["generate an about be of who the person is e.g I am a software engineer with 5 years of experience..."],
  "descripton": "generate a short summary of what is generated in about feild",
  "education": [
    {
      "school": "",
      "degree": "",
      "period": "can be null",
      "schoolLogo": "can be null",
      "courses": [list of courses],
      "activities": [list of activities],
      "honors": [list of honors mentioned in the resume],
      "gpa": "can be null"
    }
  ],
  "experience": [
    {
      "title": "title of job",
      "company": "company name",
      "companyLogo": "can be null",
      "period": "can be null",
      "location": "can be null",
      "description": [
        "Led team of 5 engineers...",
        "Developed new features..."
      ]
    }
  ],
  "projects": [
    {
      "title": "name of project",
      "description": "",
      "period": "can be null",
      "tags": [],
      "githubLink": "can be null",
      "liveLink": "can be null"
    }
  ],
  "skills": [],
  "certifications": [
    {
      "title": "name of certification",
      "description": "generate a description of certification",
    }
  ],
  "activities": {
    "campusInvolvement": [],
    "areasOfInterest": []
  }
}

If you cannot find information, explain why in a 'parser_notes' field.
`;

      const userPrompt = `This is my resume: ${resume.resumeText}`;

      const res = await client.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      });

      const parsedData = res.choices[0].message.content;

      // Parse the JSON response
      let fieldJSON;
      try {
        if (parsedData === null) {
          fieldJSON = { parser_notes: "No data received from API" };
        } else {
          fieldJSON = JSON.parse(parsedData as string);
        }
      } catch (error) {
        console.error("Failed to parse JSON response:", error);
        fieldJSON = { parser_notes: "Failed to parse resume data" };
      }

      // Save the parsed data to the database
      await ctx.runMutation(internal.resume.updateResumeWithParsedData, {
        resumeId: args.resumeId,
        fieldJSON,
        status: "processed",
      });
    } catch (e) {
      console.error("Error processing resume:", e);

      // Update status to error
      await ctx.runMutation(internal.resume.updateResumeStatus, {
        resumeId: args.resumeId,
        status: "error",
      });
    }
  },
});

// Add this new mutation to update the resume with parsed data
export const updateResumeWithParsedData = internalMutation({
  args: {
    resumeId: v.id("resume"),
    fieldJSON: v.any(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.resumeId);
    if (!resume) {
      throw new ConvexError("Resume not found");
    }

    if (args.status === "processed") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", resume.clerkId))
        .unique();

      if (user) {
        await ctx.db.patch(user._id, { hasGeneratedPortfolio: true });
      }
    }
    await ctx.db.patch(args.resumeId, {
      fieldJSON: args.fieldJSON,
      status: args.status,
    });
  },
});

export const updateResumeStatus = internalMutation({
  args: {
    resumeId: v.id("resume"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const resume = await ctx.db.get(args.resumeId);
    if (!resume) {
      throw new ConvexError("Resume not found");
    }

    await ctx.db.patch(args.resumeId, {
      status: args.status,
    });
  },
});

export const getUserResumes = query({
  handler: async (ctx) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const userId = identity.subject;

    // Query resumes for this user
    const resumes = await ctx.db
      .query("resume")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .order("desc")
      .collect();

    return resumes;
  },
});

export const getResumeDownloadUrl = query({
  args: { fileId: v.string() },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Generate a download URL
    return await ctx.storage.getUrl(args.fileId);
  },
});

// Add these functions to your existing resume.ts file

// Delete a resume
export const deleteResume = mutation({
  args: { id: v.id("resume") },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }
    const userId = identity.subject;

    // Get the resume
    const resume = await ctx.db.get(args.id);
    if (!resume) {
      throw new ConvexError("Resume not found");
    }

    if (resume.clerkId !== userId) {
      throw new ConvexError("Unauthorized");
    }

    // Delete the file from storage
    await ctx.storage.delete(resume.fileId);

    // Delete the resume record
    await ctx.db.delete(args.id);
  },
});

// Generate a portfolio from a resume
export const getPreviewData = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Get the resume
    const resume = await ctx.db
      .query("resume")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .order("desc")
      .first();
    if (!resume) {
      throw new ConvexError("Resume not found");
    }

    if (!resume) {
      return null;
    }

    return resume.fieldJSON;
  },
});

// Generate a portfolio from a resume
export const getPublishData = query({
  args: { clerkId: v.string(), displayId: v.string() },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const user = await ctx.runQuery(internal.user.getUserByDisplayId, {
      displayId: args.displayId,
    });

    if (user.displayId !== args.displayId) {
      throw new ConvexError("Display ID does not exist or is incorrect");
    }

    // Get the resume
    const resume = await ctx.db
      .query("resume")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .order("desc")
      .first();
    if (!resume) {
      throw new ConvexError("Resume not found");
    }

    if (!resume) {
      return null;
    }
    return resume.fieldJSON;
  },
});
