import { v } from "convex/values";
import { query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const getGroupExpenses = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, { groupId }) => {
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser);

    const group = await ctx.db.get(groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    if (!group.members.some((member) => member.userId === currentUser?._id)) {
      throw new Error("You are not a member of this group");
    }

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect();

    const settlements = await ctx.db
      .query("settlements")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect();

    const memberDetails = await Promise.all(
      group.members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          id: member.userId,
          name: user?.name,
          imageUrl: user?.imageUrl,
          role: member.role,
        };
      })
    );

    const ids = memberDetails.map((member) => member.id);

    const totals = Object.fromEntries(ids.map((id) => [id, 0]));

    const ledger: Record<string, Record<string, number>> = {};

    ids.forEach((a) => {
      ledger[a] = {};
      ids.forEach((b) => {
        if (a != b) {
          ledger[a][b] = 0;
        }
      });
    });

    //This is for the splitting among the groups

    for (const expense of expenses) {
      const payer = expense.paidByUserId;

      for (const split of expense.splits) {
        if (split.userId === payer || split.paid) {
          continue;
        }

        const debtor = split.userId;
        const amount = split.amount;

        totals[payer] += amount;
        totals[debtor] -= amount;

        ledger[debtor][payer] += amount;
      }
    }

    //settlements among the groups
    for (const settlement of settlements) {
      totals[settlement.paidByUserId] += settlement.amount;
      totals[settlement.receivedByUserId] -= settlement.amount;

      ledger[settlement.paidByUserId][settlement.receivedByUserId] -=
        settlement.amount;
    }

    //if a has to pay b, and b has to pay a, we do not want two different entries we want to merge them into one

    ids.forEach(a=>{
      ids.forEach(b=>{
         if(a >=b){
          return;
         }

         const diff = ledger[a][b] -ledger[b][a];

         if(diff>0){
          ledger[a][b] = diff;
          ledger[b][a] = 0;
         }
         else if(diff<0){
           ledger[b][a] = -diff;
           ledger[a][b] = 0;
         }
         else{
          ledger[a][b] = 0;
          ledger[b][a] = 0;
         }
      })
    })

    const balances = memberDetails.map((member) => ({
      ...member,
      totalBalance: totals[member.id],
      owes: Object.entries(ledger[member.id])
        .filter(([, value]) => value > 0)
        .map(([to, amount]) => ({ to, amount })),
      owedBy: ids
        .filter((other) => ledger[other][member.id] > 0)
        .map((other) => ({ from: other, amount: ledger[other][member.id] })),
    }));

         const userLookUpMap: Record<string, {
            id: Id<"users">;
            name?: string;
            imageUrl?: string;
            role: string;
         }> = {};

     memberDetails.forEach((member)=>{
         userLookUpMap[member.id] = member;
     })

     return{
        group:{
            id: group._id,
            name: group.name,
            description: group.description,
        },
        members:memberDetails,
        expenses,
        settlements,
        balances,
        userLookUpMap,
     }
  },
});

export const getGroupOrMembers = query({
  args: {
    groupId: v.optional(v.id("groups")),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser);

    const allGroups = await ctx.db.query("groups").collect();
    const userGroups = allGroups.filter((group: any) => 
      group.members.some((member: any) => member.userId === currentUser?._id)
    );
  
    if (args.groupId) {
      const selectedGroup = userGroups.find(
        (group: any) => group._id === args.groupId
      );
      
      if (!selectedGroup) {
        throw new Error("Group not found");
      }
    
      const memberDetails = await Promise.all(
        selectedGroup.members.map(async (member: { userId: Id<"users">; role: string; joinedAt: number }) => {
          const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("_id"), member.userId))
            .first();

          if (!user) {
            return null;
          }

          return {
            id: member.userId,
            name: user.name,
            imageUrl: user.imageUrl,
            role: member.role,
          };
        })
      );

      const validMembers = memberDetails.filter(
        (member): member is {
          id: Id<"users">;
          name: string;
          imageUrl: string | undefined;
          role: string;
        } => member !== null
      );
   
      return {
        selectedGroup: {
          id: selectedGroup._id,
          name: selectedGroup.name,
          description: selectedGroup.description,
          createdBy: selectedGroup.createdBy,
          members: validMembers,
        },
        groups: userGroups.map((group: any) => ({
          id: group._id,
          name: group.name,
          description: group.description,
          memberCount: group.members.length,
        })),
      };
    } else {
      return {
        selectedGroup: null,
        groups: userGroups.map((group: any) => ({
          id: group._id,
          name: group.name,
          description: group.description,
          memberCount: group.members.length,
        })),
      };
    }
  },
});