import React, { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className='flex justify-center items-center min-h-screen py-20 bg-gray-100'>
      {children}
    </div>
  );
};

export default AuthLayout;