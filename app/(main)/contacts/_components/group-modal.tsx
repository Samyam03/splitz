// create-group-modal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, X } from "lucide-react";
import { useConvexMutation, useConvexQuery } from "@/hooks/useConvexQuery";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Id } from "@/convex/_generated/dataModel";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";
import { getUserColor } from "@/lib/userColors";

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(50, "Name too long"),
  description: z.string().max(200, "Description too long").optional(),
});

type FormValues = z.infer<typeof groupSchema>;

interface User {
  id: Id<"users">;
  name: string;
  email: string | null;
  imageUrl?: string;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  isClose: (open: boolean) => void;
  onSuccess?: (groupId: string) => void;
}

const CreateGroupModal = ({
  isOpen,
  isClose,
  onSuccess,
}: CreateGroupModalProps) => {
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);

  const { data: currentUser } = useConvexQuery(api.users.getUser);
  const { data: searchResults, loading: isSearching } = useConvexQuery(
    api.users.searchUsers,
    { query: searchQuery }
  );
  const { mutate: createGroup, loading: isCreatingGroup } = useConvexMutation(api.contacts.createGroup);

  const addMember = (user: User) => {
    if (!selectedMembers.some((member) => member.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
    setCommandOpen(false);
  };

  const removeMember = (memberId: Id<"users">) => {
    setSelectedMembers(selectedMembers.filter((member) => member.id !== memberId));
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async(data:FormValues)=>{
      try{
        const memberIds = selectedMembers.map((member) => member.id);
        const groupId = await createGroup({
          name: data.name,
          description: data.description,
          members: memberIds,
        });
       toast.success("Group created successfully");
        if(onSuccess){
          onSuccess(groupId);
        }
        handleClose();
      }catch(error){
        let errorMessage = "";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else {
          errorMessage = String(error);
        }
        
        // Don't show duplicate error message since useConvexMutation already shows toast
        console.error("Failed to create group:", errorMessage);
        
        // The form will automatically exit submitting state due to react-hook-form
        // No need to manually reset since useConvexMutation handles the error state
      }
  }

  const handleClose = () => {
    reset();
    setSelectedMembers([]);
    setSearchQuery("");
    setCommandOpen(false);
    isClose(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg rounded-xl shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50 mx-4">
        <DialogHeader className="border-b border-gray-200 pb-4 sm:pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 -m-4 sm:-m-6 mb-0 p-4 sm:p-6 rounded-t-xl">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            Create New Group
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8 mt-4 sm:mt-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Group Name Field */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label
                htmlFor="name"
                className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5 sm:gap-2"
              >
                Group Name
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                className={`
                  h-10 sm:h-12 text-sm sm:text-lg border-2 rounded-lg transition-all duration-200
                  ${errors.name 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                  }
                  focus:ring-4 shadow-sm
                `}
                placeholder="Marketing Team"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-500 text-xs sm:text-sm font-medium flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label
                htmlFor="description"
                className="text-xs sm:text-sm font-semibold text-gray-700"
              >
                Description
              </Label>
              <Textarea
                id="description"
                className={`
                  text-sm sm:text-base border-2 rounded-lg transition-all duration-200
                  ${errors.description 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                  }
                  focus:ring-4 shadow-sm min-h-[80px] sm:min-h-[100px]
                `}
                placeholder="Team for marketing campaigns and strategies"
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-red-500 text-xs sm:text-sm font-medium flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Members Section */}
            <div className="space-y-3 sm:space-y-4">
              <Label className="text-xs sm:text-sm font-semibold text-gray-700">Members</Label>

              <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border-2 border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {/* Current User Badge */}
                  {currentUser && (() => {
                    const currentUserColor = getUserColor(currentUser.id as Id<'users'>);
                    return (
                      <Badge className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 hover:from-blue-200 hover:to-indigo-200 transition-all duration-200">
                        <Avatar className={`h-6 w-6 sm:h-8 sm:w-8 ring-2 ${currentUserColor.ring}`}>
                          <AvatarImage
                            src={currentUser?.imageUrl}
                            alt={currentUser?.name}
                          />
                          <AvatarFallback className={`text-xs sm:text-sm font-semibold ${currentUserColor.bg} ${currentUserColor.text}`}>
                            {currentUser?.name?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-xs sm:text-sm">{currentUser?.name} (You)</span>
                      </Badge>
                    );
                  })()}

                  {/* Selected Members */}
                  {selectedMembers.map((member) => {
                    const userColor = getUserColor(member.id as Id<'users'>);
                    return (
                      <Badge
                        key={member.id}
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 hover:from-green-200 hover:to-emerald-200 transition-all duration-200"
                      >
                        <Avatar className={`h-6 w-6 sm:h-8 sm:w-8 ring-2 ${userColor.ring}`}>
                          <AvatarImage src={member.imageUrl} alt={member.name} />
                          <AvatarFallback className={`text-xs sm:text-sm font-semibold ${userColor.bg} ${userColor.text}`}>
                            {member.name?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-xs sm:text-sm">{member.name}</span>
                        <Button
                          onClick={() => removeMember(member.id as Id<'users'>)}
                          variant="ghost"
                          size="sm"
                          type="button"
                          className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </Badge>
                    );
                  })}

                  {/* Add Member Button */}
                  <Popover open={commandOpen} onOpenChange={setCommandOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        type="button"
                        className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm"
                      >
                        <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Add member
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 sm:w-80 p-0 shadow-xl border-0 rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-2 sm:p-3 border-b">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Add Members</h4>
                      </div>
                      <Command className="border-0">
                        <CommandInput
                          placeholder="Search for a member by name or email"
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                          className="border-0 focus:ring-0"
                        />
                        <CommandList className="max-h-48 sm:max-h-64">
                          <CommandEmpty className="py-4 sm:py-6 text-center">
                            {searchQuery.length < 2 ? (
                              <div className="space-y-2">
                                <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto" />
                                <p className="text-gray-500 text-xs sm:text-sm">Type at least 2 characters to search</p>
                              </div>
                            ) : isSearching ? (
                              <div className="space-y-2">
                                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mx-auto animate-spin" />
                                <p className="text-blue-600 text-xs sm:text-sm">Searching...</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                                  <X className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-xs sm:text-sm">No members found</p>
                              </div>
                            )}
                          </CommandEmpty>
                          <CommandGroup heading="Users" className="p-2">
                            {searchResults?.map((user: User) => {
                              const userColor = getUserColor(user.id as Id<'users'>);
                              return (
                                <CommandItem
                                  key={user.id}
                                  value={`${user.name} ${user.email || ""}`}
                                  onSelect={() => addMember({ ...user, id: user.id as Id<'users'> })}
                                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200"
                                >
                                  <Avatar className={`h-6 w-6 sm:h-8 sm:w-8 ring-2 ${userColor.ring}`}>
                                    <AvatarImage
                                      src={user.imageUrl}
                                      alt={user.name}
                                    />
                                    <AvatarFallback className={`text-xs sm:text-sm font-semibold ${userColor.bg} ${userColor.text}`}>
                                      {user.name?.charAt(0).toUpperCase() || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 text-xs sm:text-sm truncate">{user.name}</p>
                                    <p className="text-gray-500 text-xs truncate">{user.email}</p>
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Helper text */}
                {selectedMembers.length === 0 && (
                  <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-orange-600 font-medium flex items-center gap-1.5 sm:gap-2">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full"></span>
                      Add at least one other member to create the group
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`
                px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg shadow-lg transition-all duration-200
                ${(isSubmitting || isCreatingGroup || selectedMembers.length === 0)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white hover:shadow-xl hover:-translate-y-0.5"
                }
              `}
              disabled={isSubmitting || isCreatingGroup || selectedMembers.length === 0}
            >
              {(isSubmitting || isCreatingGroup) ? (
                <>
                  <Loader2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
