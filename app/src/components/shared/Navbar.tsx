'use client';

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  const { user, isLoaded } = useUser();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            E-Commerce
          </Link>

          <div className="flex items-center gap-4">
            {isLoaded && user ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <Link 
                  href="/sign-in"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Sign In
                </Link>
                <Link 
                  href="/sign-up"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}