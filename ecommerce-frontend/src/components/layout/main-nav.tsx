import Link from "next/link"
import { cn } from "@/lib/utils"
import { Logo } from "../ui/logo"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className="flex items-center space-x-6">
      <Logo />
      <nav
        className={cn("flex items-center space-x-4 lg:space-x-6", className)}
        {...props}
      >
        <Link
          href="/"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Home
        </Link>
        <Link
          href="/products"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Products
        </Link>
        <Link
          href="/categories"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Categories
        </Link>
        <Link
          href="/vendors"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Vendors
        </Link>
      </nav>
    </div>
  )
}