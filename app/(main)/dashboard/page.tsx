"use client";
import React from "react";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/useConvexQuery";
import BarLoader from "react-spinners/BarLoader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlusCircle, Users, User, Receipt, BarChart3   } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ExpenseSummary from "./_components/expenseSummary";
import BalanceSummary from "./_components/balanceSummary";
import IndividualExpenses from "./_components/individualExpenses";
import GroupList from "./_components/groupList";
import MemberList from "./_components/memberList";

const DashboardPage = () => {
  const { data: balances, loading: balancesLoading } = useConvexQuery(
    api.dashboard.getUserBalances
  );

  const { data: advancedBreakdown, loading: advancedBreakdownLoading } = useConvexQuery(
    api.dashboard.getAdvancedExpenseBreakdown
  );

  const { data: groups, loading: groupsLoading } = useConvexQuery(
    api.dashboard.getUserGroups
  );

  const { data: memberBalances, loading: memberBalancesLoading } = useConvexQuery(
    api.dashboard.getMemberBalances
  );

  const { data: individualExpenses, loading: individualExpensesLoading } = useConvexQuery(
    api.dashboard.getIndividualExpenses
  );

  const { data: totalSpent, loading: totalSpentLoading } = useConvexQuery(
    api.dashboard.getTotalSpent
  );

  const { data: monthlySpending, loading: monthlySpendingLoading } =
    useConvexQuery(api.dashboard.getTotalSpentByMonth);

  const loading =
    balancesLoading ||
    advancedBreakdownLoading ||
    groupsLoading ||
    memberBalancesLoading ||
    individualExpensesLoading ||
    totalSpentLoading ||
    monthlySpendingLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Track your expenses and balances</p>
              </div>
              <Button
                asChild
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg"
              >
                <Link href="/expenses/new">
                  <PlusCircle className="h-5 w-5" />
                  Add Expense
                </Link>
              </Button>
            </div>

            {/* Total Balance Section - Full Width */}
            <div>
              <div className="bg-gradient-to-br from-white to-slate-50/40 rounded-lg shadow-lg border-0 overflow-hidden">
                {/* Header with Icon */}
                <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Receipt className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Advanced Financial Overview</h2>
                      <p className="text-sm text-white/80 mt-1">Individual & Group Expenses</p>
                    </div>
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Total Balance - Center */}
                    <div className="lg:col-span-1">
                      <div className="text-center h-full flex flex-col justify-center">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Balance</h3>
                        <div className="text-5xl font-bold mb-3">
                          {advancedBreakdown?.totalBalance > 0 ? (
                            <span className="text-green-600">
                              +${advancedBreakdown.totalBalance.toFixed(2)}
                            </span>
                          ) : advancedBreakdown?.totalBalance < 0 ? (
                            <span className="text-red-600">
                              -${Math.abs(advancedBreakdown.totalBalance).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-900">$0.00</span>
                          )}
                        </div>
                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-sm ${
                          advancedBreakdown?.totalBalance > 0 
                            ? "bg-green-100 text-green-800 border border-green-200" 
                            : advancedBreakdown?.totalBalance < 0 
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}>
                          {advancedBreakdown?.totalBalance > 0
                            ? "💰 You are owed money"
                            : advancedBreakdown?.totalBalance < 0
                              ? "💸 You owe money"
                              : "✅ All settled up"}
                        </div>
                      </div>
                    </div>
                    
                    {/* You Are Owed - Right */}
                    <div className="lg:col-span-1">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200/50 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <span className="text-green-600 text-lg">💰</span>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">You Are Owed</h4>
                        </div>
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          ${advancedBreakdown?.grossYouAreOwed?.toFixed(2) || "0.00"}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          From {advancedBreakdown?.oweDetails?.youAreOwed?.length || 0} people
                        </div>
                        <div className="mt-auto">
                          {advancedBreakdown?.oweDetails?.youAreOwed?.length > 0 && (
                            <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                              Pending settlements
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* You Owe - Right */}
                    <div className="lg:col-span-1">
                      <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border border-red-200/50 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <span className="text-red-600 text-lg">💸</span>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">You Owe</h4>
                        </div>
                        <div className="text-3xl font-bold text-red-600 mb-2">
                          ${advancedBreakdown?.grossYouOwe?.toFixed(2) || "0.00"}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          To {advancedBreakdown?.oweDetails?.youOwe?.length || 0} people
                        </div>
                        <div className="mt-auto">
                          {advancedBreakdown?.oweDetails?.youOwe?.length > 0 && (
                            <div className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                              Outstanding payments
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              
              {/* Left Column - Main Content */}
              <div className="xl:col-span-3 space-y-6">

                {/* Advanced Expense Breakdown - Above Graph */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-lg border-0 h-80 flex flex-col">
                  <div className="px-6 py-4 border-b border-green-200/50 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <BarChart3 className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Detailed Balance Breakdown</h3>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link href="/contacts">
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                      <BalanceSummary balances={advancedBreakdown} />
                    </div>
                  </div>
                </div>

                {/* Expense Summary - Full Width */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg border-0 h-80">
                  <ExpenseSummary
                    monthlySpending={monthlySpending}
                    totalSpent={totalSpent}
                  />
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="xl:col-span-1 flex flex-col space-y-6">
                
                {/* Individual Expenses */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg shadow-lg border-0 h-80 flex flex-col">
                  <div className="px-6 py-4 border-b border-purple-200/50 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Individual Expenses</h3>
                      </div>

                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                      <BalanceSummary balances={balances} />
                    </div>
                  </div>
                </div>

                {/* Group Expenses */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg shadow-lg border-0 h-[33.625rem] flex flex-col">
                  <div className="px-6 py-4 border-b border-orange-200/50 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Users className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Group Expenses</h3>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link href="/contacts">
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                      {/* Groups Section */}
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Your Groups</h4>
                      <div className="max-h-48 overflow-y-auto">
                        <GroupList groups={groups} />
                      </div>
                      
                      {/* Group Members Section */}
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Group Members</h4>
                      <div className="max-h-48 overflow-y-auto">
                        <MemberList members={memberBalances} />
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-3 border-t border-orange-200/50 flex-shrink-0">
                    <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg text-sm py-2">
                      <Link href="/contacts?createGroup=true">
                        <Users className="w-4 h-4 mr-2" />
                        Create New Group
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
