"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import ExpenseForm from "./_components/expenseForm";

const NewExpensePage = () => {
  const router = useRouter();
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Add New Expense</h1>
        <p className="text-gray-600">Record a new expense to split with your friends.</p>
      </div>

      {/* Main Form Card */}
      <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
        <CardContent className="p-6">
          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="individual" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
                Individual
              </TabsTrigger>
              <TabsTrigger value="group" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white">
                Group
              </TabsTrigger>
            </TabsList>
            <TabsContent value="individual" className="space-y-0">
             <ExpenseForm type="individual" onSuccess={(id) => router.push(`/user/${id}`)}/>
            </TabsContent>
            <TabsContent value="group" className="space-y-0">
              <ExpenseForm type="group" onSuccess={(id) => router.push(`/groups/${id}`)}/>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewExpensePage;
