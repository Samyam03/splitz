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
    <div className="space-y-3">
      {!hasOwed && !hasOwing && (
        <div className="text-center py-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <ArrowUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-gray-700 font-medium text-sm">All settled up!</p>
          <p className="text-xs text-gray-500 mt-1">You don't owe anyone and nobody owes you</p>
        </div>
      )}

      {hasOwed && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-green-700 pb-1.5 border-b border-green-100">
            <ArrowUp className="w-3 h-3" />
            <span>You are owed</span>
            <div className="ml-auto bg-green-100 text-green-700 text-xs font-medium px-1.5 py-0.5 rounded-full">
              {youAreOwed.length}
            </div>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {youAreOwed.map((item:any)=>{
              const userColor = getUserColor(item.userId);
              return (
                <Link 
                  href={`/user/${item.userId}`} 
                  key={item.userId}
                  className="block group"
                >
                  <div className="flex items-center justify-between p-2 bg-white/60 hover:bg-green-50 rounded-lg border border-gray-200/50 hover:border-green-200 transition-all duration-200 hover:shadow-sm">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Avatar className={`h-6 w-6 ${userColor.ring} flex-shrink-0`}>
                        <AvatarImage src={item.imageUrl} />
                        <AvatarFallback className={`${userColor.bg} ${userColor.text} font-medium text-xs`}>
                          {item.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-900 text-xs truncate">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-green-600 flex-shrink-0 ml-2">
                      +${item.amount.toFixed(2)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {hasOwing && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-red-700 pb-1.5 border-b border-red-100">
            <ArrowDown className="w-3 h-3" />
            <span>You owe</span>
            <div className="ml-auto bg-red-100 text-red-700 text-xs font-medium px-1.5 py-0.5 rounded-full">
              {youOwe.length}
            </div>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {youOwe.map((item:any)=>{
              const userColor = getUserColor(item.userId);
              return (
                <Link 
                  href={`/user/${item.userId}`} 
                  key={item.userId}
                  className="block group"
                >
                  <div className="flex items-center justify-between p-2 bg-white/60 hover:bg-red-50 rounded-lg border border-gray-200/50 hover:border-red-200 transition-all duration-200 hover:shadow-sm">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Avatar className={`h-6 w-6 ${userColor.ring} flex-shrink-0`}>
                        <AvatarImage src={item.imageUrl} />
                        <AvatarFallback className={`${userColor.bg} ${userColor.text} font-medium text-xs`}>
                          {item.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-900 text-xs truncate">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-red-600 flex-shrink-0 ml-2">
                      -${item.amount.toFixed(2)}
                    </span>
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
