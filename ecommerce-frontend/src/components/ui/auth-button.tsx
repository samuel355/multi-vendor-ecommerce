import { cn } from "@/lib/utils"
import { Button } from "./button"

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  children: React.ReactNode
}

export function AuthButton({
  icon,
  children,
  className,
  ...props
}: AuthButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "relative flex w-full items-center justify-center gap-2",
        className
      )}
      {...props}
    >
      {icon && <span className="absolute left-4">{icon}</span>}
      {children}
    </Button>
  )
}