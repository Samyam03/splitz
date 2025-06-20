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
import BarLoader from 'react-spinners/BarLoader'

const Header = () => {
  const { isLoading } = useStoreUserEffect()

  return (
    <header className="fixed top-0 left-0 w-full min-h-[72px] bg-white shadow-sm px-8 py-4 flex justify-between items-center z-50">
      {/* Loader at the upper edge of the navbar */}
      

      <div className="flex items-center gap-3">
        {/* Logo or other content */}
      </div>

      <nav>
        <SignedOut>
          <div className="flex gap-3">
            <SignInButton>
              <button className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="px-5 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </nav>
      {isLoading && (
        <div className="absolute bottom-0 left-0 w-full">
          <BarLoader
            width="100%"
            height={4}
            color="#3B82F6"
            loading={true}
          />
        </div>
      )}
    </header>
  )
}

export default Header