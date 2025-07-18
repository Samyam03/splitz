import React from 'react'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { Id } from '@/convex/_generated/dataModel'

type GroupWithBalance = {
  _id: Id<'groups'>;
  name: string;
  description?: string;
  createdBy: Id<'users'>;
  members: Array<{
    userId: Id<'users'>;
    role: string;
    joinedAt: number;
  }>;
  id: Id<'groups'>;
  balance: number;
};

interface GroupListProps {
  groups: GroupWithBalance[];
}

const GroupList = ({ groups }: GroupListProps) => {
    if(!groups || groups.length === 0){
        return (
            <div className="text-center py-6 sm:py-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <p className="text-gray-700 font-medium text-sm sm:text-base">No groups yet</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Create your first group to start splitting expenses</p>
            </div>
        )
    }
    
    return (
        <div className="space-y-1.5 sm:space-y-2">
            {groups.map((group: GroupWithBalance) => {
                const balance = group.balance || 0;
                const hasBalance = balance !== 0;
                
                return (
                    <Link key={group.id} href={`/groups/${group.id}`} className="block group">
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <div className="flex items-center justify-center bg-blue-100 rounded-lg w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-gray-900 truncate text-xs sm:text-sm">{group.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            {hasBalance && (
                                <div className="text-right flex-shrink-0 ml-2 sm:ml-4">
                                    <p className={`text-xs sm:text-sm font-semibold ${balance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {balance > 0 ? '+' : ''}${Math.abs(balance).toFixed(2)}
                                    </p>
                                    <p className={`text-xs font-medium ${balance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {balance > 0 ? 'owed' : 'owe'}
                                    </p>
                                </div>
                            )}
                            {!hasBalance && (
                                <div className="text-right flex-shrink-0 ml-2 sm:ml-4">
                                    <p className="text-xs font-medium text-gray-500">
                                        settled
                                    </p>
                                </div>
                            )}
                        </div>
                    </Link>
                );
            })}
        </div>
    )
}

export default GroupList
