"use client";
import { CalendarIcon, PandaIcon, Users, Receipt, Calculator, User } from "lucide-react";
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConvexMutation, useConvexQuery } from "@/hooks/useConvexQuery";
import { api } from "@/convex/_generated/api";
import { getAllCategories } from "@/lib/expenseCategories";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import ParticipantSelector from "./participantSelector";
import GroupSelector from "./groupSelector";
import CategorySelector from "./categorySelector";
import { TabsList, TabsTrigger, Tabs, TabsContent } from "@/components/ui/tabs";
import SplitSelector from "./splitSelector";
import { toast } from "sonner";

type GroupMember = {
  id: string;
  name: string;
  imageUrl?: string;
  role: string;
};

type Group = {
  id: string;
  name: string;
  description?: string;
  members: GroupMember[];
};

type Split = {
  userId: string;
  name: string;
  email?: string;
  imageUrl?: string;
  amount: number;
  percentage: number;
  paid: boolean;
};

const expenseSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  amount: z
    .string()
    .min(1, { message: "Amount is required" })
    .refine((val) => Number(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  category: z.string().optional(),
  date: z.date().default(new Date()),
  paidByUserId: z.string().min(1, { message: "Paid by user is required" }),
  splitType: z.enum(["equal", "exact", "percentage"]),
  groupId: z.string().optional(),
});

const ExpenseForm = ({
  type,
  onSuccess,
}: {
  type: "individual" | "group";
  onSuccess: (id: string) => void;
}) => {
  const [participants, setParticipants] = useState<Array<{id: string; name: string}>>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [splits, setSplits] = useState<Split[]>([]);

  const { data: currentUser } = useConvexQuery(api.users.getUser);

  const createExpense = useConvexMutation(api.expense.createExpense);
  const categories = getAllCategories().map((cat) => ({
    ...cat,
    icon: cat.icon ? <cat.icon /> : null,
  }));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: "",
      category: "",
      date: new Date(),
      paidByUserId: "",
      splitType: "equal",
      groupId: undefined,
    },
  });

  // Initialize participants with current user
  useEffect(() => {
    if (currentUser && participants.length === 0) {
      setParticipants([{
        id: currentUser._id,
        name: currentUser.name
      }]);
      // Set current user as default payer
      setValue("paidByUserId", currentUser._id);
    }
  }, [currentUser, participants.length, setValue]);

  const amountValue = watch("amount");
  const paidByUserId = watch("paidByUserId");

  const onSubmit = async (data: z.infer<typeof expenseSchema>) => {
    try{
      const amount = parseFloat(data.amount);

      // Filter out participants with invalid IDs before creating splits
      const validParticipants = participants.filter(p => p.id && p.id !== "undefined");
      
      if (validParticipants.length === 0) {
        toast.error("No valid participants found");
        return;
      }

      const formattedSplits = splits
        .filter(split => split.userId && split.userId !== "undefined")
        .map((split)=>({
          userId: split.userId,
          amount: split.amount,
          paid: split.userId === data.paidByUserId
        }));
      
      const totalSplitsAmount = formattedSplits.reduce((sum, split)=>sum+split.amount, 0);

      const tolerance = 0.1; // Increased tolerance for floating point precision
      const difference = Math.abs(totalSplitsAmount - amount);

      if(difference > tolerance){
        toast.error(`The sum of the splits ($${totalSplitsAmount.toFixed(2)}) does not match the total amount ($${amount.toFixed(2)})`);
        return;
      }

      const groupId = type === "individual" ? undefined : data.groupId;

      await createExpense.mutate({
       description: data.description,
       amount: amount,
       category: data.category,
       date: data.date.getTime(), // Convert Date to timestamp
       paidByUserId: data.paidByUserId,
       splits: formattedSplits,
       groupId: groupId === "undefined" ? undefined : groupId,
       splitType: data.splitType,
      })
      toast.success("Expense created successfully");
      reset();

      const otherParticipants = participants.find(p=>p.id !== currentUser?._id);

      const otherUserId = otherParticipants?.id;

      if (type === "individual" && otherUserId) {
        onSuccess(otherUserId);
      } else if (type === "group" && groupId) {
        onSuccess(groupId);
      }

    } catch(error) {
      toast.error("Failed to create expense: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  if (!currentUser) return null;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
      {/* Row 1: Basic Information - Full Width */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-xl border border-teal-300/60 shadow-lg p-4 sm:p-8 space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-md">
            <PandaIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-teal-800 to-cyan-900 bg-clip-text text-transparent">
            Basic Information
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-xs sm:text-sm font-semibold text-teal-800">Description</Label>
            <Input 
              placeholder="Enter description" 
              {...register("description")} 
              className="h-10 sm:h-12 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-white/80 border-blue-200 px-3 sm:px-4 font-medium"
            />
            {errors.description && (
              <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label className="text-xs sm:text-sm font-semibold text-teal-800">Amount</Label>
            <Input 
              placeholder="Enter amount" 
              {...register("amount")} 
              className="h-10 sm:h-12 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-white/80 border-blue-200 px-3 sm:px-4 font-medium"
            />
            {errors.amount && (
              <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label className="text-xs sm:text-sm font-semibold text-teal-800">Category</Label>
            <CategorySelector categories={categories} onChange={(categoryId) => {
              if(categoryId) {
                setValue("category", categoryId);
              } 
            }}/>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label className="text-xs sm:text-sm font-semibold text-teal-800">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full justify-start text-left font-medium h-10 sm:h-12 text-sm bg-white/80 border-blue-200 hover:bg-white hover:border-blue-300 px-3 sm:px-4",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setValue("date", date);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Row 2: Participants/Group Selection + Payment Details Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Left: Group/Participants Section */}
        <div>
          {type === "group" && (
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl border border-purple-300/60 shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-8 space-y-4 sm:space-y-6 h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-md">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-800 to-violet-900 bg-clip-text text-transparent">
                      Group Selection
                    </h3>
                    <p className="text-xs sm:text-sm text-purple-700 mt-1 font-medium">
                      Choose a group to split with
                    </p>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-purple-600 font-bold">
                  {selectedGroup ? "✓ Selected" : "Required"}
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-purple-200/80 p-4 sm:p-6 shadow-sm">
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-xs sm:text-sm font-semibold text-purple-800">Select Group</Label>
                  <GroupSelector onChange={(group: Group) => {
                    if (!selectedGroup || selectedGroup.id !== group.id) {
                      setSelectedGroup(group);
                      setValue("groupId", group.id);

                      // Update participants with group members, ensuring current user is included
                      const groupMembers = group.members.map(member => ({
                        id: member.id,
                        name: member.name
                      }));
                      
                      // Always include current user if not already in group
                      const finalParticipants = [...groupMembers];
                      if (currentUser && !groupMembers.some(member => member.id === currentUser._id)) {
                        finalParticipants.unshift({
                          id: currentUser._id,
                          name: currentUser.name
                        });
                      }
                      
                      setParticipants(finalParticipants);
                      
                      // Set current user as default payer
                      if (currentUser) {
                        setValue("paidByUserId", currentUser._id);
                      }
                    }
                  }}/>
                </div>
              </div>
              
              {!selectedGroup && (
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300/80 rounded-lg p-3 sm:p-5 shadow-sm">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-amber-500 rounded-full flex-shrink-0"></div>
                    <p className="text-xs sm:text-sm text-amber-800 font-bold">
                      Select a group to continue
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {type === "individual" && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-300/60 shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-8 space-y-4 sm:space-y-6 h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-800 to-emerald-900 bg-clip-text text-transparent">
                      Participants
                    </h3>
                    <p className="text-xs sm:text-sm text-green-700 mt-1 font-medium">
                      Add people to split this expense with
                    </p>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-green-600 font-bold">
                  {participants.length} {participants.length === 1 ? 'person' : 'people'}
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-green-200/80 p-4 sm:p-6 shadow-sm">
                <ParticipantSelector 
                  participants={participants}
                  onParticipantsChange={setParticipants}
                />
              </div>
              
              {participants.length <= 1 && (
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300/80 rounded-lg p-3 sm:p-5 shadow-sm">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-amber-500 rounded-full flex-shrink-0"></div>
                    <p className="text-xs sm:text-sm text-amber-800 font-bold">
                      Add at least one other participant to continue
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Payment Details */}
        <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl border border-orange-300/60 shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-8 space-y-4 sm:space-y-6 h-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-md">
                <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-800 to-red-900 bg-clip-text text-transparent">
                  Payment Details
                </h3>
                <p className="text-xs sm:text-sm text-orange-700 mt-1 font-medium">
                  Who paid for this expense
                </p>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-orange-600 font-bold">
              {paidByUserId ? "✓ Selected" : "Required"}
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-orange-200/80 p-4 sm:p-6 shadow-sm">
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-xs sm:text-sm font-semibold text-orange-800 flex items-center gap-1">
                Paid By
                <span className="text-red-600 text-xs sm:text-sm">*</span>
              </Label>
              <select 
                {...register("paidByUserId")} 
                className={`w-full h-10 sm:h-12 px-3 sm:px-4 py-2 sm:py-3 text-sm border rounded-md focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-200 bg-white/80 font-medium ${
                  errors.paidByUserId || (!paidByUserId && participants.length > 0) 
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200" 
                    : "border-orange-200"
                }`}
                disabled={participants.length === 0}
              >
                <option value="">
                  {participants.length === 0 
                    ? (type === "group" ? "Select a group first" : "Add participants first")
                    : "Select who paid"
                  }
                </option>
                {participants.map((participant, index) => (
                  <option key={participant.id || `participant-${index}`} value={participant.id}>
                    {participant.id === currentUser?._id ? "You" : participant.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Status Messages */}
          <div className="space-y-3 sm:space-y-4">
            {errors.paidByUserId && (
              <div className="bg-gradient-to-r from-red-100 to-rose-100 border border-red-300/80 rounded-lg p-3 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full flex-shrink-0"></div>
                  <p className="text-xs sm:text-sm text-red-800 font-bold">
                    {errors.paidByUserId.message}
                  </p>
                </div>
              </div>
            )}
            {!paidByUserId && participants.length > 0 && !errors.paidByUserId && (
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300/80 rounded-lg p-3 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-amber-500 rounded-full flex-shrink-0"></div>
                  <p className="text-xs sm:text-sm text-amber-800 font-bold">
                    Please select who paid for this expense
                  </p>
                </div>
              </div>
            )}
            {participants.length === 0 && (
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-300/80 rounded-lg p-3 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <p className="text-xs sm:text-sm text-blue-800 font-bold">
                    {type === "group" ? "Select a group to see members" : "Add participants to continue"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Split Configuration - Full Width */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl border border-indigo-300/60 shadow-lg p-4 sm:p-8 space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md">
            <Calculator className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-800 to-purple-900 bg-clip-text text-transparent">
            Split Configuration
          </h3>
        </div>
        
        {/* Check if amount is valid */}
        {!amountValue || isNaN(parseFloat(amountValue)) || parseFloat(amountValue) <= 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Disabled Information Cards */}
            <div className="space-y-3 sm:space-y-4 opacity-60">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/60 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-gray-300 rounded-xl shadow-sm">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-500">Equal Split</h4>
                      <p className="text-xs sm:text-sm text-gray-400 mt-1">
                        Divide the amount equally among all participants
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-400 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-400">Most Common</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/60 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-gray-300 rounded-xl shadow-sm">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-500">Exact Amount</h4>
                      <p className="text-xs sm:text-sm text-gray-400 mt-1">
                        Specify the exact amount each participant owes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-400 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-400">Precise</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/60 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-gray-300 rounded-xl shadow-sm">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-500">Percentage Split</h4>
                      <p className="text-xs sm:text-sm text-gray-400 mt-1">
                        Split based on custom percentage for each participant
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-400 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-400">Flexible</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Disabled Message */}
            <div className="bg-gradient-to-r from-gray-100 to-slate-100 border border-gray-300/80 rounded-xl p-6 sm:p-10 text-center shadow-sm">
              <div className="flex flex-col items-center gap-3 sm:gap-5">
                <div className="p-3 sm:p-5 bg-gray-200 rounded-full">
                  <Calculator className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-700 mb-2 sm:mb-3">Enter a Valid Amount</h4>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">
                    Please enter a valid expense amount above to configure how the expense will be split
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Active Information Cards */}
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-200/80 p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-blue-900">Equal Split</h4>
                      <p className="text-xs sm:text-sm text-blue-700 mt-1 font-medium">
                        Divide the amount equally among all participants
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-bold text-blue-700">Most Common</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-green-200/80 p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-green-900">Exact Amount</h4>
                      <p className="text-xs sm:text-sm text-green-700 mt-1 font-medium">
                        Specify the exact amount each participant owes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-bold text-green-700">Precise</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-200/80 p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-md">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-purple-900">Percentage Split</h4>
                      <p className="text-xs sm:text-sm text-purple-700 mt-1 font-medium">
                        Split based on custom percentage for each participant
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm font-bold text-purple-700">Flexible</span>
                  </div>
                </div>
              </div>
            </div>

            <Tabs 
              defaultValue="equal" 
              onValueChange={(value) => setValue("splitType", value as "equal" | "exact" | "percentage")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 h-12 sm:h-14 bg-white/60 border border-indigo-200/60 p-1">
                <TabsTrigger value="equal" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white font-semibold text-xs sm:text-sm h-full">Equal Split</TabsTrigger>
                <TabsTrigger value="exact" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold text-xs sm:text-sm h-full">Exact Amount</TabsTrigger>
                <TabsTrigger value="percentage" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white font-semibold text-xs sm:text-sm h-full">Percentage Split</TabsTrigger>
              </TabsList>

              <TabsContent value="equal" className="space-y-3 sm:space-y-4 mt-6 sm:mt-8">
                <SplitSelector type="equal" amount={parseFloat(amountValue)} participants={participants} paidByUserId={paidByUserId} onSplitChange={setSplits} />
              </TabsContent>

              <TabsContent value="exact" className="space-y-3 sm:space-y-4 mt-6 sm:mt-8">
                <SplitSelector type="exact" amount={parseFloat(amountValue)} participants={participants} paidByUserId={paidByUserId} onSplitChange={setSplits} />
              </TabsContent>

              <TabsContent value="percentage" className="space-y-3 sm:space-y-4 mt-6 sm:mt-8">
                <SplitSelector type="percentage" amount={parseFloat(amountValue)} participants={participants} paidByUserId={paidByUserId} onSplitChange={setSplits} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Row 4: Create Expense Button - Prominent */}
      <div className="flex justify-center pt-6 sm:pt-8">
        <Button 
          type="submit" 
          disabled={isSubmitting || !paidByUserId || participants.length === 0}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 sm:px-16 lg:px-64 py-4 sm:py-6 rounded-xl font-bold text-lg sm:text-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 transform hover:scale-105 w-full sm:w-auto min-w-[200px] sm:min-w-[650px]"
        >
          {isSubmitting ? "Creating..." : "Create Expense"}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
