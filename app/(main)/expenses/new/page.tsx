"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, Users, User } from "lucide-react";
import React from "react";
import ExpenseForm from "./_components/expenseForm";

const NewExpensePage = () => {
  const router = useRouter();
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Add New Expense</h1>
          <p className="text-gray-600">Record a new expense to split with your contacts.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <Receipt className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">New Expense</span>
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-slate-50/40">
        <CardContent className="p-6">
          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
              <TabsTrigger 
                value="individual" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg flex items-center gap-2 font-medium"
              >
                <User className="w-4 h-4" />
                Individual
              </TabsTrigger>
              <TabsTrigger 
                value="group" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg flex items-center gap-2 font-medium"
              >
                <Users className="w-4 h-4" />
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
