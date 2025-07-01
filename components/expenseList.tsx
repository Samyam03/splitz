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
import { Avatar, AvatarImage } from './ui/avatar'
import { AvatarFallback } from '@radix-ui/react-avatar'

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

interface ExpenseListProps {
  expenses: Expense[]
  showOtherPerson?: boolean
  isGroupExpense?: boolean
  otherUserId?: string | null
  userLookUpMap?: Record<string, any>
}

const ExpenseList = ({
  expenses,
  showOtherPerson = true,
  isGroupExpense = false,
  otherUserId = null,
  userLookUpMap = {},
}: ExpenseListProps) => {

  const currentUser = useConvexQuery(api.users.getUser)

  const deleteExpense = useConvexMutation(api.expense.deleteExpense) 

  if (!expenses || !expenses.length ) {
    return(
      <Card className="shadow-lg border-0 bg-gradient-to-br from-gray-50 to-slate-50">
        <CardContent className="p-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-slate-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold">No expenses found</p>
            <p className="text-sm text-gray-500">Start adding expenses to see them here</p>
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
    <div className="space-y-4">
      {expenses.map((expense)=>{
          const payer = getUserDetails(expense.paidByUserId, expense)
          const isCurrentUserPayer = expense.paidByUserId === currentUser.data?._id
          const category = getCategoryById(expense.category)
          const CategoryIcon = getCategoryIcon(expense.category)
          const showDeleteButton = canDeleteExpense(expense)
          
          
          return (
            <Card key={expense._id + '-' + expense.date} className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-sm">
                      <CategoryIcon className="w-6 h-6 text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        {expense.description}
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {format(new Date(expense.date), "MMM d, yyyy")}
                        </span>
                        {showOtherPerson && (
                          <>
                          <span className="text-gray-400">•</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {isCurrentUserPayer ? "You" : payer.name} paid
                          </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${expense.amount.toFixed(2)}
                      </div>

                      {isGroupExpense ? (
                        <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
                          Group Expense
                        </Badge>
                      ) : (
                        <div className="text-sm text-gray-600">
                          {isCurrentUserPayer ?(
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              You paid
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              {payer.name} paid
                            </span>
                          )}
                          
                        </div>
                      )}
                    </div>
                    {showDeleteButton && (
                      <Button 
                        onClick={()=> handleDeleteExpense(expense)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>

                {expense.splits && expense.splits.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {expense.splits?.map((split,index)=>{
                        const splitUser = getUserDetails(split.userId, expense)
                        const isCurrentUser = split.userId === currentUser.data?._id

                        return(
                          <Badge key={split.userId} className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 flex items-center gap-2 px-3 py-1.5">
                            <Avatar className="h-5 w-5 ring-1 ring-blue-200">
                              <AvatarImage src={splitUser.imageUrl} />
                              <AvatarFallback className="text-xs font-semibold bg-blue-500 text-white">
                                {splitUser.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
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
                  </div>
                )}
              </CardContent>
            </Card>
          )
      })}
    </div>
  )
}

export default ExpenseList

