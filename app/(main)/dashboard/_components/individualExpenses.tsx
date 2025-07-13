import React from 'react'
import Link from 'next/link'
import { Receipt, Calendar, User, CheckCircle, Clock } from 'lucide-react'

interface IndividualExpense {
    id: string;
    description: string;
    amount: number;
    date: number;
    paidBy: string;
    yourShare: number;
    status: 'paid' | 'unpaid';
}

interface IndividualExpensesProps {
    expenses: IndividualExpense[];
}

const IndividualExpenses = ({ expenses }: IndividualExpensesProps) => {
    if(!expenses || expenses.length === 0){
        return (
            <div className="text-center py-8 space-y-4 flex flex-col justify-center h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <Receipt className="w-7 h-7 text-white" />
                </div>
                <div>
                    <p className="text-gray-700 font-bold text-base">No individual expenses</p>
                    <p className="text-sm text-gray-500 mt-2">Create expenses outside of groups to see them here</p>
                </div>
            </div>
        )
    }
    
    return (
        <div className="space-y-2.5 h-full overflow-y-auto">
            {expenses.map((expense) => {
                const isPaid = expense.status === 'paid';
                const isYouPaid = expense.paidBy === 'You' || expense.paidBy === 'Unknown User';
                
                return (
                    <Link key={expense.id} href={`/expenses/${expense.id}`} className="block group">
                        <div className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-blue-50/60 hover:from-blue-50 hover:to-indigo-50 rounded-xl border border-blue-200/50 hover:border-blue-300/70 p-4 group-hover:scale-[1.02]">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-bold text-gray-900 truncate text-sm leading-tight group-hover:text-blue-800 transition-colors">
                                            {expense.description}
                                        </h4>
                                        {isPaid ? (
                                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        ) : (
                                            <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-xs text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            <span className="truncate font-semibold">
                                                {isYouPaid ? 'You paid' : `Paid by ${expense.paidBy}`}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span className="font-semibold">
                                                {new Date(expense.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-right flex-shrink-0 ml-4">
                                    <div className="text-sm font-bold text-gray-900">
                                        ${expense.amount.toFixed(2)}
                                    </div>
                                    <div className={`text-xs font-bold px-2 py-1 rounded-full mt-1 ${
                                        isPaid 
                                            ? 'text-green-700 bg-green-100' 
                                            : 'text-orange-700 bg-orange-100'
                                    }`}>
                                        {isPaid ? 'Paid' : 'Pending'}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 font-semibold">
                                        Your share: ${expense.yourShare.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    )
}

export default IndividualExpenses 