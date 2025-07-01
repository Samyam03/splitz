import { ArrowUp, ArrowDown } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import React from 'react'
import { getUserColor } from '@/lib/userColors';

interface BalanceSummaryProps {
  balances: any;
}

const BalanceSummary = ({ balances }: BalanceSummaryProps) => {

    if (!balances) return null;
    
    const {oweDetails} = balances;

    if (!oweDetails) return null;

    // More robust checks for the data
    const youAreOwed = oweDetails.youAreOwed || [];
    const youOwe = oweDetails.youOwe || [];
    
    const hasOwed = Array.isArray(youAreOwed) && youAreOwed.length > 0;
    const hasOwing = Array.isArray(youOwe) && youOwe.length > 0;

  return (  
    <div className="space-y-4 h-full">
      {!hasOwed && !hasOwing && (
        <div className="text-center py-8 space-y-3 flex flex-col justify-center h-full">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <ArrowUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-gray-700 font-semibold text-sm">All settled up!</p>
            <p className="text-xs text-gray-500 mt-1">You don't owe anyone and nobody owes you</p>
          </div>
        </div>
      )}

      {hasOwed && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-green-700 pb-2 border-b border-green-200/60 sticky top-0 bg-white/95 backdrop-blur-sm">
            <div className="p-1 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-sm">
              <ArrowUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span>You are owed</span>
            <div className="ml-auto bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {youAreOwed.length}
            </div>
          </div>
          <div className="space-y-1.5">
            {youAreOwed.map((item:any)=>{
              const userColor = getUserColor(item.userId);
              return (
                <Link 
                  href={`/user/${item.userId}`} 
                  key={item.userId}
                  className="block group"
                >
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 hover:from-green-100 hover:to-emerald-100 rounded-xl border border-green-200/50 hover:border-green-300/70 transition-all duration-300 hover:shadow-md group-hover:scale-[1.02]">
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-7 w-7 ring-2 ${userColor.ring} shadow-sm`}>
                        <AvatarImage src={item.imageUrl} />
                        <AvatarFallback className={`${userColor.bg} ${userColor.text} font-semibold text-xs`}>
                          {item.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-800 text-sm truncate group-hover:text-green-800 transition-colors">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-green-600 group-hover:text-green-700 transition-colors">
                        +${item.amount.toFixed(2)}
                      </span>
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {hasOwing && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-700 pb-2 border-b border-red-200/60 sticky top-0 bg-white/95 backdrop-blur-sm">
            <div className="p-1 bg-gradient-to-br from-red-400 to-rose-500 rounded-lg shadow-sm">
              <ArrowDown className="w-3.5 h-3.5 text-white" />
            </div>
            <span>You owe</span>
            <div className="ml-auto bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {youOwe.length}
            </div>
          </div>
          <div className="space-y-1.5">
            {youOwe.map((item:any)=>{
              const userColor = getUserColor(item.userId);
              return (
                <Link 
                  href={`/user/${item.userId}`} 
                  key={item.userId}
                  className="block group"
                >
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50/80 to-rose-50/80 hover:from-red-100 hover:to-rose-100 rounded-xl border border-red-200/50 hover:border-red-300/70 transition-all duration-300 hover:shadow-md group-hover:scale-[1.02]">
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-7 w-7 ring-2 ${userColor.ring} shadow-sm`}>
                        <AvatarImage src={item.imageUrl} />
                        <AvatarFallback className={`${userColor.bg} ${userColor.text} font-semibold text-xs`}>
                          {item.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-800 text-sm truncate group-hover:text-red-800 transition-colors">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-red-600 group-hover:text-red-700 transition-colors">
                        -${item.amount.toFixed(2)}
                      </span>
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default BalanceSummary
