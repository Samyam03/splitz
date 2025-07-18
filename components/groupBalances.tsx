"use client";
import { useConvexQuery } from '@/hooks/useConvexQuery';
import { api } from '@/convex/_generated/api';
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { getUserColor } from '@/lib/userColors';

type OwedBy = { from: string; amount: number };
type OwedTo = { to: string; amount: number };
type GroupBalance = {
  id: string;
  name: string;
  imageUrl?: string;
  totalBalance: number;
  owedBy?: OwedBy[];
  owes?: OwedTo[];
};

const GroupBalances = ({balances}: {balances: GroupBalance[]}) => {
    const {data: currentUser} = useConvexQuery(api.users.getUser);
    
    if (!balances?.length || !currentUser) {
        return (
            <div className="text-center py-6 sm:py-8 space-y-2 sm:space-y-3 flex flex-col justify-center h-full">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-400 to-slate-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                    <p className="text-gray-700 font-semibold text-xs sm:text-sm">No balance information</p>
                    <p className="text-xs text-gray-500 mt-1">Balance data is not available at the moment</p>
                </div>
            </div>
        );
    }

    const myBalance = balances.find((balance: GroupBalance) => balance.id === currentUser?._id);
    
    if (!myBalance) {
        return (
            <div className="text-center py-6 sm:py-8 space-y-2 sm:space-y-3 flex flex-col justify-center h-full">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                    <p className="text-gray-700 font-semibold text-xs sm:text-sm">Not a group member</p>
                    <p className="text-xs text-gray-500 mt-1">You are not currently a member of this group</p>
                </div>
            </div>
        );
    }
  
    const userMap = Object.fromEntries(balances.map((balance: GroupBalance) => [balance.id, balance]))

    const owedByMembers = myBalance.owedBy?.map(({from, amount}: OwedBy)=>({...userMap[from], amount})).filter((item: GroupBalance & {amount: number}) => item.id).sort((a, b)=> b.amount - a.amount) || []
    
    const owedToMembers = myBalance.owes?.map(({to, amount}: OwedTo)=>({...userMap[to], amount})).filter((item: GroupBalance & {amount: number}) => item.id).sort((a, b)=> b.amount - a.amount) || []
    
    const isAllSettledUp = myBalance.totalBalance ===0 && owedByMembers?.length ===0 && owedToMembers?.length ===0

    
    
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Balance Summary Card */}
            <div className={`p-4 sm:p-6 rounded-xl border-2 shadow-lg transition-all duration-300 ${
                myBalance.totalBalance > 0 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/60' 
                    : myBalance.totalBalance < 0 
                        ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200/60'
                        : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200/60'
            }`}>
                <div className="text-center space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                        <div className={`p-1.5 sm:p-2 rounded-lg shadow-sm ${
                            myBalance.totalBalance > 0 
                                ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                                : myBalance.totalBalance < 0 
                                    ? 'bg-gradient-to-br from-red-400 to-rose-500'
                                    : 'bg-gradient-to-br from-gray-400 to-slate-500'
                        }`}>
                            {myBalance.totalBalance > 0 ? (
                                <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            ) : myBalance.totalBalance < 0 ? (
                                <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            ) : (
                                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                            )}
                        </div>
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Your Balance</h3>
                    </div>
                    <div className={`text-2xl sm:text-3xl font-bold ${
                        myBalance.totalBalance > 0 
                            ? 'text-green-600' 
                            : myBalance.totalBalance < 0 
                                ? 'text-red-600'
                                : 'text-gray-600'
                    }`}>
                        {myBalance.totalBalance > 0 
                            ? `+$${myBalance.totalBalance.toFixed(2)}`
                            : myBalance.totalBalance < 0 
                                ? `-$${Math.abs(myBalance.totalBalance).toFixed(2)}`
                                : "$0.00"
                        }
                    </div>
                    <p className={`text-xs sm:text-sm font-medium ${
                        myBalance.totalBalance > 0 
                            ? 'text-green-700' 
                            : myBalance.totalBalance < 0 
                                ? 'text-red-700'
                                : 'text-gray-600'
                    }`}>
                        {myBalance.totalBalance > 0 
                            ? "You are owed money overall"
                            : myBalance.totalBalance < 0 
                                ? "You owe money overall"
                                : "You&apos;re all settled up"
                        }
                    </p>
                </div>
            </div>

           {isAllSettledUp ? (
            <div className="text-center py-6 sm:py-8 space-y-2 sm:space-y-3 flex flex-col justify-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                    <p className="text-green-700 font-semibold text-xs sm:text-sm">All settled up!</p>
                    <p className="text-xs text-green-600 mt-1">You don&apos;t owe anyone and nobody owes you in this group</p>
                </div>
            </div>
           ): (
            <div className="space-y-4 sm:space-y-6">
                {owedByMembers && owedByMembers.length>0 &&
                <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 rounded-xl border border-green-200/50 p-4 sm:p-6 shadow-lg">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-green-700 pb-3 sm:pb-4 border-b border-green-200/60">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-sm">
                    <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="text-sm sm:text-base">You are owed</span>
                  <div className="ml-auto bg-green-100 text-green-700 text-xs font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm">
                    {owedByMembers.length} {owedByMembers.length === 1 ? 'person' : 'people'}
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                  {owedByMembers.map((item: GroupBalance & {amount: number})=>{
                    const userColor = getUserColor(item.id);
                    return (
                      <Link 
                        href={`/member/${item.id}`} 
                        key={`owed-by-${item.id}`}
                        className="block group"
                      >
                        <div className="flex items-center justify-between p-3 sm:p-4 bg-white/70 hover:bg-white rounded-xl border border-green-200/30 hover:border-green-300/50 transition-all duration-300 hover:shadow-md group-hover:scale-[1.02]">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar className={`h-6 w-6 sm:h-7 sm:w-7 ring-2 ${userColor.ring} shadow-sm`}>
                              <AvatarImage src={item.imageUrl} />
                              <AvatarFallback className={`${userColor.bg} ${userColor.text} font-semibold text-xs`}>
                                {item.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-gray-800 text-xs sm:text-sm truncate group-hover:text-green-800 transition-colors">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-xs sm:text-sm font-bold text-green-600 group-hover:text-green-700 transition-colors">
                              +${item.amount.toFixed(2)}
                            </span>
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>}

              {owedToMembers && owedToMembers.length>0 &&
               <div className="bg-gradient-to-br from-red-50/80 to-rose-50/80 rounded-xl border border-red-200/50 p-4 sm:p-6 shadow-lg">
               <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-red-700 pb-3 sm:pb-4 border-b border-red-200/60">
                 <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-400 to-rose-500 rounded-lg shadow-sm">
                   <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                 </div>
                 <span className="text-sm sm:text-base">You owe</span>
                 <div className="ml-auto bg-red-100 text-red-700 text-xs font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm">
                   {owedToMembers.length} {owedToMembers.length === 1 ? 'person' : 'people'}
                 </div>
               </div>
               <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                 {owedToMembers.map((item: GroupBalance & {amount: number})=>{
                   const userColor = getUserColor(item.id);
                   return (
                     <Link 
                       href={`/member/${item.id}`} 
                       key={`owes-to-${item.id}`}
                       className="block group"
                     >
                       <div className="flex items-center justify-between p-3 sm:p-4 bg-white/70 hover:bg-white rounded-xl border border-red-200/30 hover:border-red-300/50 transition-all duration-300 hover:shadow-md group-hover:scale-[1.02]">
                         <div className="flex items-center gap-2 sm:gap-3">
                           <Avatar className={`h-6 w-6 sm:h-7 sm:w-7 ring-2 ${userColor.ring} shadow-sm`}>
                             <AvatarImage src={item.imageUrl} />
                             <AvatarFallback className={`${userColor.bg} ${userColor.text} font-semibold text-xs`}>
                               {item.name?.charAt(0) || 'U'}
                             </AvatarFallback>
                           </Avatar>
                           <span className="font-medium text-gray-800 text-xs sm:text-sm truncate group-hover:text-red-800 transition-colors">{item.name}</span>
                         </div>
                         <div className="flex items-center gap-1.5 sm:gap-2">
                           <span className="text-xs sm:text-sm font-bold text-red-600 group-hover:text-red-700 transition-colors">
                             -${item.amount.toFixed(2)}
                           </span>
                           <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         </div>
                       </div>
                     </Link>
                   );
                 })}
               </div>
             </div>}
               
            </div>
           )} 
        </div>
    );
};

export default GroupBalances;
