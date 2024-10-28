import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          MultiVendor
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/stores">Stores</Link>
          <Link href="/products">Products</Link>
          <Link href="/cart">Cart</Link>
          <Button asChild variant="outline">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}