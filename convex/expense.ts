import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

export const getExpensesBetweenUsers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }): Promise<{
    expenses: Doc<"expenses">[];
    settlements: Doc<"settlements">[];
    otherUser: {
      id: Id<"users">;
      name: string;
      email: string | null;
      imageUrl?: string;
    };
    balance: number;
  }> => {
    const me: Doc<"users"> | null = await ctx.runQuery(internal.users.getCurrentUser);
    if (!me) {
      throw new Error("User not found or not authenticated");
    }
    if (me._id === userId) {
      throw new Error("You cannot get expenses for yourself");
    }

    const iPaid: Doc<"expenses">[] = await ctx.db
      .query("expenses")
      .withIndex("by_user_and_group", (q) =>
        q.eq("paidByUserId", me._id).eq("groupId", undefined)
      )
      .collect();
    const otherPaid: Doc<"expenses">[] = await ctx.db
      .query("expenses")
      .withIndex("by_user_and_group", (q) =>
        q.eq("paidByUserId", userId).eq("groupId", undefined)
      )
      .collect();

    const involvedExpenses: Doc<"expenses">[] = [...iPaid, ...otherPaid];

    const expenses: Doc<"expenses">[] = involvedExpenses.filter((expense: Doc<"expenses">) => {
      const meInsplits = expense.splits.some(
        (split) => split.userId === me._id
      );
      const otherInsplits = expense.splits.some(
        (split) => split.userId === userId
      );

      const meInvolved = expense.paidByUserId === me._id || meInsplits;
      const otherInvolved = expense.paidByUserId === userId || otherInsplits;

      return meInvolved && otherInvolved;
    });
    expenses.sort((a: Doc<"expenses">, b: Doc<"expenses">) => b.date - a.date);

    const settlements: Doc<"settlements">[] = await ctx.db
      .query("settlements")
      .filter((q) =>
        q.and(
          q.eq(q.field("groupId"), undefined),
          q.or(
            q.and(
              q.eq(q.field("paidByUserId"), me._id),
              q.eq(q.field("receivedByUserId"), userId)
            ),
            q.and(
              q.eq(q.field("paidByUserId"), userId),
              q.eq(q.field("receivedByUserId"), me._id)
            )
          )
        )
      )
      .collect();
      
    settlements.sort((a: Doc<"settlements">, b: Doc<"settlements">) => b.date - a.date);

    let balance = 0;
    for (const expense of expenses){
        if(expense.paidByUserId === me._id){
           const split = expense.splits.find((split) => split.userId === userId && !split.paid);
           if(split){
            balance += split.amount;
           }
        }else{
            const split = expense.splits.find((split) => split.userId === me._id && !split.paid);
            if(split){
             balance -= split.amount;
            }
        }
    }
    for (const settlement of settlements){
        if(settlement.paidByUserId === me._id){
            balance += settlement.amount;
        }else{
            balance -= settlement.amount;
        }
    }

    const other: Doc<"users"> | null = await ctx.db.get(userId);
    if(!other){
        throw new Error("User not found");
    }

    return {
        expenses,
        settlements,
        otherUser:{
            id: other._id,
            name: other.name,
            email: other.email,
            imageUrl: other.imageUrl,
        },
        balance,
    }
  }
});

export const deleteExpense = mutation({
    args: {
        expenseId: v.id("expenses"),
    },
    handler: async (ctx, { expenseId }) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser);

        if (!user) {
            throw new Error("User not found or not authenticated");
        }

        const expense = await ctx.db.get(expenseId);

        if(!expense){
            throw new Error("Expense not found");
        }

        if(expense.createdBy!== user._id && expense.paidByUserId !== user._id){
            throw new Error("You are not the payer of this expense so you cannot delete it");
        }

        await ctx.db.delete(expenseId);
        return {success:true}
    }
})