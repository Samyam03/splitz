"use client";

import React, { useEffect, useState, Suspense } from 'react';
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
import CreateGroupModal from './_components/group-modal';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserColor } from '@/lib/userColors';
import { Id } from '../../../convex/_generated/dataModel';

type ContactUser = {
  id: Id<'users'>;
  name: string;
  email: string | null;
  imageUrl: string | undefined;
  type: 'user';
};

type ContactGroup = {
  id: Id<'groups'>;
  name: string;
  description?: string;
  memberCount: number;
  type: 'group';
};

function ContactsPageContent() {
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);

  const { isLoaded, isSignedIn } = useAuth();
  const { data, loading, error } = useConvexQuery(api.contacts.getContacts);

  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const createGroupParam = searchParams.get('createGroup');

    if (createGroupParam === 'true') {
      setIsNewGroupModalOpen(true);

      const url = new URL(window.location.href);
      url.searchParams.delete('createGroup');
      router.replace(url.pathname + url.search);
    }
  }, [searchParams,router]);

  // Show loading while auth is loading
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-3 sm:space-y-4">
          <BarLoader color="#3b82f6" width={200} />
          <p className="text-gray-600 font-medium text-sm sm:text-base">Loading...</p>
        </div>
      </div>
    );
  }

  // Show message if user is not signed in
  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-rose-50">
        <div className="text-center space-y-3 sm:space-y-4 p-6 sm:p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Please Sign In</h1>
          <p className="text-gray-600 text-sm sm:text-base">You need to be authenticated to view contacts.</p>
        </div>
      </div>
    );
  }

  // Show loading while data is being fetched
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-3 sm:space-y-4">
          <BarLoader color="#3b82f6" width={200} />
          <p className="text-gray-600 font-medium text-sm sm:text-base">Loading contacts...</p>
        </div>
      </div>
    );
  }

  // Show error if there's an error
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-rose-50">
        <div className="text-center space-y-3 sm:space-y-4 p-6 sm:p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-3 sm:mb-4">Error Loading Contacts</h1>
          <p className="text-gray-600 text-sm sm:text-base">{error.message}</p>
        </div>
      </div>
    );
  }

  const { users, groups } = data || { users: [], groups: [] };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Contacts</h1>
          <Button 
            onClick={() => setIsNewGroupModalOpen(true)} 
            className="flex items-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            New Group
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8"> 
          {/* People Section */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">People</h2>
                  <span className="ml-auto text-xs sm:text-sm font-medium text-gray-600 bg-white px-2 sm:px-3 py-1 rounded-full">
                    {users.length} {users.length === 1 ? 'contact' : 'contacts'}
                  </span>
                </div>

                {users.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 space-y-2 sm:space-y-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <User className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                    </div>
                    <p className="text-gray-500 font-medium text-sm sm:text-base">No contacts yet</p>
                    <p className="text-xs sm:text-sm text-gray-400">Start by adding some friends to split expenses with</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {users.map((user: ContactUser) => {
                      const userColor = getUserColor(user.id);
                      return (
                        <Link key={user.id} href={`/user/${user.id}`} className="block">
                          <Card className="hover:shadow-md transition-all duration-200 border-0 bg-white hover:bg-gradient-to-r hover:from-white hover:to-purple-50">
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <Avatar className={`w-10 h-10 sm:w-12 sm:h-12 ring-2 ${userColor.ring}`}>
                                  <AvatarImage src={user.imageUrl} />
                                  <AvatarFallback className={`flex items-center justify-center ${userColor.bg} ${userColor.text} font-semibold w-full h-full text-sm sm:text-base`}>
                                    {user.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 truncate text-sm sm:text-base">{user.name}</p>
                                  <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Groups Section */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Groups</h2>
                  <span className="ml-auto text-xs sm:text-sm font-medium text-gray-600 bg-white px-2 sm:px-3 py-1 rounded-full">
                    {groups.length} {groups.length === 1 ? 'group' : 'groups'}
                  </span>
                </div>

                {groups.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 space-y-2 sm:space-y-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                    </div>
                    <p className="text-gray-500 font-medium text-sm sm:text-base">No groups yet</p>
                    <p className="text-xs sm:text-sm text-gray-400">Create a group to organize expenses with multiple people</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {groups.map((group: ContactGroup) => (
                      <Link key={group.id} href={`/groups/${group.id}`} className="block">
                        <Card className="hover:shadow-md transition-all duration-200 border-0 bg-white hover:bg-gradient-to-r hover:from-white hover:to-orange-50">
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="flex items-center justify-center bg-orange-100 rounded-full w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-orange-50">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate text-sm sm:text-base">{group.name}</p>
                                <p className="text-xs sm:text-sm text-gray-500">
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
              </CardContent>
            </Card>
          </div>
        </div>

        <CreateGroupModal
          isOpen={isNewGroupModalOpen}
          isClose={()=>setIsNewGroupModalOpen(false)}
          onSuccess={(groupId: string) => {
            setIsNewGroupModalOpen(false);
            router.push(`/groups/${groupId}`);
          }}
        />
      </div>
    </div>
  );
}

export default function ContactsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-3 sm:space-y-4">
          <BarLoader color="#3b82f6" width={200} />
          <p className="text-gray-600 font-medium text-sm sm:text-base">Loading...</p>
        </div>
      </div>
    }>
      <ContactsPageContent />
    </Suspense>
  );
}