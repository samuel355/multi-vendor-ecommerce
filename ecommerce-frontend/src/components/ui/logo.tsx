import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      MVE
      <span className="font-bold text-xl">Your Store</span>
    </Link>
  )
}