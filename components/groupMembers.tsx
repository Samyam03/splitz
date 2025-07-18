"use client";
import React from 'react';
import { useConvexQuery } from '@/hooks/useConvexQuery';
import { api } from '@/convex/_generated/api';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { getUserColor } from '@/lib/userColors';
import { Crown, User } from 'lucide-react';
import Link from 'next/link';
import { Id } from '@/convex/_generated/dataModel';

type GroupMember = {
  id: string;
  name: string;
  imageUrl?: string;
  role: string;
};

const GroupMembers = ({members}: {members: GroupMember[]}) => {

    const {data: currentUser} = useConvexQuery(api.users.getUser);

    if(!members || members.length ===0){
        return(
            <div className="text-center py-4 sm:py-8 space-y-2 sm:space-y-3 flex flex-col justify-center h-full">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-400 to-slate-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <User className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                    <p className="text-gray-700 font-semibold text-xs sm:text-sm">No members found</p>
                    <p className="text-xs text-gray-500 mt-1">This group doesn&apos;t have any members yet</p>
                </div>
            </div>
        )
    }
  return (
    <div className="space-y-1.5 sm:space-y-3">
      {members.map((member: GroupMember)=>{
            const isCurrentUser = member.id === currentUser?._id;
            const isAdmin = member.role === "admin";
            const userColor = getUserColor(member.id);

            return(
                <Link key={member.id} href={`/member/${member.id}`} className="block">
                    <div 
                        className="group hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-slate-50/60 hover:from-slate-50 hover:to-gray-50 rounded-xl border border-slate-200/50 hover:border-slate-300/70 p-2.5 sm:p-4 hover:scale-[1.02] cursor-pointer"
                    >
                    <div className="flex items-center gap-2.5 sm:gap-4">
                        <Avatar className={`h-7 w-7 sm:h-10 sm:w-10 ring-2 ${userColor.ring} shadow-sm group-hover:shadow-md transition-shadow`}>
                            <AvatarImage src={member.imageUrl} alt={member.name} />
                            <AvatarFallback className={`${userColor.bg} ${userColor.text} font-semibold text-xs sm:text-sm`}>
                                {member.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                <span className="font-medium text-gray-800 text-xs sm:text-sm group-hover:text-slate-800 transition-colors truncate">
                                    {member.name || 'Unknown User'}
                                </span>
                                {isCurrentUser && (
                                    <Badge
                                        variant="outline"
                                        className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 hover:from-blue-200 hover:to-indigo-200 transition-all duration-200 text-xs px-1 sm:px-2 py-0.5 sm:py-1"
                                    >
                                        You
                                    </Badge>
                                )}
                                {isAdmin && (
                                    <Badge
                                        className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200 hover:from-amber-200 hover:to-orange-200 transition-all duration-200 text-xs px-1 sm:px-2 py-0.5 sm:py-1 flex items-center gap-1"
                                    >
                                        <Crown className="w-2 h-2 sm:w-3 sm:h-3" />
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 capitalize">
                                {member.role || 'Member'}
                            </p>
                        </div>
                    </div>
                </div>
                </Link>
            )
      })}
    </div>
  );
};

export default GroupMembers;
