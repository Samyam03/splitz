"use client";
import React from "react";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/useConvexQuery";
import BarLoader from "react-spinners/BarLoader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlusCircle, Users   } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ExpenseSummary from "./_components/expenseSummary";
import BalanceSummary from "./_components/balanceSummary";
import GroupList from "./_components/groupList";

const DashboardPage = () => {
  const { data: balances, loading: balancesLoading } = useConvexQuery(
    api.dashboard.getUserBalances
  );

  const { data: groups, loading: groupsLoading } = useConvexQuery(
    api.dashboard.getUserGroups
  );

  const { data: totalSpent, loading: totalSpentLoading } = useConvexQuery(
    api.dashboard.getTotalSpent
  );

  const { data: monthlySpending, loading: monthlySpendingLoading } =
    useConvexQuery(api.dashboard.getTotalSpentByMonth);

  const loading =
    balancesLoading ||
    groupsLoading ||
    totalSpentLoading ||
    monthlySpendingLoading;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <BarLoader color="#3b82f6" width={200} />
        </div>
      ) : (
        <>
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <Button
              variant="outline"
              asChild
              className="flex items-center gap-2"
            >
              <Link href="/expenses/new">
                <PlusCircle className="h-4 w-4" />
                Add Expense
              </Link>
            </Button>
          </div>

          {/* Cards Grid */}
          {/* Combined Balance Card */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-slate-50 to-gray-100 overflow-hidden">
            <CardContent className="p-5">
              {/* Upper Section - Total Balance */}
              <div className="text-center mb-5 pb-4 border-b border-gray-200">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-3 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Total Balance</h3>
                <div className="text-3xl font-bold mb-2">
                  {balances?.totalBalance > 0 ? (
                    <span className="text-green-600">
                      +${balances.totalBalance.toFixed(2)}
                    </span>
                  ) : balances?.totalBalance < 0 ? (
                    <span className="text-red-600">
                      -${Math.abs(balances.totalBalance).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-gray-600">$0.00</span>
                  )}
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  balances?.totalBalance > 0 
                    ? "bg-green-100 text-green-700 border border-green-200" 
                    : balances?.totalBalance < 0 
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    balances?.totalBalance > 0 
                      ? "bg-green-500" 
                      : balances?.totalBalance < 0 
                        ? "bg-red-500"
                        : "bg-gray-500"
                  }`}></div>
                  {balances?.totalBalance > 0
                    ? "You are owed money"
                    : balances?.totalBalance < 0
                      ? "You owe money"
                      : "All settled up"}
                </div>
              </div>

              {/* Lower Section - You Are Owed (Left) and You Owe (Right) */}
              <div className="grid grid-cols-2 gap-4">
                {/* Left - You Are Owed */}
                <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 rounded-xl p-4 border border-green-200/50 shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-green-800 mb-2 text-center">You Are Owed</h4>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-700 mb-1">
                      ${balances?.youAreOwed?.toFixed(2) || "0.00"}
                    </div>
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-200/70 text-green-800 text-xs font-medium">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      From {balances?.oweDetails?.youAreOwed?.length || 0}
                    </div>
                  </div>
                </div>

                {/* Right - You Owe */}
                <div className="bg-gradient-to-br from-red-50 via-rose-50 to-red-100 rounded-xl p-4 border border-red-200/50 shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-red-800 mb-2 text-center">You Owe</h4>
                  <div className="text-center">
                    {balances?.oweDetails?.youOwe?.length > 0 ? (
                      <>
                        <div className="text-xl font-bold text-red-700 mb-1">
                          ${balances?.youOwe?.toFixed(2) || "0.00"}
                        </div>
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-200/70 text-red-800 text-xs font-medium">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          To {balances?.oweDetails.youOwe.length || 0}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-xl font-bold text-gray-600 mb-1">
                          $0.00
                        </div>
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-200/70 text-gray-700 text-xs font-medium">
                          <svg className="w-3 h-3 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          No debts
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid - Equal Heights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left Side - Expense Summary */}
            <div className="lg:col-span-2">
              <ExpenseSummary
                monthlySpending={monthlySpending}
                totalSpent={totalSpent}
              />
            </div>

            {/* Right Side - Balance Summary and Group List */}
            <div className="flex flex-col space-y-5 lg:h-[510px]">
              <div className="h-[280px] flex flex-col bg-white rounded-lg border shadow-sm">
                <div className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 flex-shrink-0">
                  <h3 className="text-lg font-semibold">Balance Details</h3>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/contacts" className="flex items-center gap-2">
                    View All
                    <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4">
                  <BalanceSummary balances={balances} />
                </div>
              </div>

              <div className="h-[295px] flex flex-col bg-white rounded-lg border shadow-sm">
                <div className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 flex-shrink-0">
                  <h3 className="text-lg font-semibold">Your Groups</h3>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/contacts" className="flex items-center gap-2">
                    View All 
                    <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0 px-4">
                  <GroupList groups={groups} />
                </div>
                <div className="flex-shrink-0 flex justify-center p-4 pt-3">
                  <Button asChild>
                    <Link href="/contacts?createGroup=true">
                    <Users/>  
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
  );
};

export default DashboardPage;
