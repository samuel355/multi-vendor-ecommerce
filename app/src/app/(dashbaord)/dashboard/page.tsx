'use client'
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const { isSignedIn, user } = useUser()
  
  if (!isSignedIn) {
    redirect('/sign-in');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {user.firstName || 'User'}!
      </h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
        <div className="space-y-2">
          <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
          <p><strong>Name:</strong> {`${user.firstName} ${user.lastName}`}</p>
        </div>
      </div>
    </div>
  );
}