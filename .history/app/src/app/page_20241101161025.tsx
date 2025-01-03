"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const { userId, getToken } = useAuth();
  const { user } = useUser();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) {
      axios
        .get(`${"http://localhost:9000/api/v1"}`, {
          //headers: { Authorization: `Bearer ${getToken()}` },
        })
        .then((response) => setProfile(response.data.user))
        .catch(console.error);
    }
  }, [user]);

  console.log(profile)
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold">
          Welcome to Multi-vendor E-commerce
        </h1>
        {!userId ? (
          <div className="mt-8 flex gap-4">
            <Link
              href="/sign-in"
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 bg-green-500 text-white rounded-md"
            >
              Sign Up
            </Link>
          </div>
        ) : (
          <Link
            href="/dashboard"
            className="mt-8 px-4 py-2 bg-purple-500 text-white rounded-md"
          >
            Go to Dashboard
          </Link>
        )}
      </div>
    </main>
  );
}
