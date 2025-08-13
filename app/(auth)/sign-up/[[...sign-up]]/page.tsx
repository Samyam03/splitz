import React from 'react'
import { SignUp } from '@clerk/nextjs'

const SignUpPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <SignUp />
      
      <div className="mt-8 p-6 bg-blue-50 rounded-lg max-w-4xl w-full border border-blue-200">
        <h3 className="text-base font-medium text-blue-800 mb-4">Demo Accounts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm text-sm text-gray-600">
            <div className="mb-2"><strong>Email:</strong> test@email.com</div>
            <div><strong>Password:</strong> ExploreNow!2025</div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm text-sm text-gray-600">
            <div className="mb-2"><strong>Email:</strong> sam@gmail.com</div>
            <div><strong>Password:</strong> TalentPortal@2025</div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm text-sm text-gray-600">
            <div className="mb-2"><strong>Email:</strong> view@example.com</div>
            <div><strong>Password:</strong> TryThisDemo!88</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
