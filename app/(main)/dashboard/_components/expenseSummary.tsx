import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ExpenseSummaryProps {
  monthlySpending: any;
  totalSpent: any;
}

const ExpenseSummary = ({ monthlySpending, totalSpent }: ExpenseSummaryProps) => {

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const chartData = monthlySpending?.map((item:any)=>{
        const date = new Date(item.month);
        return {
            month: monthNames[date.getMonth()],
            amount: item.total,
        }
    }) || [];

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 sm:p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="text-gray-600 font-medium text-xs sm:text-sm">{`${label}`}</p>
                    <p className="text-blue-600 font-bold text-xs sm:text-sm">
                        {`Amount: $${payload[0].value.toFixed(2)}`}
                    </p>
                </div>
            );
        }
        return null;
    };
    
    return (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50 h-full flex flex-col">
            <CardHeader className="pb-4 sm:pb-6 space-y-3 sm:space-y-4 flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <span className="text-base sm:text-xl">Monthly Spending Overview</span>
                    </CardTitle>
                    
                    {totalSpent && (
                        <div className="text-left sm:text-right">
                            <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Total Spent</p>
                            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                ${totalSpent.toFixed(2)}
                            </p>
                        </div>
                    )}
                </div>
                
                {chartData.length > 0 && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-gradient-to-r from-purple-500 to-pink-500"></div>
                        <span>Showing {chartData.length} months of data</span>
                    </div>
                )}
            </CardHeader>
            <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
                {chartData.length > 0 ? (
                    <div className="flex-1 min-h-[200px] sm:min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 15,
                                    right: 15,
                                    left: 15,
                                    bottom: 15,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" opacity={0.6} />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                                    tickLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                                    tick={{ fontSize: 11, fill: '#6b7280' }}
                                />
                                <YAxis 
                                    axisLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                                    tickLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                                    tick={{ fontSize: 11, fill: '#6b7280' }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar 
                                    dataKey="amount" 
                                    fill="url(#colorGradient)"
                                    radius={[4, 4, 0, 0]}
                                    className="drop-shadow-sm"
                                />
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                        <stop offset="100%" stopColor="#ec4899" stopOpacity={0.6}/>
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center space-y-2 sm:space-y-3">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 font-medium text-sm sm:text-base">No expense data yet</p>
                            <p className="text-xs sm:text-sm text-gray-400">Start adding expenses to see your spending trends</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default ExpenseSummary
