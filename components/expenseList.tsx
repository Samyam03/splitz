import { api } from '@/convex/_generated/api'
import { useConvexMutation, useConvexQuery } from '@/hooks/useConvexQuery'
import { Card, CardContent } from './ui/card'
import { getCategoryById, getCategoryIcon } from '@/lib/expenseCategories'
import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { Id } from '@/convex/_generated/dataModel'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { getUserColor } from '@/lib/userColors'

interface Expense {
  _id: string
  amount: number
  description: string
  paidByUserId: string
  date: number
  category: string
  createdBy: string
  splits: Array<{
    userId: string
    amount: number
    paid: boolean
  }>
  // Add other expense properties as needed
}

interface UserLookUp {
  [userId: string]: {
    name: string;
    imageUrl?: string;
  };
}

interface ExpenseListProps {
  expenses: Expense[]
  showOtherPerson?: boolean
  isGroupExpense?: boolean
  userLookUpMap?: UserLookUp
}

const ExpenseList = ({
  expenses,
  showOtherPerson = true,
  isGroupExpense = false,
  userLookUpMap = {},
}: ExpenseListProps) => {

  const currentUser = useConvexQuery(api.users.getUser)

  const deleteExpense = useConvexMutation(api.expense.deleteExpense) 

  if (!expenses || !expenses.length ) {
    return(
      <Card className="shadow-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50">
        <CardContent className="p-4 sm:p-6">
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-rose-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold text-sm sm:text-base">No expenses found</p>
            <p className="text-xs sm:text-sm text-gray-500">Start adding expenses to see them here</p>
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
  const canDeleteExpense = (expense: Expense) => {
    if(!currentUser.data?._id) return false
    return(
      expense.createdBy === currentUser.data._id ||
      expense.paidByUserId === currentUser.data._id
    )
  }

  const handleDeleteExpense = async(expense: Expense) => {
        const confirmed = window.confirm("Are you sure you want to delete this expense?")
        if(!confirmed) return
        try{
          await deleteExpense.mutate({
            expenseId: expense._id as Id<"expenses">
          })
          toast.success("Expense deleted successfully")
        } catch(error){
          toast.error("Failed to delete expense")
        }
  }

  return (
    <div className="space-y-2 sm:space-y-4">
      {expenses.map((expense)=>{
          const payer = getUserDetails(expense.paidByUserId, expense)
          const isCurrentUserPayer = expense.paidByUserId === currentUser.data?._id
          const category = getCategoryById(expense.category)
          const CategoryIcon = getCategoryIcon(expense.category)
          const showDeleteButton = canDeleteExpense(expense)
          
          
          return (
            <Card key={expense._id + '-' + expense.date} className={`shadow-lg border border-gray-200 ${isCurrentUserPayer ? 'bg-gradient-to-br from-white to-emerald-50' : 'bg-gradient-to-br from-white to-rose-50'} hover:shadow-xl transition-all duration-300 hover:scale-[1.01]`}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1">
                    <div className={`p-1.5 sm:p-2 ${isCurrentUserPayer ? 'bg-gradient-to-br from-emerald-100 to-emerald-200' : 'bg-gradient-to-br from-rose-100 to-rose-200'} rounded-xl shadow-sm`}>
                      <CategoryIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isCurrentUserPayer ? 'text-emerald-600' : 'text-rose-600'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-1.5">
                        {expense.description}
                      </h3>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-3">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {format(new Date(expense.date), "MMM d, yyyy")}
                        </span>
                        {showOtherPerson && (
                          <>
                          <span className="hidden sm:inline text-gray-400">•</span>
                          <span className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${isCurrentUserPayer ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {isCurrentUserPayer ? (
                              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            ) : (
                              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            )}
                            {isCurrentUserPayer ? "You paid" : `${payer.name} paid`}
                          </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 sm:gap-3">
                    <div className="text-right">
                      <div className={`text-lg sm:text-xl font-bold ${isCurrentUserPayer ? 'text-emerald-600' : 'text-red-600'}`}>
                        ${expense.amount.toFixed(2)}
                      </div>

                      {isGroupExpense ? (
                        <Badge className={`bg-gradient-to-r ${isCurrentUserPayer ? 'from-emerald-100 to-emerald-200 text-emerald-700 border-emerald-200' : 'from-rose-100 to-rose-200 text-rose-700 border-rose-200'} text-xs`}>
                          Group Expense
                        </Badge>
                      ) : (
                        <div className={`text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium ${isCurrentUserPayer ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                          {isCurrentUserPayer ?(
                            <span className="flex items-center gap-1 sm:gap-1.5">
                              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
                              </svg>
                              <span>You paid this</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 sm:gap-1.5">
                              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              <span>{payer.name} paid this</span>
                            </span>
                          )}
                          
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {(expense.splits && expense.splits.length > 0) || showDeleteButton ? (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                      {/* Users on the left */}
                      <div className="flex flex-wrap gap-1 sm:gap-1.5 flex-1">
                        {expense.splits?.map((split)=>{
                          const splitUser = getUserDetails(split.userId, expense)
                          const isCurrentUser = split.userId === currentUser.data?._id

                          return(
                            <Badge key={split.userId} className={`bg-gradient-to-r ${isCurrentUserPayer ? 'from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200' : 'from-rose-50 to-rose-100 text-rose-700 border-rose-200'} flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs`}>
                              {(() => {
                                const userColor = getUserColor(split.userId);
                                return (
                                  <Avatar className={`h-3 w-3 sm:h-4 sm:w-4 ring-1 ${userColor.ring}`}>
                                    <AvatarImage src={splitUser.imageUrl} />
                                    <AvatarFallback className={`flex items-center justify-center ${userColor.bg} ${userColor.text} font-semibold w-full h-full text-xs`}>
                                      {splitUser.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                );
                              })()}
                              <span className="font-medium">
                                {isCurrentUser ? "You" : splitUser.name}
                              </span>
                              <span className="font-bold">
                                ${split.amount.toFixed(2)}
                              </span>
                            </Badge>
                          )
                        })}
                      </div>
                      
                      {/* Delete button on the right */}
                      {showDeleteButton && (
                        <Button 
                          onClick={()=> handleDeleteExpense(expense)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 sm:gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 flex-shrink-0 text-xs sm:text-sm h-6 sm:h-8"
                        >
                          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>Delete</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )
      })}
    </div>
  )
}

export default ExpenseList

