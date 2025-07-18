"use client";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/useConvexQuery";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BarLoader from "react-spinners/BarLoader";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, Users } from "lucide-react";
import Link from "next/link";
import { ArrowRightLeft, PlusIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettlementsList from "@/components/settlementsList";
import ExpenseList from "@/components/expenseList";
import GroupBalances from "@/components/groupBalances";
import GroupMembers from "@/components/groupMembers";

// Define Balance type for balances
type Balance = {
  id: string;
  name: string;
  imageUrl?: string;
  totalBalance: number;
};

const GroupPage = () => {
  const params = useParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("expenses");

  const { data, loading } = useConvexQuery(api.groups.getGroupExpenses, {
    groupId: params.id as string,
  });

  const { data: currentUser } = useConvexQuery(api.users.getUser);

  if (loading) {
    return (
      <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-6">
        <div className="flex justify-center items-center min-h-[150px] sm:min-h-[200px]">
          <BarLoader color="#3b82f6" width={200} />
        </div>
      </div>
    );
  }

  const group = data?.group;
  const members = data?.members || [];
  const expenses = data?.expenses || [];
  const settlements = data?.settlements || [];
  const balances = data?.balances || [];
  const userLookUpMap = data?.userLookUpMap || {};

  return (
    <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-6 space-y-4 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-gradient-to-r from-white to-blue-50/60 p-4 sm:p-6 rounded-xl border border-blue-200/50 shadow-lg">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-1 sm:gap-2 hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-colors h-8 sm:h-10"
          >
            <ArrowLeftIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-base">Back</span>
          </Button>
          <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
            Group Details
          </h1>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 w-full sm:w-auto">
          <Button variant="outline" asChild className="flex items-center gap-1 sm:gap-2 hover:bg-indigo-50 border-indigo-200 hover:border-indigo-300 transition-colors flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-10">
            <Link href={`/settlements/group/${params.id}`}>
              <ArrowRightLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Settle Up</span>
            </Link>
          </Button>
          <Button asChild className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-10">
            <Link href={`/expenses/new`}>
              <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Add Expense</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Group Info Card */}
      <div className="bg-gradient-to-br from-white to-slate-50/60 rounded-xl border border-slate-200/50 shadow-lg p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full w-12 h-12 sm:w-16 sm:h-16 shadow-lg">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{group?.name || 'Loading...'}</h2>
            {group?.description && (
              <p className="text-gray-600 mb-1.5 sm:mb-2 text-sm sm:text-base">{group.description}</p>
            )}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full"></div>
              <p className="text-xs sm:text-sm font-medium text-gray-700">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50/40 hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r border-b border-blue-200/30 p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-xl">
                        <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
                            <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                            Group Balances
                        </span>
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-6">
                    <GroupBalances balances={balances as Balance[]} />
                </CardContent>
            </Card>
        </div>

        <div>
            <Card className="shadow-xl border-0 bg-gradient-to-br hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-slate-50/80 to-gray-50/80 border-b border-slate-200/30 p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-xl">
                        <div className="p-1.5 sm:p-2 bg-gradient-to-br from-slate-500 to-gray-600 rounded-lg shadow-sm">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-gray-900 to-slate-800 bg-clip-text text-transparent">
                            Members
                        </span>
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-6">
                    <GroupMembers members={members} />
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Activity Section */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-slate-50/40 hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-4 sm:p-8">
          <Tabs
            defaultValue="expenses"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-3 sm:mb-6 h-9 sm:h-10">
              <TabsTrigger value="expenses" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Expenses</span>
                <span className="text-xs">({expenses.length})</span>
              </TabsTrigger>
              <TabsTrigger value="settlements" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                <ArrowRightLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Settlements</span>
                <span className="text-xs">({settlements.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="expenses" className="space-y-2 sm:space-y-4">
              <ExpenseList 
                expenses={expenses} 
                showOtherPerson={true} 
                isGroupExpense={true}
                userLookUpMap={userLookUpMap} 
              />
            </TabsContent>
            <TabsContent value="settlements" className="space-y-2 sm:space-y-4">
              <SettlementsList 
                settlements={settlements} 
                isGroupSettlement={true}
                userLookUpMap={userLookUpMap}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupPage;
