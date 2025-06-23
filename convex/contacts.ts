import { query } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

type ContactUser = {
    id: Id<"users">;
    name: string;
    email: string | null;
    imageUrl: string | undefined;
    type: "user";
};

type ContactGroup = {
    id: Id<"groups">;
    name: string;
    description?: string;
    memberCount: number;
    type: "group";
};

type Contact = ContactUser | ContactGroup;

type ContactsResult = {
    users: ContactUser[];
    groups: ContactGroup[];
};

export const getContacts = query({
    args: {},
    handler: async (ctx): Promise<ContactsResult> => {
        const currentUser = await ctx.runQuery(api.users.getUser, {});

        // Get all users except the current user
        const allUsers = await ctx.db
            .query("users")
            .filter((q) => q.neq(q.field("_id"), currentUser._id))
            .collect();

        const contactUsers = allUsers.map((u) => ({
            id: u._id,
            name: u.name,
            email: u.email,
            imageUrl: u.imageUrl,
            type: "user" as const,
        }));

        // Get all groups
        const allGroups = await ctx.db.query("groups").collect();
        
        // Filter groups where the current user is a member
        const userGroups = allGroups
            .filter((group) => 
                group.members.some((member) => member.userId === currentUser._id)
            )
            .map((group) => ({
                id: group._id,
                name: group.name,
                description: group.description,
                memberCount: group.members.length,
                type: "group" as const,
            }));

        // Sort contacts alphabetically
        contactUsers.sort((a, b) => a.name.localeCompare(b.name));
        userGroups.sort((a, b) => a.name.localeCompare(b.name));

        return {
            users: contactUsers,
            groups: userGroups,
        };
    },
});

export const createGroup = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        members: v.array(v.id("users")),
    },
    handler: async (ctx, args): Promise<Id<"groups">> => {
        const currentUser = await ctx.runQuery(api.users.getUser, {});

        if(!args.name.trim() || args.members.length === 0) {
            throw new Error("Invalid group creation");
        }

        const uniqueMembers = new Set(args.members);

        uniqueMembers.add(currentUser._id);

        for(const memberId of uniqueMembers) {
            const member = await ctx.db.get(memberId);
            if(!member) {
                throw new Error("Invalid member");
            }
        }
        
        return ctx.db.insert("groups", {
            name: args.name.trim(),
            description: args.description?.trim() || undefined,
            createdBy: currentUser._id,
            members: [...uniqueMembers].map((userId) => ({
                userId: userId,
                role: userId === currentUser._id ? "admin" : "member",
                joinedAt: Date.now(),
            })),
        });
        
    },
});