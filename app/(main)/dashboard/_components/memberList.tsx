import React from 'react'
import Link from 'next/link'
import { User } from 'lucide-react'

interface MemberBalance {
    userId: string;
    name: string;
    imageUrl?: string;
    balance: number;
    role: string;
}

interface MemberListProps {
    members: MemberBalance[];
}

const MemberList = ({ members }: MemberListProps) => {
    if(!members || members.length === 0){
        return (
            <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-gray-700 font-medium">All settled up!</p>
                <p className="text-sm text-gray-500 mt-1">No outstanding balances with group members</p>
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
        <div className="space-y-2">
            {uniqueMembers.map((member, index) => {
                const balance = member.balance;
                const isPositive = balance > 0;
                
                return (
                    <Link key={`${member.userId}-${index}`} href={`/member/${member.userId}`} className="block group">
                        <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-green-50 rounded-lg border border-gray-200 hover:border-green-200 transition-colors">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="flex items-center justify-center bg-green-100 rounded-lg w-8 h-8 flex-shrink-0">
                                    {member.imageUrl ? (
                                        <img 
                                            src={member.imageUrl} 
                                            alt={member.name}
                                            className="w-8 h-8 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <User className="w-4 h-4 text-green-600" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-gray-900 truncate text-sm">
                                        {member.name}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {member.role}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                                <p className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
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