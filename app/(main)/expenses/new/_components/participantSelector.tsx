import React, { useState } from 'react'
import { useConvexQuery } from '@/hooks/useConvexQuery'
import { api } from '@/convex/_generated/api'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { UserPlus, X, Loader2 } from 'lucide-react'
import { getUserColor } from '@/lib/userColors'
import { Id } from '@/convex/_generated/dataModel'

// Add types for participants and users
type Participant = {
  id: string;
  name: string;
  imageUrl?: string;
};
type User = {
  id: Id<'users'>;
  name: string;
  email: string | null;
  imageUrl?: string;
};

const ParticipantSelector = ({participants, onParticipantsChange}: {participants: Participant[], onParticipantsChange: (participants: Participant[]) => void}) => {

  const {data: currentUser} = useConvexQuery(api.users.getUser)
  const [commandOpen, setCommandOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Use the same pattern as the group modal
  const { data: searchResults, loading: isSearching } = useConvexQuery(
    api.users.searchUsers,
    { query: searchQuery }
  );

  const addParticipant = (user: User) => {
    // Ensure user has a valid ID and required properties
    if (!user || !user.id || !user.name) {
      console.error('Invalid user object:', user);
      return;
    }
    
    // Check if participant already exists
    if (participants.some((p: Participant) => p.id === user.id)) {
      return;
    }
    
    const participant = {
      id: user.id,
      name: user.name,
      imageUrl: user.imageUrl
    }
    onParticipantsChange([...participants, participant])
    setCommandOpen(false)
    setSearchQuery('')
  }

  const removeParticipant = (userId: string) => {
    onParticipantsChange(participants.filter((p: Participant) => p.id !== userId))
  }

  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {/* Selected Participants */}
        {participants.map((participant: Participant, index: number) => {
          const userColor = getUserColor(participant.id);
          const isCurrentUser = participant.id === currentUser?._id;
          return (
            <Badge
              key={participant.id || `participant-${index}`}
              className={`flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 text-xs transition-all duration-200 ${
                isCurrentUser 
                  ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200" 
                  : "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200"
              }`}
            >
              <Avatar className={`h-4 w-4 sm:h-5 sm:w-5 ring-1 ${userColor.ring}`}>
                <AvatarImage src={participant.imageUrl} alt={participant.name} />
                <AvatarFallback className={`text-xs font-medium ${userColor.bg} ${userColor.text}`}>
                  {participant.name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium max-w-[60px] sm:max-w-[80px] truncate">
                {isCurrentUser ? "You" : participant.name}
              </span>
              {!isCurrentUser && (
                <Button
                  onClick={() => removeParticipant(participant.id)}
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="h-3 w-3 sm:h-4 sm:w-4 p-0 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                >
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </Button>
              )}
            </Badge>
          );
        })}

        {/* Add Participant Button */}
        <Popover open={commandOpen} onOpenChange={setCommandOpen}>
          <PopoverTrigger asChild>
            <Button 
              type="button"
              size="sm"
              className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium px-1.5 sm:px-2 py-1 rounded-md shadow-sm hover:shadow-md transition-all duration-200 text-xs"
            >
              <UserPlus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Add
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 sm:w-80 p-0 shadow-xl border-0 rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-2 sm:p-3 border-b">
              <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Add Participants</h4>
            </div>
            <Command className="border-0">
              <CommandInput
                placeholder="Search for a participant by name or email"
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
                      <p className="text-gray-500 text-xs sm:text-sm">No participants found</p>
                    </div>
                  )}
                </CommandEmpty>
                <CommandGroup heading="Users" className="p-2">
                  {searchResults?.map((user: User) => {
                    const userColor = getUserColor(user.id);
                    return (
                      <CommandItem
                        key={user.id}
                        value={`${user.name} ${user.email || ""}`}
                        onSelect={() => addParticipant(user)}
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
      {participants.length === 0 && (
        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
          <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
            Add participants to split the expense with
          </p>
        </div>
      )}
    </div>
  )
}

export default ParticipantSelector
