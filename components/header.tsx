'use client'
import React from 'react'
import {
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs'
import { Authenticated, Unauthenticated } from 'convex/react'
import { Button } from '@/components/ui/button'
import { LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const Header = () => {
  return (
    <nav className="fixed top-0 left-0 w-full h-14 sm:h-16 bg-white shadow-sm px-4 sm:px-6 lg:px-8 flex items-center z-50">
      <div className="w-full max-w-7xl mx-auto flex items-center">
        {/* Logo container - responsive sizing */}
        <div className="h-full flex items-center">
          <Link 
            href="/" 
            className="h-full flex items-center hover:opacity-90 transition-opacity"
          >
            <Image 
              src="/Splitz.png"  
              alt="Splitz Logo" 
              width={100} 
              height={80}
              className="h-full w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Spacer to push auth elements to the right */}
        <div className="flex-grow"/>

        {/* Auth buttons container */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          <Unauthenticated>
            <div className="flex gap-2 sm:gap-4 lg:gap-6 items-center">
              <SignInButton>
                <Button className="px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button variant="outline" className="px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </Unauthenticated>

          <Authenticated>
            <div className="flex items-center gap-4 sm:gap-6 lg:gap-10">
              <Link href="/dashboard">
                <Button variant="outline" className="gap-1.5 sm:gap-2 px-2 sm:px-4 lg:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm text-black font-semibold">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </Authenticated>
        </div>
      </div>
    </nav>
  )
}

export default Header