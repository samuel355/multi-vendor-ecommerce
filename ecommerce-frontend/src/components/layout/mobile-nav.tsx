"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "../ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../ui/sheet"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <nav className="flex flex-col space-y-4">
          <Link
            href="/"
            className="text-sm font-medium"
            onClick={() => setOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium"
            onClick={() => setOpen(false)}
          >
            Products
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium"
            onClick={() => setOpen(false)}
          >
            Categories
          </Link>
          <Link
            href="/vendors"
            className="text-sm font-medium"
            onClick={() => setOpen(false)}
          >
            Vendors
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}