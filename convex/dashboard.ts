import {internal} from "./_generated/api";
import {query} from "./_generated/server";

export const getUserBalances = query({
    handler: async (ctx) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser)

        if (!user) {
            return [];
        }

        const expenses = (await ctx.db.query("expenses").collect()).filter(
            (expense) =>  !expense.groupId && (expense.paidByUserId === user._id ||
                expense.splits.some((split) => split.userId === user._id)
            )
        )
        
        let youOwe = 0;
        let youAreOwed = 0;
        const balanceByUser: any = {}


        for (const expense of expenses) {
           const isPayer = expense.paidByUserId === user._id;
           const mySplit = expense.splits.find((split) => split.userId === user._id);

           if (isPayer) {
            for (const split of expense.splits) {
                if (split.userId !== user._id || split.paid) { 
                    continue;   
                }

               youAreOwed += split.amount;

                balanceByUser[split.userId] ??= {owed: 0, owedTo: 0};
                balanceByUser[split.userId].owed += split.amount;
                
        }
    }
    else if (mySplit && !mySplit.paid) {
        youOwe += mySplit.amount;

        balanceByUser[expense.paidByUserId] ??= {owed: 0, owedTo: 0};
        balanceByUser[expense.paidByUserId].owed += mySplit.amount;
    }
    }

    const settlements =(await ctx.db.query("settlements").collect()).filter(
        (settlement) => !settlement.groupId && (settlement.paidByUserId === user._id || settlement.receivedByUserId=== user._id)
    )

    for (const settlement of settlements) {
        if (settlement.paidByUserId === user._id) {
            youOwe -= settlement.amount;
            balanceByUser[settlement.receivedByUserId] ??= {owed: 0, owedTo: 0};
            balanceByUser[settlement.receivedByUserId].owedTo += settlement.amount;
        }
        else if (settlement.receivedByUserId === user._id) {
            youAreOwed -= settlement.amount;
            balanceByUser[settlement.paidByUserId] ??= {owed: 0, owedTo: 0};
            balanceByUser[settlement.paidByUserId].owed += settlement.amount;
        }
    }

    const youOweList: any[] = []
    const youAreOwedList: any[] = []

    for (const [uid, balance] of Object.entries(balanceByUser)) {
        const {owed, owedTo} = balance as {owed: number, owedTo: number};
        const net = owed - owedTo;
        if (net === 0) {
            continue;
        }

       const counterpart = await ctx.db.get(uid as any)
       const base = {
        userId: uid,
        name: (counterpart as any)?.name,
        imageUrl: (counterpart as any)?.imageUrl,
        amount: Math.abs(net),
       }

       if (net > 0) {
        youOweList.push(base)
       } else {
        youAreOwedList.push(base)
       }
    }

    youOweList.sort((a, b) => b.amount - a.amount)
    youAreOwedList.sort((a, b) => b.amount - a.amount)


    return {
        youOwe,
        youAreOwed,
        totalBalance: youAreOwed - youOwe,
        oweDetails:{youOwe: youOweList, youAreOwed: youAreOwedList}
    }
    }
})

export const getTotalSpent = query({
    handler: async (ctx) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser)

        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear,0,1).getTime();

        const expenses = await ctx.db.query("expenses").withIndex("by_date", (q) => q.gte("date", startOfYear)).collect();


        const userExpenses = expenses.filter((expense) => expense.paidByUserId === user?._id || expense.splits.some((split) => split.userId === user?._id));
        
        let totalSpent = 0;

        userExpenses.forEach((expense) => {
            const userSplit = expense.splits.find((split) => split.userId === user?._id);
            if (userSplit) {
                totalSpent += userSplit.amount;
            }
        })

        return totalSpent;
    }
})

export const getTotalSpentByMonth = query({
    handler: async (ctx) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser)

        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear,0,1).getTime();
        
        const allExpenses = await ctx.db.query("expenses").withIndex("by_date", (q) => q.gte("date", startOfYear)).collect();

        const userExpenses = allExpenses.filter((expense) => expense.paidByUserId === user?._id || expense.splits.some((split) => split.userId === user?._id));
        
        const monthlyTotals: any = {}

        for(let i = 0; i < 12; i++) {
            const monthDate = new Date(currentYear, i, 1);
            monthlyTotals[monthDate.getTime()] = 0;
        }

        userExpenses.forEach((expense) => {
            const monthDate = new Date(expense.date);
          
            const monthStart = new Date(
                monthDate.getFullYear(),
                monthDate.getMonth(),
                1
            ).getTime();

            const userSplit = expense.splits.find((split) => split.userId === user?._id);

            if (userSplit) {
                monthlyTotals[monthStart] = (monthlyTotals[monthStart] || 0) + userSplit.amount;
            }

            
        })

        const result = Object.entries(monthlyTotals).map(([month,total]) => ({
            month: parseInt(month),
            total,
        }))

        result.sort((a, b) => a.month - b.month);

        return result;
        
   
    }
})

export const getMonthlySpending = query({
    handler: async (ctx) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser)

        const allGroups = await ctx.db.query("groups").collect();

        const groups = allGroups.filter((group) => group.members.some((member) => member.userId === user?._id));

        const enhancedGroups: any = await Promise.all(
            groups.map(async (group): Promise<any> => {
                const expenses = await ctx.db
                .query("expenses")
                .withIndex("by_group", (q) => q.eq("groupId", group._id))
                .collect();
                
                let balance = 0;

                expenses.forEach((expense) => {
                   if (expense.paidByUserId === user?._id) {
                    expense.splits.forEach((split) => {
                        if (split.userId !== user?._id && !split.paid) {
                            balance += split.amount;
                        }
                    })
                   }
                   else {
                    const userSplit = expense.splits.find((split) => split.userId === user?._id);
                    if (userSplit && !userSplit.paid) {
                        balance -= userSplit.amount;
                    }
                   }
                });
                
                
                const settlements = (await ctx.db.query("settlements").collect())
                .filter((settlement) => settlement.groupId === group._id && (settlement.paidByUserId === user?._id || settlement.receivedByUserId === user?._id));
            
                settlements.forEach((settlement) => {
                    if (settlement.paidByUserId === user?._id) {
                        balance += settlement.amount;
                    }
                    else if (settlement.receivedByUserId === user?._id) {
                        balance -= settlement.amount;
                    }
                })

                return{
                    ...group,
                    id: group._id,
                    balance,
                    
                };
            })
        )
        
        return enhancedGroups;
    }
})