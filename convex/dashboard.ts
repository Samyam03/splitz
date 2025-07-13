import { internal } from "./_generated/api";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

interface UserBalance {
    owed: number;
    owedTo: number;
}

interface BalanceDetails {
    userId: string;
    name: string;
    imageUrl?: string;
    amount: number;
}

interface GroupWithBalance {
    _id: Id<"groups">;
    name: string;
    description?: string;
    createdBy: Id<"users">;
    members: Array<{
        userId: Id<"users">;
        role: string;
        joinedAt: number;
    }>;
    id: Id<"groups">;
    balance: number;
}

interface MemberBalance {
    userId: Id<"users">;
    name: string;
    imageUrl?: string;
    balance: number;
    role: string;
}

export const getUserBalances = query({
    handler: async (ctx) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser)

        if (!user) {
            return {
                youOwe: 0,
                youAreOwed: 0,
                totalBalance: 0,
                oweDetails: { youOwe: [], youAreOwed: [] }
            };
        }

        // Get all non-group expenses involving the user
        const expenses = (await ctx.db.query("expenses").collect()).filter(
            (expense) => !expense.groupId && (expense.paidByUserId === user._id ||
                expense.splits.some((split) => split.userId === user._id)
            )
        )

        // Get all non-group settlements involving the user
        const settlements = (await ctx.db.query("settlements").collect()).filter(
            (settlement) => !settlement.groupId && (settlement.paidByUserId === user._id || settlement.receivedByUserId === user._id)
        )

        // Calculate individual balances with each user (like getExpensesBetweenUsers)
        const balanceByUser: Record<string, number> = {}

        // Process expenses
        for (const expense of expenses) {
            const otherUserIds = new Set<string>()
            
            // Find all other users involved in this expense
            if (expense.paidByUserId !== user._id) {
                otherUserIds.add(expense.paidByUserId)
            }
            expense.splits.forEach(split => {
                if (split.userId !== user._id) {
                    otherUserIds.add(split.userId)
                }
            })

            // Calculate balance with each other user for this expense
            for (const otherUserId of otherUserIds) {
                balanceByUser[otherUserId] ??= 0

                if (expense.paidByUserId === user._id) {
                    // I paid, they owe me
                    const split = expense.splits.find(s => s.userId === otherUserId && !s.paid)
                    if (split) {
                        balanceByUser[otherUserId] += split.amount
                    }
                } else if (expense.paidByUserId === otherUserId) {
                    // They paid, I owe them
                    const split = expense.splits.find(s => s.userId === user._id && !s.paid)
                    if (split) {
                        balanceByUser[otherUserId] -= split.amount
                    }
                }
            }
        }

        // Process settlements
        for (const settlement of settlements) {
            if (settlement.paidByUserId === user._id) {
                // I paid them
                balanceByUser[settlement.receivedByUserId] ??= 0
                balanceByUser[settlement.receivedByUserId] += settlement.amount
            } else {
                // They paid me
                balanceByUser[settlement.paidByUserId] ??= 0
                balanceByUser[settlement.paidByUserId] -= settlement.amount
            }
        }

        // Calculate totals and lists
        let youOwe = 0
        let youAreOwed = 0
        const youOweList: BalanceDetails[] = []
        const youAreOwedList: BalanceDetails[] = []

        for (const [uid, balance] of Object.entries(balanceByUser)) {
            if (balance === 0) continue

            const counterpart = await ctx.db.get(uid as Id<"users">)
            const base = {
                userId: uid,
                name: counterpart?.name || "",
                imageUrl: counterpart?.imageUrl,
                amount: Math.abs(balance),
            }

            if (balance > 0) {
                youAreOwed += balance
                youAreOwedList.push(base)
            } else {
                youOwe += Math.abs(balance)
                youOweList.push(base)
            }
        }

        youOweList.sort((a, b) => b.amount - a.amount)
        youAreOwedList.sort((a, b) => b.amount - a.amount)

        return {
            youOwe,
            youAreOwed,
            totalBalance: youAreOwed - youOwe,
            oweDetails: { youOwe: youOweList, youAreOwed: youAreOwedList }
        }
    }
})

export const getTotalSpent = query({
    handler: async (ctx) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser)

        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).getTime();

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
        const startOfYear = new Date(currentYear, 0, 1).getTime();

        const allExpenses = await ctx.db.query("expenses").withIndex("by_date", (q) => q.gte("date", startOfYear)).collect();

        const userExpenses = allExpenses.filter((expense) => expense.paidByUserId === user?._id || expense.splits.some((split) => split.userId === user?._id));

        const monthlyTotals: Record<number, number> = {}

        for (let i = 0; i < 12; i++) {
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

        const result = Object.entries(monthlyTotals).map(([month, total]) => ({
            month: parseInt(month),
            total,
        }))

        result.sort((a, b) => a.month - b.month);

        return result;


    }
})

export const getUserGroups = query({
    handler: async (ctx) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser)

        const allGroups = await ctx.db.query("groups").collect();

        const groups = allGroups.filter((group) => group.members.some((member) => member.userId === user?._id));

        const enhancedGroups: GroupWithBalance[] = await Promise.all(
            groups.map(async (group): Promise<GroupWithBalance> => {
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

                return {
                    ...group,
                    id: group._id,
                    balance,

                };
            })
        )

        return enhancedGroups;
    }
})

export const getMemberBalances = query({
    handler: async (ctx) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser)

        if (!user) {
            return [];
        }

        const allGroups = await ctx.db.query("groups").collect();
        const userGroups = allGroups.filter((group) => 
            group.members.some((member) => member.userId === user._id)
        );

        const memberBalancesMap: Record<string, MemberBalance> = {};

        for (const group of userGroups) {
            const expenses = await ctx.db
                .query("expenses")
                .withIndex("by_group", (q) => q.eq("groupId", group._id))
                .collect();

            // Calculate balance for each member in this group
            for (const member of group.members) {
                if (member.userId === user._id) continue; // Skip current user

                let balance = 0;

                expenses.forEach((expense) => {
                    if (expense.paidByUserId === user._id) {
                        // I paid, they owe me
                        const split = expense.splits.find((split) => 
                            split.userId === member.userId && !split.paid
                        );
                        if (split) {
                            balance += split.amount;
                        }
                    } else if (expense.paidByUserId === member.userId) {
                        // They paid, I owe them
                        const userSplit = expense.splits.find((split) => 
                            split.userId === user._id && !split.paid
                        );
                        if (userSplit) {
                            balance -= userSplit.amount;
                        }
                    }
                });

                // Process settlements for this group
                const settlements = (await ctx.db.query("settlements").collect())
                    .filter((settlement) => 
                        settlement.groupId === group._id && 
                        ((settlement.paidByUserId === user._id && settlement.receivedByUserId === member.userId) ||
                         (settlement.paidByUserId === member.userId && settlement.receivedByUserId === user._id))
                    );

                settlements.forEach((settlement) => {
                    if (settlement.paidByUserId === user._id) {
                        balance += settlement.amount;
                    } else {
                        balance -= settlement.amount;
                    }
                });

                // Aggregate balance for this user across all groups
                if (memberBalancesMap[member.userId]) {
                    memberBalancesMap[member.userId].balance += balance;
                } else {
                    const memberUser = await ctx.db.get(member.userId);
                    memberBalancesMap[member.userId] = {
                        userId: member.userId,
                        name: memberUser?.name || "Unknown User",
                        imageUrl: memberUser?.imageUrl,
                        balance,
                        role: member.role
                    };
                }
            }
        }

        // Convert map to array and filter out zero balances
        const memberBalances = Object.values(memberBalancesMap)
            .filter(member => member.balance !== 0)
            .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));

        return memberBalances;
    }
})

export const getIndividualExpenses = query({
    handler: async (ctx) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser)

        if (!user) {
            return [];
        }

        // Get all non-group expenses involving the user
        const expenses = (await ctx.db.query("expenses").collect()).filter(
            (expense) => !expense.groupId && (expense.paidByUserId === user._id ||
                expense.splits.some((split) => split.userId === user._id)
            )
        );

        const individualExpenses: Array<{
            id: string;
            description: string;
            amount: number;
            date: number;
            paidBy: string;
            yourShare: number;
            status: 'paid' | 'unpaid';
        }> = [];

        for (const expense of expenses) {
            const paidByUser = await ctx.db.get(expense.paidByUserId);
            const userSplit = expense.splits.find(split => split.userId === user._id);
            
            if (userSplit) {
                individualExpenses.push({
                    id: expense._id,
                    description: expense.description,
                    amount: expense.amount,
                    date: expense.date,
                    paidBy: paidByUser?.name || "Unknown User",
                    yourShare: userSplit.amount,
                    status: userSplit.paid ? 'paid' : 'unpaid'
                });
            }
        }

        // Sort by date (newest first)
        individualExpenses.sort((a, b) => b.date - a.date);

        return individualExpenses;
    }
})

export const getAdvancedExpenseBreakdown = query({
    handler: async (ctx) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser)

        if (!user) {
            return {
                youOwe: 0,
                youAreOwed: 0,
                totalBalance: 0,
                oweDetails: { youOwe: [], youAreOwed: [] },
                grossYouOwe: 0,
                grossYouAreOwed: 0,
            };
        }

        // Get all expenses involving the user (both individual and group)
        const allExpenses = await ctx.db.query("expenses").collect();
        const userExpenses = allExpenses.filter(
            (expense) => expense.paidByUserId === user._id ||
                expense.splits.some((split) => split.userId === user._id)
        );

        // Get all settlements involving the user (both individual and group)
        const allSettlements = await ctx.db.query("settlements").collect();
        const userSettlements = allSettlements.filter(
            (settlement) => settlement.paidByUserId === user._id || settlement.receivedByUserId === user._id
        );

        // Calculate individual balances with each user
        const balanceByUser: Record<string, number> = {};
        // For gross calculation
        let grossYouOwe = 0;
        let grossYouAreOwed = 0;

        // Process expenses
        for (const expense of userExpenses) {
            const otherUserIds = new Set<string>()
            
            // Find all other users involved in this expense
            if (expense.paidByUserId !== user._id) {
                otherUserIds.add(expense.paidByUserId)
            }
            expense.splits.forEach(split => {
                if (split.userId !== user._id) {
                    otherUserIds.add(split.userId)
                }
            })

            // Calculate balance with each other user for this expense
            for (const otherUserId of otherUserIds) {
                balanceByUser[otherUserId] ??= 0

                if (expense.paidByUserId === user._id) {
                    // I paid, they owe me
                    const split = expense.splits.find(s => s.userId === otherUserId && !s.paid)
                    if (split) {
                        balanceByUser[otherUserId] += split.amount
                        grossYouAreOwed += split.amount // Add to gross
                    }
                } else if (expense.paidByUserId === otherUserId) {
                    // They paid, I owe them
                    const split = expense.splits.find(s => s.userId === user._id && !s.paid)
                    if (split) {
                        balanceByUser[otherUserId] -= split.amount
                        grossYouOwe += split.amount // Add to gross
                    }
                }
            }
        }

        // Process settlements
        for (const settlement of userSettlements) {
            if (settlement.paidByUserId === user._id) {
                // I paid them
                balanceByUser[settlement.receivedByUserId] ??= 0
                balanceByUser[settlement.receivedByUserId] += settlement.amount
                grossYouAreOwed += settlement.amount // Add to gross
            } else {
                // They paid me
                balanceByUser[settlement.paidByUserId] ??= 0
                balanceByUser[settlement.paidByUserId] -= settlement.amount
                grossYouOwe += settlement.amount // Add to gross
            }
        }

        // Calculate totals and lists
        let youOwe = 0
        let youAreOwed = 0
        const youOweList: BalanceDetails[] = []
        const youAreOwedList: BalanceDetails[] = []

        for (const [uid, balance] of Object.entries(balanceByUser)) {
            if (balance === 0) continue

            const counterpart = await ctx.db.get(uid as Id<"users">)
            const base = {
                userId: uid,
                name: counterpart?.name || "",
                imageUrl: counterpart?.imageUrl,
                amount: Math.abs(balance),
            }

            if (balance > 0) {
                youAreOwed += balance
                youAreOwedList.push(base)
            } else {
                youOwe += Math.abs(balance)
                youOweList.push(base)
            }
        }

        youOweList.sort((a, b) => b.amount - a.amount)
        youAreOwedList.sort((a, b) => b.amount - a.amount)

        return {
            youOwe,
            youAreOwed,
            totalBalance: youAreOwed - youOwe,
            oweDetails: { youOwe: youOweList, youAreOwed: youAreOwedList },
            grossYouOwe,
            grossYouAreOwed,
        }
    }
})