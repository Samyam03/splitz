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
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { getUserColor } from "@/lib/userColors";

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(50, "Name too long"),
  description: z.string().max(200, "Description too long").optional(),
});

type FormValues = z.infer<typeof groupSchema>;

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
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);

  const { data: currentUser } = useConvexQuery(api.users.getUser);
  const { data: searchResults, loading: isSearching } = useConvexQuery(
    api.users.searchUsers,
    { query: searchQuery }
  );
  const { data: allUsers } = useConvexQuery(api.users.searchUsers, { query: '' });
  const { mutate: createGroup, loading: isCreatingGroup } = useConvexMutation(api.contacts.createGroup);

  const addMember = (user: any) => {
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
      <DialogContent className="sm:max-w-lg rounded-xl shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
        <DialogHeader className="border-b border-gray-200 pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 -m-6 mb-0 p-6 rounded-t-xl">
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            Create New Group
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-6">
          <div className="space-y-6">
            {/* Group Name Field */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                Group Name
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                className={`
                  h-12 text-lg border-2 rounded-lg transition-all duration-200
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
                <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-semibold text-gray-700"
              >
                Description
              </Label>
              <Textarea
                id="description"
                className={`
                  text-base border-2 rounded-lg transition-all duration-200
                  ${errors.description 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100" 
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                  }
                  focus:ring-4 shadow-sm min-h-[100px]
                `}
                placeholder="Team for marketing campaigns and strategies"
                rows={4}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Members Section */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-gray-700">Members</Label>

              <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border-2 border-gray-100">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Current User Badge */}
                  {currentUser && (() => {
                    const currentUserColor = getUserColor(currentUser.id);
                    return (
                      <Badge className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 hover:from-blue-200 hover:to-indigo-200 transition-all duration-200">
                        <Avatar className={`h-8 w-8 ring-2 ${currentUserColor.ring}`}>
                          <AvatarImage
                            src={currentUser?.imageUrl}
                            alt={currentUser?.name}
                          />
                          <AvatarFallback className={`text-sm font-semibold ${currentUserColor.bg} ${currentUserColor.text}`}>
                            {currentUser?.name?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">{currentUser?.name} (You)</span>
                      </Badge>
                    );
                  })()}

                  {/* Selected Members */}
                  {selectedMembers.map((member) => {
                    const userColor = getUserColor(member.id);
                    return (
                      <Badge
                        key={member.id}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 hover:from-green-200 hover:to-emerald-200 transition-all duration-200"
                      >
                        <Avatar className={`h-8 w-8 ring-2 ${userColor.ring}`}>
                          <AvatarImage src={member.imageUrl} alt={member.name} />
                          <AvatarFallback className={`text-sm font-semibold ${userColor.bg} ${userColor.text}`}>
                            {member.name?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">{member.name}</span>
                        <Button
                          onClick={() => removeMember(member.id)}
                          variant="ghost"
                          size="sm"
                          type="button"
                          className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </Badge>
                    );
                  })}

                  {/* Add Member Button */}
                  <Popover open={commandOpen} onOpenChange={setCommandOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        type="button"
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <UserPlus className="h-4 w-4" />
                        Add member
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 shadow-xl border-0 rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 border-b">
                        <h4 className="font-semibold text-gray-800">Add Members</h4>
                      </div>
                      <Command className="border-0">
                        <CommandInput
                          placeholder="Search for a member by name or email"
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                          className="border-0 focus:ring-0"
                        />
                        <CommandList className="max-h-64">
                          <CommandEmpty className="py-6 text-center">
                            {searchQuery.length < 2 ? (
                              <div className="space-y-2">
                                <UserPlus className="h-8 w-8 text-gray-400 mx-auto" />
                                <p className="text-gray-500">Type at least 2 characters to search</p>
                              </div>
                            ) : isSearching ? (
                              <div className="space-y-2">
                                <Loader2 className="h-8 w-8 text-blue-500 mx-auto animate-spin" />
                                <p className="text-blue-600">Searching...</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                                  <X className="h-4 w-4 text-gray-400" />
                                </div>
                                <p className="text-gray-500">No members found</p>
                              </div>
                            )}
                          </CommandEmpty>
                          <CommandGroup heading="Users" className="p-2">
                            {searchResults?.map((user: any) => {
                              const userColor = getUserColor(user.id);
                              return (
                                <CommandItem
                                  key={user.id}
                                  value={`${user.name} ${user.email || ""}`}
                                  onSelect={() => addMember(user)}
                                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200"
                                >
                                  <Avatar className={`h-8 w-8 ring-2 ${userColor.ring}`}>
                                    <AvatarImage
                                      src={user.imageUrl}
                                      alt={user.name}
                                    />
                                    <AvatarFallback className={`text-sm font-semibold ${userColor.bg} ${userColor.text}`}>
                                      {user.name?.charAt(0).toUpperCase() || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-800">{user.name}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
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
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-600 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                      Add at least one other member to create the group
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-6 py-3 text-sm font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`
                px-8 py-3 text-sm font-semibold rounded-lg shadow-lg transition-all duration-200
                ${(isSubmitting || isCreatingGroup || selectedMembers.length === 0)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white hover:shadow-xl hover:-translate-y-0.5"
                }
              `}
              disabled={isSubmitting || isCreatingGroup || selectedMembers.length === 0}
            >
              {(isSubmitting || isCreatingGroup) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
