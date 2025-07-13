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
    <div className="space-y-4">
      {!hasOwed && !hasOwing && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <ArrowUp className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-gray-700 font-medium">All settled up!</p>
          <p className="text-sm text-gray-500 mt-1">You don't owe anyone and nobody owes you</p>
        </div>
      )}

      {hasOwed && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-green-700 pb-2 border-b border-green-100">
            <ArrowUp className="w-4 h-4" />
            <span>You are owed</span>
            <div className="ml-auto bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
              {youAreOwed.length}
            </div>
          </div>
          <div className="space-y-2">
            {youAreOwed.map((item:any)=>{
              const userColor = getUserColor(item.userId);
              return (
                <Link 
                  href={`/user/${item.userId}`} 
                  key={item.userId}
                  className="block group"
                >
                  <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-green-50 rounded-lg border border-gray-200 hover:border-green-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-8 w-8 ${userColor.ring}`}>
                        <AvatarImage src={item.imageUrl} />
                        <AvatarFallback className={`${userColor.bg} ${userColor.text} font-medium text-sm`}>
                          {item.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-900 text-sm truncate">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
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
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-red-700 pb-2 border-b border-red-100">
            <ArrowDown className="w-4 h-4" />
            <span>You owe</span>
            <div className="ml-auto bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
              {youOwe.length}
            </div>
          </div>
          <div className="space-y-2">
            {youOwe.map((item:any)=>{
              const userColor = getUserColor(item.userId);
              return (
                <Link 
                  href={`/user/${item.userId}`} 
                  key={item.userId}
                  className="block group"
                >
                  <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-red-50 rounded-lg border border-gray-200 hover:border-red-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-8 w-8 ${userColor.ring}`}>
                        <AvatarImage src={item.imageUrl} />
                        <AvatarFallback className={`${userColor.bg} ${userColor.text} font-medium text-sm`}>
                          {item.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-900 text-sm truncate">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-red-600">
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
