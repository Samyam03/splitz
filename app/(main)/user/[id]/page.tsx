"use client";
import React, { useState } from "react";
import { useConvexQuery } from "@/hooks/useConvexQuery";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import BarLoader from "react-spinners/BarLoader";
import { ArrowLeftIcon, ArrowRightLeft, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettlementsList from "@/components/settlementsList";
import ExpenseList from "@/components/expenseList";
import { getUserColor } from "@/lib/userColors";


const UserPage = () => {
  const params = useParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("expenses");

  const { data, loading } = useConvexQuery(
    api.expense.getExpensesBetweenUsers,
    { userId: params.id as string }
  );

  const { data: currentUser } = useConvexQuery(api.users.getUser);

  if (loading) {
    return (
      <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex justify-center items-center min-h-[150px] sm:min-h-[200px]">
          <BarLoader color="#3b82f6" width={200} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex justify-center items-center min-h-[150px] sm:min-h-[200px]">
          <p className="text-gray-500 text-sm sm:text-base">No data available</p>
        </div>
      </div>
    );
  }

  const otherUser = data?.otherUser;
  const expenses = data?.expenses || [];
  const settlements = data?.settlements || [];
  const balance = data?.balance || 0;

  if (!otherUser) {
    return (
      <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex justify-center items-center min-h-[150px] sm:min-h-[200px]">
          <p className="text-gray-500 text-sm sm:text-base">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-6 w-full space-y-3 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-1 sm:gap-2 h-8 sm:h-10"
          >
            <ArrowLeftIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-base">Back</span>
          </Button>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">User Details</h1>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 w-full sm:w-auto">
          <Button variant="outline" asChild className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-10">
            <Link href={`/settlements/user/${params.id}`}>
              <ArrowRightLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Settle Up</span>
            </Link>
          </Button>
          <Button asChild className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-10">
            <Link href={`/expenses/new`}>
              <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Add Expense</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* User Profile & Balance Card */}
      <Card className={`shadow-lg border border-gray-200 ${balance === 0 ? 'bg-gradient-to-br from-gray-50 to-slate-50' : balance > 0 ? 'bg-gradient-to-br from-white to-emerald-50' : 'bg-gradient-to-br from-white to-rose-50'}`}>
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
            {/* User Info Section - Left */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              <div className="relative">
                {(() => {
                  const userColor = getUserColor(otherUser.id);
                  return (
                    <Avatar className={`w-10 h-10 sm:w-16 sm:h-16 ring-2 ${userColor.ring} shadow-md`}>
                      <AvatarImage src={otherUser.imageUrl} />
                      <AvatarFallback className={`flex items-center justify-center ${userColor.bg} ${userColor.text} font-semibold w-full h-full text-sm sm:text-lg`}>
                        {otherUser.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  );
                })()}
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-bold text-gray-900 mb-0.5">
                  {otherUser.name || 'Unknown User'}
                </h2>
                <div className="flex items-center gap-1 text-gray-600">
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  <span className="text-xs font-medium">{otherUser.email || 'No email'}</span>
                </div>
              </div>
            </div>

            {/* Balance Section - Right */}
            <div className="text-center sm:text-right">
              <div className="text-lg sm:text-2xl font-bold mb-1">
                {balance === 0 ? (
                  <span className="text-gray-600">$0.00</span>
                ) : balance > 0 ? (
                  <span className="text-green-600">
                    +${balance.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-red-600">
                    -${Math.abs(balance).toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-1">
                {balance === 0 ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs font-medium">All settled</span>
                  </div>
                ) : balance > 0 ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    <span className="text-xs font-medium">You&apos;re owed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                    <span className="text-xs font-medium">You owe</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Card className={`shadow-lg border border-gray-200 ${activeTab === 'expenses' ? (balance === 0 ? 'bg-gradient-to-br from-gray-50 to-slate-50' : balance > 0 ? 'bg-gradient-to-br from-white to-emerald-50' : 'bg-gradient-to-br from-white to-rose-50') : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
        <CardContent className="p-3 sm:p-6">
          <Tabs
            defaultValue="expenses"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-3 sm:mb-6 h-9 sm:h-10">
              <TabsTrigger value="expenses" className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${balance === 0 ? 'data-[state=active]:bg-gray-100 data-[state=active]:text-gray-700' : balance > 0 ? 'data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700' : 'data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700'}`}>
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
                showOtherPerson={false} 
                userLookUpMap={{[otherUser.id]: otherUser, [currentUser?._id || '']: currentUser}} 
              />
            </TabsContent>
            <TabsContent value="settlements" className="space-y-2 sm:space-y-4">
              <SettlementsList 
                settlements={settlements} 
                userLookUpMap={{[otherUser.id]: otherUser}}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPage;

