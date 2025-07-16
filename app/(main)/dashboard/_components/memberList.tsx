import React from 'react'
import Link from 'next/link'
import { User, Crown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getUserColor } from '@/lib/userColors'

interface MemberBalance {
    userId: string;
    name: string;
    imageUrl?: string;
    balance: number;
    role: string;
}

interface MemberListProps {
    members: MemberBalance[];
    currentUserId?: string;
}

const MemberList = ({ members, currentUserId }: MemberListProps) => {
    if(!members || members.length === 0){
        return (
            <div className="text-center py-6 sm:py-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <p className="text-gray-700 font-medium text-sm sm:text-base">All settled up!</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">No outstanding balances with group members</p>
            </div>
        )
    }
    
    // Ensure unique members by userId to prevent duplicate keys
    const uniqueMembers = members.reduce((acc, member) => {
        if (!acc.find(m => m.userId === member.userId)) {
            acc.push(member);
        }
        return acc;
    }, [] as MemberBalance[]);
    
    return (
        <div className="space-y-1.5 sm:space-y-2">
            {uniqueMembers.map((member, index) => {
                const balance = member.balance;
                const isPositive = balance > 0;
                const isCurrentUser = currentUserId && member.userId === currentUserId;
                const isAdmin = member.role === 'admin';
                const userColor = getUserColor(member.userId);
                return (
                    <Link key={`${member.userId}-${index}`} href={`/member/${member.userId}`} className="block group">
                        <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gradient-to-r from-white to-slate-50/60 hover:from-slate-50 hover:to-green-50 rounded-xl border border-slate-200/50 hover:border-green-200 transition-colors gap-2 sm:gap-0">
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                                <Avatar className={`h-7 w-7 sm:h-10 sm:w-10 ring-2 ${userColor.ring} shadow-sm`}>
                                    {member.imageUrl ? (
                                        <AvatarImage src={member.imageUrl} alt={member.name} />
                                    ) : (
                                        <AvatarFallback className={`${userColor.bg} ${userColor.text} font-semibold text-xs sm:text-sm`}>
                                            {member.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                        <span className="font-medium text-gray-800 text-xs sm:text-sm group-hover:text-slate-800 transition-colors truncate">
                                            {member.name}
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
                                        {member.role}
                                    </p>
                                </div>
                            </div>
                            <div className="text-center sm:text-right flex-shrink-0 ml-2 sm:ml-4">
                                <p className={`text-xs sm:text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                    {isPositive ? '+' : ''}${Math.abs(balance).toFixed(2)}
                                </p>
                                <p className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                    {isPositive ? 'owes you' : 'you owe'}
                                </p>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    )
}

export default MemberList 