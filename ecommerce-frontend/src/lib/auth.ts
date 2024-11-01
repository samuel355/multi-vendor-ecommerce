import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export function getAuth() {
  return auth();
}

export function requireAuth() {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return userId;
}