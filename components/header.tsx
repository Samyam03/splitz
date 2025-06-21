'use client'
import React from 'react'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { useStoreUserEffect } from '@/hooks/useStoreUserEffect'
import { Authenticated, Unauthenticated } from 'convex/react'
import { Button } from '@/components/ui/button'
import { LayoutDashboard } from 'lucide-react'
import BarLoader from 'react-spinners/BarLoader'
import Link from 'next/link'
import Image from 'next/image'

const Header = () => {
  const { isLoading } = useStoreUserEffect()

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-white shadow-sm px-6 sm:px-8 flex items-center z-50">
      <div className="w-full max-w-7xl mx-auto flex items-center">
        {/* Logo container - maintaining original sizing */}
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
        <div className="flex items-center gap-6">
          <Unauthenticated>
            <div className="flex gap-6 items-center">
              <SignInButton>
                <Button className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button variant="outline" className="px-5 py-2 rounded-xl text-sm font-semibold">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </Unauthenticated>

          <Authenticated>
            <div className="flex items-center gap-10">
              <Link href="/dashboard">
                <Button variant="outline" className="gap-2 px-5 py-2 rounded-xl text-sm font-semibold">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </Authenticated>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute bottom-0 left-0 w-full">
          <BarLoader
            width="100%"
            height={3}
            color="#3B82F6"
            loading={true}
          />
        </div>
      )}
    </nav>
  )
}

export default Header