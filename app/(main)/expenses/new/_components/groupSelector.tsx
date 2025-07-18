import { useConvexQuery } from '@/hooks/useConvexQuery';
import { api } from "@/convex/_generated/api";
import React, { useEffect, useState } from 'react'
import { BarLoader } from 'react-spinners';

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
      <div className="text-sm text-gray-600 font-medium">
        You don&apos;t have any groups yet. Create a new group to get started.
      </div>
    )
  }

  return (
    <div>
      <select 
        value={selectedGroupId} 
        onChange={(e) => handleGroupChange(e.target.value)}
        className="w-full h-10 sm:h-12 px-3 sm:px-4 py-2 sm:py-3 text-sm border rounded-md focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 bg-white/80 border-purple-200 font-medium"
      >
        <option value="">Select a group</option>
        {data.groups.map((group: {id: string; name: string; memberCount: number}) => (
          <option key={group.id} value={group.id}>
            {group.name} ({group.memberCount} members)
          </option>
        ))}
      </select>

      {loading && selectedGroupId && (
        <div className="flex items-center gap-2 mt-2">
          <BarLoader height={2} width={50} />
          <span className="text-xs sm:text-sm text-gray-600 font-medium">Loading group members...</span>
        </div>
      )}
    </div>
  )
}

export default GroupSelector
