import { useConvexQuery } from '@/hooks/useConvexQuery';
import { api } from "@/convex/_generated/api";
import React, { useEffect, useState } from 'react'
import { BarLoader } from 'react-spinners';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';

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

const GroupSelector = ({onChange}: {onChange: (group: Group) => void}) => {
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const {data, loading} = useConvexQuery(api.groups.getGroupOrMembers, selectedGroupId ? {groupId: selectedGroupId} : {})

  useEffect(()=>{
    if(data?.selectedGroup && onChange) {
      onChange(data.selectedGroup);
    }
  }, [data, onChange])

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
  }

  if(loading) {
    return <BarLoader />
  }

  if(!data?.groups || data.groups.length === 0) {
    return(
      <div>
        You don't have any groups yet. Create a new group to get started.
      </div>
    )
  }

  return (
    <div>
      <Select value={selectedGroupId} onValueChange={handleGroupChange} >
        <SelectTrigger>
          <SelectValue placeholder="Select a group" />
        </SelectTrigger>
                 <SelectContent>
           {data.groups.map((group: {id: string; name: string; memberCount: number})=> (
             <SelectItem key={group.id} value={group.id}>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{group.name}</span>
                <span className="text-sm text-gray-500">
                  ({group.memberCount} members)
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>   

      {loading && selectedGroupId && (
        <div className="flex items-center gap-2 mt-2">
          <BarLoader/>
          <span className="text-sm text-gray-600">Loading group members...</span>
        </div>
      ) }
    </div>
  )
}

export default GroupSelector
