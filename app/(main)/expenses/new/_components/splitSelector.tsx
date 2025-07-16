'use client'
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getUserColor } from '@/lib/userColors';

interface Participant {
  id: string;
  name: string;
  email?: string;
  imageUrl?: string;
}

interface Split {
  userId: string;
  name: string;
  email?: string;
  imageUrl?: string;
  amount: number;
  percentage: number;
  paid: boolean;
}

interface SplitSelectorProps {
  type: string;
  amount: number;
  participants: Participant[];
  paidByUserId: string;
  onSplitChange: (splits: Split[]) => void;
}

const SplitSelector: React.FC<SplitSelectorProps> = ({
  type,
  amount,
  participants,
  paidByUserId,
  onSplitChange
}) => {
  const { user } = useUser()
  const [splits, setSplits] = useState<Split[]>([])
  const [totalPercentage, setTotalPercentage] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    // Validate inputs first
    const validAmount = !isNaN(amount) && amount > 0;
    
    if (!validAmount || participants.length === 0) {
      setSplits([])
      setTotalAmount(0)
      setTotalPercentage(0)
      onSplitChange([])
      return
    }

    let newSplits: Split[] = []

    if (type === 'equal') {
      const shareAmount = amount / participants.length
      newSplits = participants.map((participant: Participant) => ({
        userId: participant.id,
        name: participant.name,
        email: participant.email,
        imageUrl: participant.imageUrl,
        amount: shareAmount,
        percentage: 100 / participants.length,
        paid: participant.id === paidByUserId,
      }))
    } else if (type === "percentage") {
      const evenPercentage = 100 / participants.length
      newSplits = participants.map((participant: Participant) => ({
        userId: participant.id,
        name: participant.name,
        email: participant.email,
        imageUrl: participant.imageUrl,
        amount: (amount * evenPercentage) / 100,
        percentage: evenPercentage,
        paid: participant.id === paidByUserId,
      }))
    } else if (type === "exact") {
      const evenAmount = amount / participants.length
      newSplits = participants.map((participant: Participant) => ({
        userId: participant.id,
        name: participant.name,
        email: participant.email,
        imageUrl: participant.imageUrl,
        amount: evenAmount,
        percentage: (evenAmount / amount) * 100,
        paid: participant.id === paidByUserId,
      }))
    }

    setSplits(newSplits)
    
    // Calculate totals
    const totalAmt = newSplits.reduce((sum, split) => sum + split.amount, 0)
    const totalPercentage = newSplits.reduce((sum, split) => sum + split.percentage, 0)

    setTotalAmount(totalAmt)
    setTotalPercentage(totalPercentage)

    onSplitChange(newSplits)
  }, [type, amount, participants, paidByUserId, onSplitChange])

  const updatePercentageSplit = (userId: string, percentage: number) => {
    // Validate inputs
    const validAmount = !isNaN(amount) && amount > 0;
    const validPercentage = !isNaN(percentage) && percentage >= 0 && percentage <= 100;
    
    if (!validAmount || !validPercentage) return;

    const updatedSplits = splits.map(split => {
      if (split.userId === userId) {
        return {
          ...split,
          percentage: percentage,
          amount: (amount * percentage) / 100
        }
      }
      return split
    })
    setSplits(updatedSplits)
    const totalAmt = updatedSplits.reduce((sum, split) => sum + split.amount, 0)
    const totalPercentage = updatedSplits.reduce((sum, split) => sum + split.percentage, 0)

    setTotalAmount(totalAmt)
    setTotalPercentage(totalPercentage)

    onSplitChange(updatedSplits)
  }

  const updateExactSplit = (userId: string, newAmount: string) => {
    const parsedAmount = parseFloat(newAmount) || 0
    const validAmount = !isNaN(amount) && amount > 0;
    
    if (!validAmount) return;
    
    const updatedSplits = splits.map((split) => {
      if (split.userId === userId) {
        return {
          ...split,
          amount: parsedAmount,
          percentage: (parsedAmount / amount) * 100
        }
      }
      return split
    })

    setSplits(updatedSplits)

    const totalAmt = updatedSplits.reduce((sum, split) => sum + split.amount, 0)
    const totalPercentage = updatedSplits.reduce((sum, split) => sum + split.percentage, 0)

    setTotalAmount(totalAmt)
    setTotalPercentage(totalPercentage)

    onSplitChange(updatedSplits)
  }

  // Enhanced validation logic
  const validAmount = !isNaN(amount) && amount > 0;
  const hasValidSplits = splits.length > 0 && validAmount;
  const isPercentageValid = hasValidSplits && Math.abs(totalPercentage - 100) < 0.01
  const isAmountValid = hasValidSplits && Math.abs(totalAmount - amount) < 0.01

  // Don't render anything if amount is invalid
  if (!validAmount || participants.length === 0) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            {!validAmount ? "Enter a valid amount to configure splits" : "Add participants to configure splits"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="space-y-2 sm:space-y-3">
        {splits.map((split, index) => {
          const userColor = getUserColor(split.userId);
          const isCurrentUser = split.userId === user?.id;
          
          return (
            <Card key={split.userId || `split-${index}`} className="border-0 bg-gradient-to-r from-white to-gray-50/50 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Avatar className={`h-6 w-6 sm:h-8 sm:w-8 ring-2 ${userColor.ring}`}>
                      <AvatarImage src={split.imageUrl} />
                      <AvatarFallback className={`font-semibold text-xs sm:text-sm ${userColor.bg} ${userColor.text}`}>
                        {split.name.charAt(0)}
                      </AvatarFallback>           
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800 text-xs sm:text-sm">
                        {isCurrentUser ? "You" : split.name}
                      </span>
                      {split.paid && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                          Paid
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4">
                    {type === "equal" && (
                      <div className="text-right">
                        <div className="text-base sm:text-lg font-bold text-gray-800">
                          ${split.amount.toFixed(2)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {split.percentage.toFixed(1)}%
                        </div>
                      </div>
                    )}

                    {type === "percentage" && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full">
                        <div className="flex-1 min-w-[100px] sm:min-w-[120px]">
                          <Slider 
                            value={[split.percentage]} 
                            min={0} 
                            max={100} 
                            step={1} 
                            onValueChange={(value) => updatePercentageSplit(split.userId, value[0])}
                            className="w-full" 
                          />
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Input 
                            type="number" 
                            min="0" 
                            max="100" 
                            value={split.percentage.toFixed(1)} 
                            onChange={(e) => updatePercentageSplit(split.userId, parseFloat(e.target.value))}
                            className="w-12 sm:w-16 h-7 sm:h-8 text-center text-xs sm:text-sm"
                          />
                          <span className="text-xs sm:text-sm text-gray-500">%</span>
                        </div>
                        <div className="text-right min-w-[60px] sm:min-w-[70px]">
                          <div className="text-base sm:text-lg font-bold text-gray-800">
                            ${split.amount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}

                    {type === "exact" && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-xs sm:text-sm text-gray-500">$</span>
                          <Input 
                            type="number" 
                            min="0" 
                            max={amount * 2} 
                            step="0.01" 
                            value={split.amount.toFixed(2)} 
                            onChange={(e) => updateExactSplit(split.userId, e.target.value)}
                            className="w-16 sm:w-20 h-7 sm:h-8 text-center text-xs sm:text-sm"
                          />
                        </div>
                        <div className="text-right">
                          <div className="text-xs sm:text-sm text-gray-500">
                            {split.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Total Summary */}
      <div className={`bg-gradient-to-r rounded-lg border p-2.5 sm:p-3 ${
        isAmountValid 
          ? 'from-blue-50 to-indigo-50 border-blue-200' 
          : 'from-amber-50 to-orange-50 border-amber-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">
              Total
            </span>
            {isAmountValid && (
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
            )}
            {!isAmountValid && (
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full"></div>
            )}
          </div>
          <div className="text-right">
            <div className={`text-base sm:text-lg font-bold ${
              isAmountValid ? "text-blue-600" : "text-amber-600"
            }`}>
              ${totalAmount.toFixed(2)}
            </div>
            {type !== "equal" && (
              <div className={`text-xs ${
                isPercentageValid ? "text-blue-500" : "text-amber-500"
              }`}>
                ({totalPercentage.toFixed(1)}%)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validation Messages */}
      {hasValidSplits && type === "percentage" && !isPercentageValid && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-2.5 sm:p-3">
          <p className="text-xs sm:text-sm text-amber-700 flex items-center gap-1.5 sm:gap-2">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full"></span>
            The percentage does not add up to 100% (currently {totalPercentage.toFixed(1)}%)
          </p>
        </div>
      )}

      {hasValidSplits && type === "exact" && !isAmountValid && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-2.5 sm:p-3">
          <p className="text-xs sm:text-sm text-amber-700 flex items-center gap-1.5 sm:gap-2">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full"></span>
            The sum of these amounts (${totalAmount.toFixed(2)}) does not match the total amount of ${amount.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  )
}

export default SplitSelector