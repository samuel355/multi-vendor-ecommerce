"use client";
import { HeroSection } from "@/components/shared/hero-section";
import { NoteSection } from "@/components/shared/note-section";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import HeroSlider from "@/components/shared/hero-slider";
import NewArrivals from "@/components/new-arrivals";

export default function Home() {
  const { userId, getToken } = useAuth();
  const { user } = useUser();

  return (
    <main className="relative flex flex-col overflow-y-auto">
      <HeroSlider />
      <NoteSection />
      <NewArrivals />
    </main>
  );
}
