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
      <DialogContent className="sm:max-w-md rounded-lg">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-lg font-semibold">
            Create New Group
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-2">
          <div className="space-y-3">
            <div>
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Group Name *
              </Label>
              <Input
                id="name"
                className={`mt-1 ${errors.name ? "border-red-500 focus:ring-red-500" : ""}`}
                placeholder="Marketing Team"
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1 text-red-600 text-xs">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Description
              </Label>
              <Textarea
                id="description"
                className={`mt-1 ${errors.description ? "border-red-500 focus:ring-red-500" : ""}`}
                placeholder="Team for marketing campaigns and strategies"
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <p className="mt-1 text-red-600 text-xs">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div>
              <Label>Members</Label>

              <div className="mt-2 flex items-center gap-3 flex-wrap">
                {currentUser && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-2 p-2"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={currentUser?.imageUrl}
                        alt={currentUser?.name}
                      />
                      <AvatarFallback className="text-xs">
                        {currentUser?.name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{currentUser?.name} (You)</span>
                  </Badge>
                )}

                {selectedMembers.map((member) => (
                  <Badge
                    key={member.id}
                    variant="secondary"
                    className="flex items-center gap-2 p-2"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.imageUrl} alt={member.name} />
                      <AvatarFallback className="text-xs">
                        {member.name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                    <Button
                      onClick={() => removeMember(member.id)}
                      variant="ghost"
                      size="icon"
                      type="button"
                    >
                      <X />
                    </Button>
                  </Badge>
                ))}

                <Popover open={commandOpen} onOpenChange={setCommandOpen}>
                  <PopoverTrigger asChild>
                    <Button>
                      <UserPlus />
                      Add member
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Command>
                      <CommandInput
                        placeholder="Search for a member by name or email"
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {searchQuery.length < 2 ? (
                            <p>
                              Type at least 2 characters to search for a member
                            </p>
                          ) : isSearching ? (
                            <p>Searching...</p>
                          ) : (
                            <p>No members found</p>
                          )}
                        </CommandEmpty>
                        <CommandGroup heading="Users">
                          {searchResults?.map((user: any) => (
                            <CommandItem
                              key={user.id}
                              value={`${user.name} ${user.email || ""}`}
                              onSelect={() => addMember(user)}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={user.imageUrl}
                                    alt={user.name}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {user.name?.charAt(0).toUpperCase() || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <span>{user.name}</span>
                                  <span className="text-xs text-gray-500 block">
                                    {user.email}
                                  </span>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedMembers.length === 0 && (
                  <p
                    className="text-sm text-gray-500 font-normal"
                    style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 4, marginBottom: 0 }}
                  >
                    Add at least one other member to the group
                  </p>
                )}
              </div>
            </div>
          </div>
          


          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-4 py-2 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 text-sm"
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
