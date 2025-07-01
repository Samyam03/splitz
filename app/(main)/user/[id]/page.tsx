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
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettlementsList from "@/components/settlementsList";
import ExpenseList from "@/components/expenseList";


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
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center min-h-[200px]">
          <BarLoader color="#3b82f6" width={200} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center min-h-[200px]">
          <p className="text-gray-500">No data available</p>
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
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center min-h-[200px]">
          <p className="text-gray-500">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 py-6 w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link href={`/settlements/user/${params.id}`}>
              <ArrowRightLeft className="h-4 w-4" />
              Settle Up
            </Link>
          </Button>
          <Button asChild className="flex items-center gap-2">
            <Link href={`/expenses/new`}>
              <PlusIcon className="h-4 w-4" />
              Add Expense
            </Link>
          </Button>
        </div>
      </div>

      {/* User Profile & Balance Card */}
      <div className="mb-8">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-6">
              {/* User Info Section - Left */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                    <AvatarImage src={otherUser.imageUrl} />
                    <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {otherUser.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-0.5">
                    {otherUser.name || 'Unknown User'}
                  </h2>
                  <div className="flex items-center gap-1 text-gray-600">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <span className="text-sm font-medium">{otherUser.email || 'No email'}</span>
                  </div>
                </div>
              </div>

              {/* Balance Section - Right */}
              <div className="text-right">
                <div className="text-2xl font-bold mb-1">
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
                <div className="flex items-center justify-end gap-1">
                  {balance === 0 ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs font-medium">All settled</span>
                    </div>
                  ) : balance > 0 ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                      <span className="text-xs font-medium">You're owed</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>

      {/* Tabs Section */}
      <div className="mb-4">
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-6">
            <Tabs
              defaultValue="expenses"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="expenses" className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Expenses ({expenses.length})
                </TabsTrigger>
                <TabsTrigger value="settlements" className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  Settlements ({settlements.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="expenses" className="space-y-4">
                <ExpenseList 
                  expenses={expenses} 
                  showOtherPerson={false} 
                  otherUserId={params.id as string} 
                  userLookUpMap={{
                    [otherUser.id]: otherUser,
                    [currentUser?._id || '']: currentUser
                  }} 
                />
              </TabsContent>
              <TabsContent value="settlements" className="space-y-4">
                <SettlementsList 
                  settlements={settlements} 
                  userLookUpMap={{[otherUser.id]: otherUser}}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserPage;

