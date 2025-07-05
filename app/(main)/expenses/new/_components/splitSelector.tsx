'use client'
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';


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
    if (!amount || amount <= 0 || participants.length === 0) {
      setSplits([])
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
    const parsedAmount = parseFloat(newAmount)||0
    
    const updatedSplits = splits.map((split)=>{
      if(split.userId === userId){
        return{
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

  const isPercentageValid = Math.abs(totalPercentage - 100) < 0.01
  const isAmountValid = Math.abs(totalAmount - amount) < 0.01

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {splits.map((split, index) => (
          <div key={split.userId || `split-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={split.imageUrl} />
                <AvatarFallback>{split.name.charAt(0)}</AvatarFallback>           
              </Avatar>
                           <span>
               {split.userId === user?.id ? "You" : split.name}
              </span>
             </div>

             {type === "equal" && (
              <div className="flex items-center space-x-2">
                ${split.amount.toFixed(2)} ({split.percentage.toFixed(1)}%)
              </div>
             )}

             {type ==="percentage" &&(
              <div>
                                 <Slider value={[split.percentage]} min={0} max={100} step={1} onValueChange={(value)=>updatePercentageSplit(split.userId, value[0])} />
                
                <div>
                  <Input type="number" min="0" max="100" value={split.percentage.toFixed(1)} onChange={(e)=>updatePercentageSplit(split.userId, parseFloat(e.target.value))}/>
                
                <span>
                  %
                </span>

                <span>
                  ${split.amount.toFixed(2)}
                </span>
                
                </div>
              </div>
             )}

             {type === "exact" && (
              <div>
                <div>
                </div>
                <div>
                  <span> $</span>
                    <Input type="number" min="0" max={amount*2} step="0.01" value={split.amount.toFixed(2)} onChange={(e)=>updateExactSplit(split.userId, e.target.value)}/>
                  <span>
                    {split.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
             )}
           </div>
         ))}
         <div>
          <span>
            Total
          </span>
          <div>
            <span className={`${isAmountValid ? "text-green-500" : "text-red-500"}`}>
              ${totalAmount.toFixed(2)}
            </span>
            {type!=="equal" &&(
              <span>
                ({totalPercentage.toFixed(1)}%)
              </span>
            )}
          </div>
         </div>

         {type ==="percentage" && !isPercentageValid &&(
          <div>
            The percentage does not add up to 100%
          </div>
         )}

         {type === "exact" && !isAmountValid &&(
          <div>
            The sum of these amount does not match the total amount of (${amount.toFixed(2)})
          </div>
         )}
      </div>
      
      
    </div>
  )
}

export default SplitSelector