import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-white",
        secondary: "border-transparent bg-muted text-muted-foreground",
        success: "border-transparent bg-green-100 text-green-800",
        warning: "border-transparent bg-yellow-100 text-yellow-800",
        destructive: "border-transparent bg-red-100 text-red-800",
        outline: "text-foreground",
        sprint: "bg-emerald-100 text-emerald-800 border-emerald-200",
        breve: "bg-yellow-100 text-yellow-800 border-yellow-200",
        intermedio: "bg-orange-100 text-orange-800 border-orange-200",
        lungo: "bg-red-100 text-red-800 border-red-200",
        lunghissimo: "bg-purple-100 text-purple-800 border-purple-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
