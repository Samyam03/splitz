import { api } from '@/convex/_generated/api'
import { useConvexQuery, useConvexMutation } from '@/hooks/useConvexQuery'
import React, { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { ArrowRightLeft, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { toast } from 'sonner'

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
  const deleteSettlement = useConvexMutation(api.settlements.deleteSettlement)
  const [deletingSettlements, setDeletingSettlements] = useState<Set<string>>(new Set())

  if(!settlements || !settlements.length){
    return(
      <Card className="shadow-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50">
        <CardContent className="p-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
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

  const canDeleteSettlement = (settlement: any) => {
    if (!currentUser.data?._id) return false
    return (
      settlement.createdBy === currentUser.data._id ||
      settlement.paidByUserId === currentUser.data._id
    )
  }

  const handleDeleteSettlement = async (settlementId: string) => {
    if (!confirm('Are you sure you want to delete this settlement? This action cannot be undone.')) {
      return
    }

    setDeletingSettlements(prev => new Set(prev).add(settlementId))
    
    try {
      await deleteSettlement.mutate({ settlementId: settlementId as any })
      toast.success('Settlement deleted successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete settlement')
    } finally {
      setDeletingSettlements(prev => {
        const newSet = new Set(prev)
        newSet.delete(settlementId)
        return newSet
      })
    }
  }

  return (
    <div className="space-y-4">
      {settlements.map((settlement, index)=>{
        const payer = getUserDetails(settlement.paidByUserId)
        const receiver = getUserDetails(settlement.receivedByUserId)
        const isCurrentUserPayer = settlement.paidByUserId === currentUser.data?._id
        const isCurrentUserReceiver = settlement.receivedByUserId === currentUser.data?._id

        return(
          <Card key={settlement.id || `settlement-${index}`} className="shadow-lg border border-gray-200 bg-gradient-to-br from-white to-blue-50 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"> 
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-sm">
                    <ArrowRightLeft className="w-6 h-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-blue-700 text-xl mb-1 truncate" title={settlement.note || 'Settlement'}>
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
                    <div className={`text-2xl font-bold ${isCurrentUserPayer ? 'text-blue-600' : isCurrentUserReceiver ? 'text-blue-500' : 'text-blue-400'}`}>
                      ${settlement.amount.toFixed(2)}
                    </div>
                    {isGroupSettlement ?(
                      <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
                        Group Settlement
                      </Badge>
                    ):(
                      <div className="text-sm text-gray-600">
                        {isCurrentUserPayer ? (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            You sent payment
                          </span>
                        ) : isCurrentUserReceiver ? (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5l-9-2 9 18 9-18-9 2zm0 0v8" />
                            </svg>
                            You received payment
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                            </svg>
                            {payer.name} paid {receiver.name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Delete Button */}
                  {canDeleteSettlement(settlement) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSettlement(settlement._id || settlement.id)}
                      disabled={deletingSettlements.has(settlement._id || settlement.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-8 px-3"
                    >
                      {deletingSettlements.has(settlement._id || settlement.id) ? (
                        <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  )}
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

