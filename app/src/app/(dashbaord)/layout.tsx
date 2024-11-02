'use client'
import { useAuth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = useAuth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}