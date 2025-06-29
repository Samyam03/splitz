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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Total Balance Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-700">
                  Total Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold">
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

                <p className="text-sm font-medium text-gray-600">
                  {balances?.totalBalance > 0
                    ? "You are owed money"
                    : balances?.totalBalance < 0
                      ? "You owe money"
                      : "All settled up"}
                </p>
              </CardContent>
            </Card>

            {/* You Are Owed Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-700">
                  You Are Owed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold text-green-600">
                  ${balances?.youAreOwed?.toFixed(2) || "0.00"}
                </div>

                <p className="text-sm font-medium text-gray-600">
                  From {balances?.oweDetails?.youAreOwed?.length || 0} people
                </p>
              </CardContent>
            </Card>

            {/* You Owe Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-rose-50 md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-700">
                  You Owe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  {balances?.oweDetails?.youOwe?.length > 0 ? (
                    <>
                      <div className="text-3xl font-bold text-red-600">
                        ${balances?.youOwe?.toFixed(2) || "0.00"}
                      </div>
                      <p className="text-sm font-medium text-gray-600 mt-2">
                        To {balances?.oweDetails.youOwe.length || 0} people
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-gray-600">
                        $0.00
                      </div>
                      <p className="text-sm font-medium text-green-600 mt-2">
                        You don't owe anyone money
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

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
