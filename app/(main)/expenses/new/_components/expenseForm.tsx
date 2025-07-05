"use client";
import { CalendarIcon, PandaIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { date, z } from "zod";
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
import { format, setDate } from "date-fns";
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
  const categories = getAllCategories();

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Description</Label>
            <Input 
              placeholder="Enter description" 
              {...register("description")} 
              className="h-10 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
            />
            {errors.description && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Amount</Label>
            <Input 
              placeholder="Enter amount" 
              {...register("amount")} 
              className="h-10 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
            />
            {errors.amount && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.amount.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Category</Label>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <CategorySelector categories={categories} onChange={(categoryId) => {

                if(categoryId) {
                  setValue("category", categoryId);
                } 
              }}/>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
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

      {/* Group/Participants Section */}
      {type === "group" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Group Selection</h3>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Select Group</Label>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
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
                  let finalParticipants = [...groupMembers];
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
            {!selectedGroup && (
              <p className="text-sm text-amber-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                Select a group to continue
              </p>
            )}
          </div>
        </div>
      )}

      {type === "individual" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Participants</h3>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Add Participants</Label>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-sm text-gray-600">
                <ParticipantSelector 
                  participants={participants}
                  onParticipantsChange={setParticipants}
                />
              </div>
            </div>
            {participants.length <= 1 && (
              <p className="text-sm text-amber-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                Add at least one other participant to continue
              </p>
            )}
          </div>
        </div>
      )}

      {/* Payment Details */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h3>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            Paid By
            <span className="text-red-500 text-xs">*</span>
          </Label>
          <select 
            {...register("paidByUserId")} 
            className={`w-full h-10 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 ${
              errors.paidByUserId || (!paidByUserId && participants.length > 0) 
                ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
                : "border-gray-300"
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
          {errors.paidByUserId && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {errors.paidByUserId.message}
            </p>
          )}
          {!paidByUserId && participants.length > 0 && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              Please select who paid for this expense
            </p>
          )}
          {participants.length === 0 && (
            <p className="text-sm text-amber-600 flex items-center gap-1">
              <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
              {type === "group" ? "Select a group to see members" : "Add participants to continue"}
            </p>
          )}
        </div>
      </div>

      {/* Split Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Split Configuration</h3>
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">Split Type</Label>
          <Tabs 
            defaultValue="equal" 
            onValueChange={(value) => setValue("splitType", value as "equal" | "exact" | "percentage")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="equal">Equal</TabsTrigger>
              <TabsTrigger value="exact">Exact</TabsTrigger>
              <TabsTrigger value="percentage">Percentage</TabsTrigger>
            </TabsList>

            <TabsContent value="equal" className="space-y-4 mt-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-800">
                  Split equally among all participants
                </p>
              </div>
              <SplitSelector type="equal" amount={parseFloat(amountValue)} participants={participants} paidByUserId={paidByUserId} onSplitChange={setSplits} />
            </TabsContent>

            <TabsContent value="exact" className="space-y-4 mt-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-800">
                  Split the amount exactly among the participants
                </p>
              </div>
              <SplitSelector type="exact" amount={parseFloat(amountValue)} participants={participants} paidByUserId={paidByUserId} onSplitChange={setSplits} />
            </TabsContent>

            <TabsContent value="percentage" className="space-y-4 mt-4">
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-purple-800">
                  Split the amount based on the percentage of the total amount
                </p>
              </div>
              <SplitSelector type="percentage" amount={parseFloat(amountValue)} participants={participants} paidByUserId={paidByUserId} onSplitChange={setSplits} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting || !paidByUserId || participants.length === 0}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Expense"}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
