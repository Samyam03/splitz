"use client";

import React, { useState } from 'react';
import { useConvexQuery } from '@/hooks/useConvexQuery';
import { api } from '../../../convex/_generated/api';
import { BarLoader } from 'react-spinners';
import { Button } from '@/components/ui/button';
import { Users, PlusIcon, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { AvatarFallback } from '@radix-ui/react-avatar';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

export default function ContactsPage() {
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();
  const { data, loading, error } = useConvexQuery(api.contacts.getContacts);

  // Show loading while auth is loading
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BarLoader color="#3b82f6" />
      </div>
    );
  }

  // Show message if user is not signed in
  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to view contacts</h1>
          <p className="text-gray-600">You need to be authenticated to access this page.</p>
        </div>
      </div>
    );
  }

  // Show loading while data is being fetched
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BarLoader color="#3b82f6" />
      </div>
    );
  }

  // Show error if there's an error
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Error loading contacts</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  const { users, groups } = data || { users: [], groups: [] };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Contacts</h1>
        <Button onClick={() => setIsNewGroupModalOpen(true)} className="gap-2">
          <PlusIcon className="w-4 h-4" />
          New Group
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8"> 
        {/* Left column - People */}
        <div className="flex-1">
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-700">People</h2>
            </div>

            {users.length === 0 ? (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-6 text-center text-gray-500">
                  No contacts yet
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {users.map((user: any) => (
                  <Link key={user.id} href={`/person/${user.id}`} className="hover:no-underline">
                    <Card className="hover:bg-gray-50 transition-colors border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={user.imageUrl} />
                              <AvatarFallback className="flex items-center justify-center bg-gray-200 text-gray-700 font-medium w-full h-full">
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column - Groups */}
        <div className="flex-1">
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-700">Groups</h2>
            </div>

            {groups.length === 0 ? (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-6 text-center text-gray-500">
                  No groups yet
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {groups.map((group: any) => (
                  <Link key={group.id} href={`/group/${group.id}`} className="hover:no-underline">
                    <Card className="hover:bg-gray-50 transition-colors border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center bg-gray-100 rounded-full w-12 h-12">
                            <Users className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{group.name}</p>
                            <p className="text-sm text-gray-500">
                              {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}