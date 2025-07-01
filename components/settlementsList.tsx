import { api } from '@/convex/_generated/api'
import { useConvexQuery } from '@/hooks/useConvexQuery'
import React from 'react'
import { Card, CardContent } from './ui/card'
import { ArrowRightLeft } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from './ui/badge'

interface Expense {
  id: string
  amount: number
  description: string
  paidByUserId: string
  date: string
  category: string
  createdBy: string
  split: Array<{
    userId: string
    amount: number
  }>
  // Add other expense properties as needed
}

interface SettlementsListProps {
  settlements: any[]
  isGroupSettlement?: boolean
  userLookUpMap?: Record<string, any>
}

const SettlementsList = ({
  settlements,
  isGroupSettlement = false,
  userLookUpMap = {},
}: SettlementsListProps) => {

  const currentUser = useConvexQuery(api.users.getUser)

  if(!settlements || !settlements.length){
    return(
      <Card className="shadow-lg border-0 bg-gradient-to-br from-gray-50 to-slate-50">
        <CardContent className="p-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-slate-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <ArrowRightLeft className="w-6 h-6 text-white" />
            </div>
            <p className="text-gray-700 font-semibold">No settlements found</p>
            <p className="text-sm text-gray-500">No settlements have been made yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  const getUserDetails = (userId:string, expense?: Expense)=>{
    return{
      name:
      userId === currentUser.data?._id ? "You" : userLookUpMap[userId]?.name|| "Other User",
      id: userId,
      imageUrl: userLookUpMap[userId]?.imageUrl || ""
    }

}

  return (
    <div className="space-y-4">
      {settlements.map((settlement, index)=>{
        const payer = getUserDetails(settlement.paidByUserId)
        const receiver = getUserDetails(settlement.receiverId)
        const isCurrentUserPayer = settlement.paidByUserId === currentUser.data?._id
        const isCurrentUserReceiver = settlement.receiverId === currentUser.data?._id

        return(
          <Card key={settlement.id || `settlement-${index}`} className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"> 
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl shadow-sm">
                    <ArrowRightLeft className="w-6 h-6 text-green-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-emerald-700 text-xl mb-1 truncate" title={settlement.note || 'Settlement'}>
                      {settlement.note ? settlement.note : 'Settlement'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {format (new Date(settlement.date), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${settlement.amount.toFixed(2)}
                    </div>
                    {isGroupSettlement ?(
                      <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
                        Group Settlement
                      </Badge>
                    ):(
                      <div className="text-sm text-gray-600">
                        {isCurrentUserPayer ? (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            You paid
                          </span>
                        ) : isCurrentUserReceiver ? (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            You received
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            {payer.name} paid {receiver.name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
      
    </div>
  )
}

export default SettlementsList

