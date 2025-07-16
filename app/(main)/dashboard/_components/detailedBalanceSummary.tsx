import { ArrowUp, ArrowDown } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React from 'react'
import { getUserColor } from '@/lib/userColors';

interface DetailedBalanceSummaryProps {
  balances: any;
}

const DetailedBalanceSummary = ({ balances }: DetailedBalanceSummaryProps) => {

    if (!balances) return null;
    
    const {oweDetails} = balances;

    if (!oweDetails) return null;

    // More robust checks for the data
    const youAreOwed = oweDetails.youAreOwed || [];
    const youOwe = oweDetails.youOwe || [];
    
    const hasOwed = Array.isArray(youAreOwed) && youAreOwed.length > 0;
    const hasOwing = Array.isArray(youOwe) && youOwe.length > 0;

  return (  
    <div className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 h-full">
        {/* You Are Owed Section - Always Visible */}
        <div>
          <div className="h-full flex flex-col bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl border border-green-200/30 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-green-200/50 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-sm">
                <ArrowUp className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-green-800">You are owed</h4>
                <p className="text-xs text-green-600">Pending settlements</p>
              </div>
              <div className="bg-green-100 text-green-700 text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-sm border border-green-200/50">
                {youAreOwed.length}
              </div>
            </div>
            <div className="space-y-1.5 sm:space-y-2 flex-1 overflow-y-auto pr-1">
              {hasOwed ? (
                youAreOwed.map((item:any)=>{
                  const userColor = getUserColor(item.userId);
                  return (
                    <div 
                      key={item.userId}
                      className="flex items-center justify-between p-2 sm:p-3 bg-white/80 hover:bg-white rounded-lg border border-green-200/30 shadow-sm transition-all duration-200 hover:shadow-md hover:border-green-300/50"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <Avatar className={`h-6 w-6 sm:h-7 sm:w-7 ${userColor.ring} flex-shrink-0 shadow-sm`}>
                          <AvatarImage src={item.imageUrl} />
                          <AvatarFallback className={`${userColor.bg} ${userColor.text} font-semibold text-xs`}>
                            {item.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-900 text-xs sm:text-sm truncate block">{item.name}</span>
                          <span className="text-xs text-gray-500">Pending payment</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2 sm:ml-3">
                        <span className="text-xs sm:text-sm font-bold text-green-600 block">
                          +${item.amount.toFixed(2)}
                        </span>
                        <span className="text-xs text-green-500">Owed to you</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <p className="text-gray-700 font-medium text-xs sm:text-sm">You are not owed money</p>
                    <p className="text-xs text-gray-500 mt-1">No pending settlements</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* You Owe Section - Always Visible */}
        <div>
          <div className="h-full flex flex-col bg-gradient-to-br from-red-50/50 to-rose-50/50 rounded-xl border border-red-200/30 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-red-200/50 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-400 to-rose-500 rounded-lg shadow-sm">
                <ArrowDown className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-red-800">You owe</h4>
                <p className="text-xs text-red-600">Outstanding payments</p>
              </div>
              <div className="bg-red-100 text-red-700 text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-sm border border-red-200/50">
                {youOwe.length}
              </div>
            </div>
            <div className="space-y-1.5 sm:space-y-2 flex-1 overflow-y-auto pr-1">
              {hasOwing ? (
                youOwe.map((item:any)=>{
                  const userColor = getUserColor(item.userId);
                  return (
                    <div 
                      key={item.userId}
                      className="flex items-center justify-between p-2 sm:p-3 bg-white/80 hover:bg-white rounded-lg border border-red-200/30 shadow-sm transition-all duration-200 hover:shadow-md hover:border-red-300/50"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <Avatar className={`h-6 w-6 sm:h-7 sm:w-7 ${userColor.ring} flex-shrink-0 shadow-sm`}>
                          <AvatarImage src={item.imageUrl} />
                          <AvatarFallback className={`${userColor.bg} ${userColor.text} font-semibold text-xs`}>
                            {item.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-900 text-xs sm:text-sm truncate block">{item.name}</span>
                          <span className="text-xs text-gray-500">Waiting for payment</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2 sm:ml-3">
                        <span className="text-xs sm:text-sm font-bold text-red-600 block">
                          -${item.amount.toFixed(2)}
                        </span>
                        <span className="text-xs text-red-500">You owe them</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    </div>
                    <p className="text-gray-700 font-medium text-xs sm:text-sm">You don't owe anyone</p>
                    <p className="text-xs text-gray-500 mt-1">No outstanding payments</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailedBalanceSummary 