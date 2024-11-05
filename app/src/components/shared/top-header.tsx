'use client'
import Link from "next/link";
import { ThemeToggle } from "../toggle-theme";

export default function TopHeader(){
  return(
    <div className="flex items-center justify-end md:px-10 px-6 w-full py-2 border-b">
      <div className="flex justify-center text-center w-full">
        <div className="flex gap-1 py-2 text-center">
          <p className="text-sm">Sign up as a vendor and start selling products</p>
          <Link className="underline text-sm font-semibold" href={'/sign-up'}> Sign Up</Link>
        </div>
      </div>
      <ThemeToggle />
    </div>
  )
}