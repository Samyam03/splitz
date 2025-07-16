'use client'

import { useParams, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useConvexQuery, useConvexMutation } from '@/hooks/useConvexQuery'
import { api } from '@/convex/_generated/api'
import BarLoader from 'react-spinners/BarLoader'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon, ArrowRightLeft, DollarSign, Users, User, Calculator, TrendingUp, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { getUserColor } from '@/lib/userColors'
import { toast } from 'sonner'
import SettlementsList from '@/components/settlementsList'
import { Id } from '@/convex/_generated/dataModel'

const SettlementPage = () => {
    const params = useParams()
    const router = useRouter()
  const { type, id } = params

  // Form states
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [selectedReceiver, setSelectedReceiver] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Queries
  const { data: settlementData, loading } = useConvexQuery(api.settlements.getSettlementData, {
    entityType: type as string,
    entityid: id as Id<"users"> | Id<"groups">
  })

  const { data: currentUser } = useConvexQuery(api.users.getUser)

  // Fetch settlement history
  const { data: historyData } = useConvexQuery(
    type === 'user' ? api.expense.getExpensesBetweenUsers : api.groups.getGroupExpenses,
    type === 'user' ? { userId: id as string } : { groupId: id as string }
  )

  // Mutations
  const createSettlement = useConvexMutation(api.settlements.createSettlement)

  // Handle form submission
  const handleCreateSettlement = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (type === 'user' && !selectedReceiver) {
      toast.error('Please select who will receive the payment')
      return
    }

    if (type === 'group' && !selectedReceiver) {
      toast.error('Please select a group member to settle with')
      return
    }

    setIsSubmitting(true)

    try {
      await createSettlement.mutate({
        amount: parseFloat(amount),
        note: note.trim() || undefined,
        paidByUserId: currentUser?._id as Id<"users">,
        receivedByUserId: selectedReceiver as Id<"users">,
        groupId: type === 'group' ? (id as Id<"groups">) : undefined,
      })

      toast.success('Settlement created successfully!')
      setAmount('')
      setNote('')
      setSelectedReceiver('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create settlement')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="text-center space-y-2 sm:space-y-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <BarLoader color="#3b82f6" width={200} />
              <p className="text-gray-600 font-medium text-sm sm:text-base">Loading settlement data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!settlementData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="text-center space-y-2 sm:space-y-3 p-4 sm:p-6 bg-white rounded-xl shadow-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto">
                <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">No Settlement Data</h3>
              <p className="text-gray-600 text-sm sm:text-base">Settlement information is not available</p>
              <Button onClick={() => router.back()} variant="outline" className="mt-2 sm:mt-3 text-sm">
                <ArrowLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isUserSettlement = settlementData.type === 'user'
  const isGroupSettlement = settlementData.type === 'group'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-1.5 sm:gap-2 text-sm"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-1.5 sm:p-2 rounded-lg ${isUserSettlement 
                ? 'bg-blue-100' 
                : 'bg-purple-100'
              }`}>
                {isUserSettlement ? (
                  <User className={`w-4 h-4 sm:w-5 sm:h-5 ${isUserSettlement ? 'text-blue-600' : 'text-purple-600'}`} />
                ) : (
                  <Users className={`w-4 h-4 sm:w-5 sm:h-5 ${isUserSettlement ? 'text-blue-600' : 'text-purple-600'}`} />
                )}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {isUserSettlement ? 'Personal Settlement' : 'Group Settlement'}
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm">
                  {isUserSettlement ? 'Settle expenses between you and another person' : 'Manage group expense settlements'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Left Side - Settlement Information */}
          <div className="lg:col-span-3">
            {isUserSettlement && (
              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 h-full">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-700 flex items-center gap-1.5 sm:gap-2">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    Settlement with {settlementData.counterpart.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {/* User Info Section */}
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg">
                    <Avatar className="h-12 w-12 sm:h-16 sm:w-16 ring-2 ring-blue-200">
                      <AvatarImage src={settlementData.counterpart.imageUrl} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-lg sm:text-xl">
                        {settlementData.counterpart.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">{settlementData.counterpart.name}</h3>
                      <p className="text-gray-600 text-sm">{settlementData.counterpart.email}</p>
                    </div>
                  </div>

                  {/* Balance Display */}
                  <div className="space-y-3 sm:space-y-4">
                    {/* You Are Owed */}
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          <h4 className="font-semibold text-green-700 text-sm sm:text-base">You are owed</h4>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-green-600">
                          ${settlementData.youAreOwed.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* You Owe */}
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                          <h4 className="font-semibold text-red-700 text-sm sm:text-base">You owe</h4>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-red-600">
                          ${settlementData.youOwe.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Net Balance */}
                    <div className="p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          <h4 className="font-semibold text-gray-700 text-sm sm:text-base">Net Balance</h4>
                        </div>
                        <div className={`text-xl sm:text-2xl font-bold ${
                          settlementData.netBalance > 0 ? 'text-green-600' : 
                          settlementData.netBalance < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {settlementData.netBalance >= 0 ? '+' : ''}${settlementData.netBalance.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isGroupSettlement && (
              <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-violet-50 h-full">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-700 flex items-center gap-1.5 sm:gap-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    {settlementData.group.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="p-3 bg-white rounded-lg">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">{settlementData.group.name}</h3>
                    {settlementData.group.description && (
                      <p className="text-gray-600 text-xs sm:text-sm">{settlementData.group.description}</p>
                    )}
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                      {settlementData.balances.length} members
                    </p>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                      Member Balances
                    </h4>
                    <div className="space-y-2 max-h-[250px] sm:max-h-[300px] overflow-y-auto">
                      {settlementData.balances
                        .filter((balance: any) => balance.userId !== currentUser?._id)
                        .map((balance: any) => {
                          const userColor = getUserColor(balance.userId)
                          return (
                            <div key={balance.userId} className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Avatar className={`h-6 w-6 sm:h-8 sm:w-8 ring-1 ${userColor.ring}`}>
                                  <AvatarImage src={balance.imageUrl} />
                                  <AvatarFallback className={`${userColor.bg} ${userColor.text} text-xs sm:text-sm font-semibold`}>
                                    {balance.name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-gray-800 text-sm sm:text-base">{balance.name}</span>
                              </div>
                              <div>
                                {balance.netBalance > 0 ? (
                                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                    +${balance.netBalance.toFixed(2)}
                                  </Badge>
                                ) : balance.netBalance < 0 ? (
                                  <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                                    ${balance.netBalance.toFixed(2)}
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs">
                                    Settled
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Settlement Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50 h-full">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-base sm:text-lg font-semibold text-gray-700 flex items-center gap-1.5 sm:gap-2">
                  <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  Create Settlement
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-3 sm:p-6">
                <form onSubmit={handleCreateSettlement} className="space-y-3 sm:space-y-4">
                  {/* Receiver Selection */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm font-semibold text-gray-800">
                      {isUserSettlement ? 'Settlement Direction' : 'Settle With'}
                    </Label>
                    
                    {isUserSettlement ? (
                      <Button
                        type="button"
                        variant={selectedReceiver === settlementData.counterpart.userId ? "default" : "outline"}
                        onClick={() => setSelectedReceiver(settlementData.counterpart.userId)}
                        className={`w-full p-3 sm:p-4 h-auto justify-start text-sm ${
                          selectedReceiver === settlementData.counterpart.userId 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-white hover:bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="text-left flex items-center gap-2 sm:gap-3 w-full">
                          <ArrowRightLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <div className="flex-1">
                            <div className="font-semibold text-sm sm:text-base">Pay {settlementData.counterpart.name}</div>
                            <div className="text-xs sm:text-sm opacity-80">You send money to them</div>
                          </div>
                        </div>
                      </Button>
                    ) : (
                      <select
                        value={selectedReceiver}
                        onChange={(e) => setSelectedReceiver(e.target.value)}
                        className="w-full p-2.5 sm:p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-400 bg-white text-sm"
                        required
                      >
                        <option value="">Select a group member...</option>
                        {settlementData.balances
                          .filter((balance: any) => balance.userId !== currentUser?._id)
                          .map((balance: any) => (
                            <option key={balance.userId} value={balance.userId}>
                              {balance.name} ({balance.netBalance > 0 ? `+$${balance.netBalance.toFixed(2)}` : balance.netBalance < 0 ? `$${balance.netBalance.toFixed(2)}` : 'Settled'})
                            </option>
                          ))
                        }
                      </select>
                    )}
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="amount" className="text-xs sm:text-sm font-semibold text-gray-800">Settlement Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="pl-8 sm:pl-10 h-10 sm:h-12 text-base sm:text-lg font-semibold bg-white border-green-200 focus:ring-2 focus:ring-green-500 focus:border-green-400"
                        required
                      />
                    </div>
                  </div>

                  {/* Note Input */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="note" className="text-xs sm:text-sm font-semibold text-gray-800">Add a Note (Optional)</Label>
                    <Textarea
                      id="note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add details about this settlement..."
                      className="min-h-[80px] sm:min-h-[100px] bg-white border-green-200 focus:ring-2 focus:ring-green-500 focus:border-green-400 resize-none text-sm"
                      maxLength={200}
                    />
                    <div className="text-xs text-gray-500 text-right">{note.length}/200</div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || !amount || !selectedReceiver}
                    className="w-full h-10 sm:h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm sm:text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5 sm:mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                        Create Settlement
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Settlement History */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                Settlement History
              </div>
              
              {historyData?.settlements && historyData.settlements.length > 0 && (
                <span className="text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                  {historyData.settlements.length} settlement{historyData.settlements.length !== 1 ? 's' : ''}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-3 sm:p-6">
            {historyData?.settlements && historyData.settlements.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                  <SettlementsList 
                    settlements={historyData.settlements} 
                    isGroupSettlement={isGroupSettlement}
                    userLookUpMap={
                      isUserSettlement && historyData.otherUser 
                        ? { 
                            [historyData.otherUser.id]: historyData.otherUser,
                            [currentUser?._id || '']: currentUser 
                          }
                        : historyData.userLookUpMap || {}
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <ArrowRightLeft className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">No settlements yet</h3>
                  <p className="text-gray-600 text-sm">
                    Your settlement history will appear here once you start making payments.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SettlementPage
