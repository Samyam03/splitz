import React from 'react'
import Link from 'next/link'
import { Users } from 'lucide-react'

interface GroupListProps {
  groups: any;
}

const GroupList = ({ groups }: GroupListProps) => {
    if(!groups || groups.length === 0){
        return (
            <div className="text-center py-8 space-y-4 flex flex-col justify-center h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="text-gray-700 font-semibold text-sm">No groups yet</p>
                    <p className="text-xs text-gray-500 mt-1">Create your first group to start splitting expenses</p>
                </div>
            </div>
        )
    }
    
    return (
        <div className="space-y-2.5 h-full overflow-y-auto">
            {groups.map((group: any) => {
                const balance = group.balance || 0;
                const hasBalance = balance !== 0;
                
                return (
                    <Link key={group.id} href={`/group/${group.id}`} className="block group">
                        <div className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-blue-50/60 hover:from-blue-50 hover:to-indigo-50 rounded-xl border border-blue-200/50 hover:border-blue-300/70 p-4 group-hover:scale-[1.02]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full w-10 h-10 flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                                        <Users className="w-4.5 h-4.5 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-gray-900 truncate text-sm leading-tight group-hover:text-blue-800 transition-colors">{group.name}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                            <p className="text-xs text-gray-600 leading-tight font-medium">
                                                {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {hasBalance && (
                                    <div className="text-right flex-shrink-0 ml-4">
                                        <p className={`font-bold text-sm leading-tight transition-colors ${balance > 0 ? 'text-green-700 group-hover:text-green-800' : 'text-red-700 group-hover:text-red-800'}`}>
                                            {balance > 0 ? '+' : ''}${Math.abs(balance).toFixed(2)}
                                        </p>
                                        <div className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full mt-1 transition-colors ${balance > 0 ? 'text-green-700 bg-green-100 group-hover:bg-green-200' : 'text-red-700 bg-red-100 group-hover:bg-red-200'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${balance > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            {balance > 0 ? 'owed' : 'owe'}
                                        </div>
                                    </div>
                                )}
                                {!hasBalance && (
                                    <div className="text-right flex-shrink-0 ml-4">
                                        <div className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 group-hover:bg-gray-200 transition-colors">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></div>
                                            settled
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    )
}

export default GroupList
