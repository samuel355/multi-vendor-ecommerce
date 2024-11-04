"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const { userId, getToken } = useAuth();
  const { user } = useUser();

  return (
    <main className="relative flex flex-col min-h-screen">

    </main>
  );
}
