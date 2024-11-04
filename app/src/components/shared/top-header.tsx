'use client'
import Link from "next/link";
import { ThemeToggle } from "../toggle-theme";

export default function TopHeader(){
  return(
    <div className="flex items-center justify-end pr-8 w-full py-3 bg-black">
      <div className="flex justify-center text-center w-full">
        <div className="flex gap-1 text-white py-2 text-center">
          <p className="text-sm">Sign up as a vendor and start selling products</p>
          <Link className="underline text-sm font-semibold" href={'/sign-up'}> Sign Up</Link>
        </div>
      </div>
      <ThemeToggle />
    </div>
  )
}