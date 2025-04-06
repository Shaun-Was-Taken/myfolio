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
  "description": "generate a short summary of what is generated in about feild",
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
      "projectPicture": "can be null",
      "description": "generate project description, highlight important words between ****",
      "period": "can be null",
      "tags": ["generate tags according to the current project, generate at max 5"],
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

// Update specific fields in the resume JSON
export const updateResumeField = mutation({
  args: {
    field: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }
    const userId = identity.subject;

    // Get the most recent resume for this user
    const resume = await ctx.db
      .query("resume")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .order("desc")
      .first();
    
    if (!resume) {
      throw new ConvexError("Resume not found");
    }

    // Create a deep copy of the fieldJSON
    const updatedFieldJSON = { ...resume.fieldJSON };

    // Handle nested fields with dot notation (e.g., "contact.email")
    if (args.field.includes(".")) {
      const fieldParts = args.field.split(".");
      let current = updatedFieldJSON;
      
      // Navigate to the nested object
      for (let i = 0; i < fieldParts.length - 1; i++) {
        const part = fieldParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      // Set the value in the nested object
      current[fieldParts[fieldParts.length - 1]] = args.value;
    } else {
      // Set the field directly in the object
      updatedFieldJSON[args.field] = args.value;
    }

    // Update the resume with the modified fieldJSON
    await ctx.db.patch(resume._id, {
      fieldJSON: updatedFieldJSON,
    });

    return updatedFieldJSON;
  },
});

// Generate upload URL for images (profile, school logos, etc.)
export const generateImageUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

// Function to update profile picture after upload
export const updateProfilePictureUrl = mutation({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }
    const userId = identity.subject;

    // Get the most recent resume for this user
    const resume = await ctx.db
      .query("resume")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .order("desc")
      .first();
    
    if (!resume) {
      throw new ConvexError("Resume not found");
    }

    try {
      // Verify the file exists in storage
      const exists = (await ctx.storage.getUrl(args.storageId)) !== null;
      if (!exists) {
        throw new ConvexError("File not found in storage");
      }
      
      // Get the URL for the stored image
      const imageUrl = await ctx.storage.getUrl(args.storageId);
      
      // Create a deep copy of the fieldJSON
      const updatedFieldJSON = { ...resume.fieldJSON };
      
      // Update the profilePicture field
      updatedFieldJSON.profilePicture = imageUrl;

      // Update the resume with the modified fieldJSON
      await ctx.db.patch(resume._id, {
        fieldJSON: updatedFieldJSON,
      });

      return { profilePicture: imageUrl };
    } catch (error) {
      console.error("Error updating profile picture:", error);
      throw new ConvexError("Failed to update profile picture");
    }
  },
});

// Function to update school logo
export const updateSchoolLogo = mutation({
  args: {
    storageId: v.string(),
    educationIndex: v.number(),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }
    const userId = identity.subject;

    // Get the most recent resume for this user
    const resume = await ctx.db
      .query("resume")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .order("desc")
      .first();
    
    if (!resume) {
      throw new ConvexError("Resume not found");
    }

    try {
      // Verify the file exists in storage
      const exists = (await ctx.storage.getUrl(args.storageId)) !== null;
      if (!exists) {
        throw new ConvexError("File not found in storage");
      }
      
      // Get the URL for the stored image
      const imageUrl = await ctx.storage.getUrl(args.storageId);
      
      // Create a deep copy of the fieldJSON
      const updatedFieldJSON = { ...resume.fieldJSON };
      
      // Make sure education field exists and is an array
      if (!updatedFieldJSON.education || !Array.isArray(updatedFieldJSON.education)) {
        throw new ConvexError("Education field not found or is not an array");
      }
      
      // Make sure the educationIndex is valid
      if (args.educationIndex < 0 || args.educationIndex >= updatedFieldJSON.education.length) {
        throw new ConvexError("Invalid education index");
      }
      
      // Update the logo field for the specified education item
      updatedFieldJSON.education[args.educationIndex].logo = imageUrl;

      // Update the resume with the modified fieldJSON
      await ctx.db.patch(resume._id, {
        fieldJSON: updatedFieldJSON,
      });

      return { 
        success: true,
        educationIndex: args.educationIndex,
        logoUrl: imageUrl 
      };
    } catch (error) {
      console.error("Error updating school logo:", error);
      throw new ConvexError("Failed to update school logo");
    }
  },
});

// Function to update project links
export const updateProjectLinks = mutation({
  args: {
    projectIndex: v.number(),
    githubLink: v.optional(v.union(v.string(), v.null())),
    liveLink: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }
    const userId = identity.subject;

    // Get the most recent resume for this user
    const resume = await ctx.db
      .query("resume")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .order("desc")
      .first();
    
    if (!resume) {
      throw new ConvexError("Resume not found");
    }

    try {
      // Create a deep copy of the fieldJSON
      const updatedFieldJSON = { ...resume.fieldJSON };
      
      // Make sure projects field exists and is an array
      if (!updatedFieldJSON.projects || !Array.isArray(updatedFieldJSON.projects)) {
        throw new ConvexError("Projects field not found or is not an array");
      }
      
      // Make sure the projectIndex is valid
      if (args.projectIndex < 0 || args.projectIndex >= updatedFieldJSON.projects.length) {
        throw new ConvexError("Invalid project index");
      }
      
      // Update the link fields if provided
      if (args.githubLink !== undefined) {
        updatedFieldJSON.projects[args.projectIndex].githubLink = args.githubLink;
      }
      
      if (args.liveLink !== undefined) {
        updatedFieldJSON.projects[args.projectIndex].liveLink = args.liveLink;
      }

      // Update the resume with the modified fieldJSON
      await ctx.db.patch(resume._id, {
        fieldJSON: updatedFieldJSON,
      });

      return { 
        success: true,
        projectIndex: args.projectIndex,
        githubLink: updatedFieldJSON.projects[args.projectIndex].githubLink,
        liveLink: updatedFieldJSON.projects[args.projectIndex].liveLink
      };
    } catch (error) {
      console.error("Error updating project links:", error);
      throw new ConvexError("Failed to update project links");
    }
  },
});

// Function to update project image
export const updateProjectImage = mutation({
  args: {
    storageId: v.string(),
    projectIndex: v.number(),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }
    const userId = identity.subject;

    // Get the most recent resume for this user
    const resume = await ctx.db
      .query("resume")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .order("desc")
      .first();
    
    if (!resume) {
      throw new ConvexError("Resume not found");
    }

    try {
      // Verify the file exists in storage
      const exists = (await ctx.storage.getUrl(args.storageId)) !== null;
      if (!exists) {
        throw new ConvexError("File not found in storage");
      }
      
      // Get the URL for the stored image
      const imageUrl = await ctx.storage.getUrl(args.storageId);
      
      // Create a deep copy of the fieldJSON
      const updatedFieldJSON = { ...resume.fieldJSON };
      
      // Make sure projects field exists and is an array
      if (!updatedFieldJSON.projects || !Array.isArray(updatedFieldJSON.projects)) {
        throw new ConvexError("Projects field not found or is not an array");
      }
      
      // Make sure the projectIndex is valid
      if (args.projectIndex < 0 || args.projectIndex >= updatedFieldJSON.projects.length) {
        throw new ConvexError("Invalid project index");
      }
      
      // Update the projectPicture field for the specified project item
      updatedFieldJSON.projects[args.projectIndex].projectPicture = imageUrl;

      // Update the resume with the modified fieldJSON
      await ctx.db.patch(resume._id, {
        fieldJSON: updatedFieldJSON,
      });

      return { 
        success: true,
        projectIndex: args.projectIndex,
        imageUrl: imageUrl 
      };
    } catch (error) {
      console.error("Error updating project image:", error);
      throw new ConvexError("Failed to update project image");
    }
  },
});

// Function to update company logo
export const updateCompanyLogo = mutation({
  args: {
    storageId: v.string(),
    experienceIndex: v.number(),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }
    const userId = identity.subject;

    // Get the most recent resume for this user
    const resume = await ctx.db
      .query("resume")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", userId))
      .order("desc")
      .first();
    
    if (!resume) {
      throw new ConvexError("Resume not found");
    }

    try {
      // Verify the file exists in storage
      const exists = (await ctx.storage.getUrl(args.storageId)) !== null;
      if (!exists) {
        throw new ConvexError("File not found in storage");
      }
      
      // Get the URL for the stored image
      const imageUrl = await ctx.storage.getUrl(args.storageId);
      
      // Create a deep copy of the fieldJSON
      const updatedFieldJSON = { ...resume.fieldJSON };
      
      // Make sure experience field exists and is an array
      if (!updatedFieldJSON.experience || !Array.isArray(updatedFieldJSON.experience)) {
        throw new ConvexError("Experience field not found or is not an array");
      }
      
      // Make sure the experienceIndex is valid
      if (args.experienceIndex < 0 || args.experienceIndex >= updatedFieldJSON.experience.length) {
        throw new ConvexError("Invalid experience index");
      }
      
      // Update the companyLogo field for the specified experience item
      updatedFieldJSON.experience[args.experienceIndex].companyLogo = imageUrl;

      // Update the resume with the modified fieldJSON
      await ctx.db.patch(resume._id, {
        fieldJSON: updatedFieldJSON,
      });

      return { 
        success: true,
        experienceIndex: args.experienceIndex,
        logoUrl: imageUrl 
      };
    } catch (error) {
      console.error("Error updating company logo:", error);
      throw new ConvexError("Failed to update company logo");
    }
  },
});

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
  args: { displayId: v.string() },
  handler: async (ctx, args): Promise<any> => {
    // Get the authenticated user

    const user = await ctx.runQuery(internal.user.getUserByDisplayId, {
      displayId: args.displayId,
    });

    if (user.displayId !== args.displayId) {
      throw new ConvexError("Display ID does not exist or is incorrect");
    }

    // Get the resume
    const resume = await ctx.db
      .query("resume")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", user.clerkId))
      .order("desc")
      .first();
    if (!resume) {
      throw new ConvexError("Resume not found");
    }

    // This check is redundant since we already check above
    // if (!resume) {
    //   return null;
    // }
    return resume.fieldJSON;
  },
});
