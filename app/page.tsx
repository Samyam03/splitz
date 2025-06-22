import React from 'react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const Home = () => {
  return (
    <main className="min-h-[calc(100vh-68px)]">
      {/* Hero Section with white background */}
      <section className="bg-background">
        <div className="container mx-auto px-4 py-12 md:py-24 flex flex-col items-center text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Badge with subtle animation */}
            <div className="animate-fade-in">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                Split Smart. Settle Fast.
              </Badge>
            </div>
            
            {/* Main heading with gradient text */}
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Effortless Expense Splitting
            </h1>
            
            {/* Subheading with optimal readability */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Split bills, track debts, and settle up with friends in seconds.
              No more spreadsheets or awkward conversations.
            </p>
            
            {/* CTA buttons with hover effects */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="transition-transform hover:-translate-y-1">
                <Link href="/sign-up">
                  Get Started
                  <span className="ml-2">→</span>
                </Link>
              </Button>
              <Button 
                variant="outline" 
                asChild 
                size="lg"
                className="transition-all hover:border-primary hover:text-primary"
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

      {/* Features Section with gray background */}
      <section className="bg-muted/50 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow bg-background">
              <CardHeader className="pb-4">
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <CardTitle className="text-center text-xl">Group Expenses</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center">
                  Create groups for roommates, trips, or friends. Track who owes what in one place.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-background">
              <CardHeader className="pb-4">
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <CardTitle className="text-center text-xl">Smart Splitting</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center">
                  Split bills equally, by percentage, or custom amounts. We handle the math for you.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-background">
              <CardHeader className="pb-4">
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  </svg>
                </div>
                <CardTitle className="text-center text-xl">Friendly Reminders</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center">
                  Automated reminders help friends pay you back without awkwardness.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section with white background */}
      <section id="how-it-works" className="bg-background py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-none bg-muted/50">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                  1
                </div>
                <CardTitle className="text-xl md:text-2xl">Add Expenses</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription>
                  Enter your expenses and select who was involved. Add receipts if you want.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-none shadow-none bg-muted/50">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                  2
                </div>
                <CardTitle className="text-xl md:text-2xl">We Calculate</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription>
                  Our system automatically calculates who owes what to whom in your group.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-none shadow-none bg-muted/50">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                  3
                </div>
                <CardTitle className="text-xl md:text-2xl">Settle Up</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription>
                  Pay each other directly in the app or mark transactions as settled offline.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          
        </div>
      </section>

      {/* Additional section with gray background if needed */}
      <section className="bg-muted/50 py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Ready to Simplify Your Splits?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of users who are splitting expenses the easy way.
          </p>
          <Button asChild size="lg" className="transition-transform hover:-translate-y-1">
            <Link href="/sign-up">
              Get Started for Free
              <span className="ml-2">→</span>
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Home;