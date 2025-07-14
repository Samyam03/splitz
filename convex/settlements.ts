import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

export const createSettlement = mutation({
  args: {
    amount: v.number(),
    note: v.optional(v.string()),
    paidByUserId: v.id("users"),
    receivedByUserId: v.id("users"),
    groupId: v.optional(v.id("groups")),
    relatedExpenseIds: v.optional(v.array(v.id("expenses"))),
  },
  handler: async (ctx, args): Promise<Id<"settlements">> => {
    const caller: Doc<"users"> | null = await ctx.runQuery(internal.users.getCurrentUser);

    if (!caller) {
        throw new Error("User not authenticated");
    }

    // Validate amount is positive
    if (args.amount <= 0) {
        throw new Error("Settlement amount must be positive");
    }

    if(args.paidByUserId === args.receivedByUserId) {
        throw new Error("You cannot settle with yourself");
    }

    // Validate users exist
    const paidByUser: Doc<"users"> | null = await ctx.db.get(args.paidByUserId);
    const receivedByUser: Doc<"users"> | null = await ctx.db.get(args.receivedByUserId);
    
    if (!paidByUser) {
        throw new Error("Payer user not found");
    }
    
    if (!receivedByUser) {
        throw new Error("Receiver user not found");
    }

    if(caller._id !== args.paidByUserId && caller._id !== args.receivedByUserId) {
        throw new Error("You are not authorized to settle this transaction as you are neither the payer nor the receiver");
    }

    if(args.groupId){
        const group: Doc<"groups"> | null = await ctx.db.get(args.groupId);
        if(!group) {
            throw new Error("Group not found");
        }

        const isMember = (userId: string) => group.members.some((m) => m.userId === userId);
        if(!isMember(args.paidByUserId) || !isMember(args.receivedByUserId)){
            throw new Error("You are not authorized to settle this transaction as both payer and receiver must be members of the group");
        }
    }

    return await ctx.db.insert("settlements", {
        amount: args.amount,
        note: args.note,
        date: Date.now(),
        paidByUserId: args.paidByUserId,
        receivedByUserId: args.receivedByUserId,
        groupId: args.groupId,
        relatedExpenseIds: args.relatedExpenseIds,
        createdBy: caller._id,
    })

    
  },
}); 

export const deleteSettlement = mutation({
    args: {
        settlementId: v.id("settlements"),
    },
    handler: async (ctx, { settlementId }): Promise<{ success: boolean }> => {
        const user: Doc<"users"> | null = await ctx.runQuery(internal.users.getCurrentUser);

        if (!user) {
            throw new Error("User not found or not authenticated");
        }

        const settlement: Doc<"settlements"> | null = await ctx.db.get(settlementId);

        if (!settlement) {
            throw new Error("Settlement not found");
        }

        // Only allow the payer or creator to delete the settlement
        if (settlement.createdBy !== user._id && settlement.paidByUserId !== user._id) {
            throw new Error("You are not authorized to delete this settlement");
        }

        await ctx.db.delete(settlementId);
        return { success: true }
    }
});

export const getSettlementData = query({
    args: {
        entityType: v.string(),
        entityid: v.union(v.id("users"), v.id("groups")),
    },
    handler: async (ctx, args): Promise<{
        type: "user";
        counterpart: {
            userId: Id<"users">;
            name: string | undefined;
            imageUrl: string | undefined;
            email: string | null | undefined;
        };
        youAreOwed: number;
        youOwe: number;
        netBalance: number;
    } | {
        type: "group";
        group: {
            id: Id<"groups">;
            name: string | undefined;
            description: string | undefined;
        };
        balances: {
            userId: string;
            name: string;
            imageUrl: string | undefined;
            email: string | null | undefined;
            youAreOwed: number;
            youOwe: number;
            netBalance: number;
        }[];
    }> => {
        const myData: Doc<"users"> | null = await ctx.runQuery(internal.users.getCurrentUser);
        
        if (!myData) {
            throw new Error("User not authenticated");
        }

        if(args.entityType === "user"){
            if (typeof args.entityid === 'string' && args.entityid.startsWith('users|')) {
                const otherUserId = args.entityid as Id<'users'>;
                const other: Doc<'users'> | null = await ctx.db.get(otherUserId);
                if(!other){
                    throw new Error("User not found");
                }

                const myExpenses: Doc<'expenses'>[] = await ctx.db.query("expenses").withIndex("by_user_and_group", (q)=> q.eq("paidByUserId", myData._id).eq("groupId", undefined)).collect();
                const otherExpenses: Doc<'expenses'>[] = await ctx.db.query("expenses").withIndex("by_user_and_group", (q)=> q.eq("paidByUserId", otherUserId).eq("groupId", undefined)).collect();
                
                const expenses: Doc<'expenses'>[] = [...myExpenses, ...otherExpenses];

                // Calculate net balance like in getExpensesBetweenUsers
                let balance = 0;

                for(const expense of expenses){
                    const involvesMe = expense.paidByUserId === myData._id || expense.splits.some((s)=> s.userId === myData._id);
                    const involvesThem = expense.paidByUserId === otherUserId || expense.splits.some((s)=> s.userId === otherUserId);

                    if(!involvesMe || !involvesThem) continue;
                     
                    if(expense.paidByUserId === myData._id){
                        const split = expense.splits.find((s)=> s.userId === otherUserId&&!s.paid);
                        if(split){
                            balance += split.amount;
                        }
                        
                    }
                    if(expense.paidByUserId === otherUserId){
                        const split = expense.splits.find((s)=> s.userId === myData._id&&!s.paid);
                        if(split){
                            balance -= split.amount;
                        }
                    }
                }

                // Get settlements between these two specific users only
                const settlements: Doc<'settlements'>[] = await ctx.db
                    .query("settlements")
                    .filter((q) =>
                        q.and(
                            q.eq(q.field("groupId"), undefined),
                            q.or(
                                q.and(
                                    q.eq(q.field("paidByUserId"), myData._id),
                                    q.eq(q.field("receivedByUserId"), otherUserId)
                                ),
                                q.and(
                                    q.eq(q.field("paidByUserId"), otherUserId),
                                    q.eq(q.field("receivedByUserId"), myData._id)
                                )
                            )
                        )
                    )
                    .collect();

                // Apply settlements the same way as getExpensesBetweenUsers
                for(const settlement of settlements){
                    if(settlement.paidByUserId === myData._id){
                        balance += settlement.amount;
                    } else {
                        balance -= settlement.amount;
                    }
                }

                // Convert balance to owed/owedTo format
                const owed = Math.max(0, balance);
                const owedTo = Math.max(0, -balance);

                return {
                    type: "user",
                    counterpart: {
                       userId: other._id,
                       name: other.name,
                       imageUrl: other.imageUrl,
                       email: other.email,
                    },
                    youAreOwed: owed,
                    youOwe: owedTo,
                    netBalance: balance,
                };
            } else {
                throw new Error("Invalid user ID");
            }
        } else if(args.entityType === "group"){
            const group: Doc<"groups"> | null = await ctx.db.get(args.entityid as Id<"groups">);
            if(!group){
                throw new Error("Group not found");
            }

            const isMember = (userId: string) => group.members.some((m: { userId: Id<"users">; role: string; joinedAt: number }) => m.userId === userId);
            
            if(!isMember(myData._id)){
                throw new Error("You are not authorized to settle this transaction as you are not a member of the group");
            }

            const expenses: Doc<"expenses">[] = await ctx.db.query("expenses").withIndex("by_group", (q) => q.eq("groupId", group._id)).collect();

            const balances: Record<string, { balance: number }> = {};

            group.members.forEach((member: { userId: Id<"users">; role: string; joinedAt: number }) => {
                balances[member.userId] = {balance: 0};
            });

            for(const expense of expenses){
                if(expense.paidByUserId === myData._id){
                    expense.splits.forEach((split: { userId: Id<"users">; amount: number; paid: boolean }) => {
                        if(split.userId !== myData._id && !split.paid){
                            if(balances[split.userId]){
                                balances[split.userId].balance += split.amount;
                            }
                        }
                    });
                }
                else if(balances[expense.paidByUserId]){
                    const split = expense.splits.find((s: { userId: Id<"users">; amount: number; paid: boolean }) => s.userId === myData._id && !s.paid);
                    if(split){
                        balances[expense.paidByUserId].balance -= split.amount;
                    }
                }
            }

            // Apply settlements correctly
            const settlements: Doc<"settlements">[] = await ctx.db.query("settlements")
                .withIndex("by_group", (q) => q.eq("groupId", group._id))
                .collect();

            for(const settlement of settlements){
                if(settlement.paidByUserId === myData._id && balances[settlement.receivedByUserId]){
                    balances[settlement.receivedByUserId].balance += settlement.amount;
                }
                if(settlement.receivedByUserId === myData._id && balances[settlement.paidByUserId]){
                    balances[settlement.paidByUserId].balance -= settlement.amount;
                }
            }

            const members: (Doc<"users"> | null)[] = await Promise.all(Object.keys(balances).map((id) => ctx.db.get(id as Id<"users">)));

            const list = Object.keys(balances).map((id) => {
                const member: Doc<"users"> | null = members.find((user): user is Doc<"users"> | null => !!user && user._id === id) || null;
                const balance = balances[id].balance;
                return {
                    userId: id,
                    name: member?.name || "",
                    imageUrl: member?.imageUrl,
                    email: member?.email,
                    youAreOwed: Math.max(0, balance),
                    youOwe: Math.max(0, -balance),
                    netBalance: balance,
                };
            });
            return {
                type: "group",
                group: {
                    id: group._id,
                    name: group.name,
                    description: group.description,
                },
                balances: list,
            };
            
        }
        
        throw new Error("Invalid entity type");
    }
});