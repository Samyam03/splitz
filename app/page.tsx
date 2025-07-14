"use client";
import React, { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const Home = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  if (isLoaded && isSignedIn) {
    // Optionally render nothing or a loading spinner while redirecting
    return null;
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section with gradient background */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Badge with enhanced styling */}
            <div className="animate-fade-in">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors px-4 py-2 text-sm font-semibold shadow-md">
                Split Smart. Settle Fast.
              </Badge>
            </div>
            
            {/* Main heading with improved gradient */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
              Effortless Expense Splitting
            </h1>
            
            {/* Enhanced subheading */}
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto font-medium">
              Split bills, track debts, and settle up with friends in seconds.
              No more spreadsheets or awkward conversations.
            </p>
            
            {/* Enhanced CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 text-lg shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                <Link href="/sign-up">
                  Get Started
                  <span className="ml-2 text-xl">→</span>
                </Link>
              </Button>
              <Button 
                variant="outline" 
                asChild 
                size="lg"
                className="border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 font-semibold px-8 py-4 text-lg transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <Link href="#how-it-works">
                  How It Works
                  <span className="ml-2">?</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with modern styling */}
      <section className="bg-gradient-to-br from-gray-50 to-slate-100 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to manage group expenses effortlessly</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 - Group Expenses */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="pb-4">
                <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <CardTitle className="text-center text-2xl font-bold text-gray-800">Group Expenses</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center text-gray-600 text-lg leading-relaxed">
                  Create groups for roommates, trips, or friends. Track who owes what in one place.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 2 - Smart Splitting */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="pb-4">
                <div className="bg-orange-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <CardTitle className="text-center text-2xl font-bold text-gray-800">Smart Splitting</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center text-gray-600 text-lg leading-relaxed">
                  Split bills equally, by percentage, or custom amounts. We handle the math for you.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 3 - Friendly Reminders */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="pb-4">
                <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  </svg>
                </div>
                <CardTitle className="text-center text-2xl font-bold text-gray-800">Friendly Reminders</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center text-gray-600 text-lg leading-relaxed">
                  Automated reminders help friends pay you back without awkwardness.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section with enhanced styling */}
      <section id="how-it-works" className="bg-gradient-to-br from-white to-gray-50 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Simple steps to split expenses like a pro</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-50 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-col items-center gap-4 pb-6">
                <div className="bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold shadow-lg">
                  1
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 text-center">Add Expenses</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center text-gray-600 text-lg leading-relaxed">
                  Enter your expenses and select who was involved. Add receipts if you want.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-col items-center gap-4 pb-6">
                <div className="bg-yellow-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold shadow-lg">
                  2
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 text-center">We Calculate</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center text-gray-600 text-lg leading-relaxed">
                  Our system automatically calculates who owes what to whom in your group.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-col items-center gap-4 pb-6">
                <div className="bg-green-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold shadow-lg">
                  3
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 text-center">Settle Up</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center text-gray-600 text-lg leading-relaxed">
                  Pay each other directly in the app or mark transactions as settled offline.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section with enhanced styling */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-700/90"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to Simplify Your Splits?</h2>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed font-medium">
              Join thousands of users who are splitting expenses the easy way.
            </p>
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-10 py-4 text-xl shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl">
              <Link href="/sign-up">
                Get Started for Free
                <span className="ml-2 text-2xl">→</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;