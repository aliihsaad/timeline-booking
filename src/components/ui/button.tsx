import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-primary text-primary-foreground shadow-medium hover:shadow-strong hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-medium hover:bg-destructive/90 hover:shadow-strong",
        outline:
          "border border-input bg-background/80 backdrop-blur-sm shadow-soft hover:bg-accent hover:text-accent-foreground hover:shadow-medium",
        secondary:
          "bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/80 hover:shadow-medium",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        queue: "bg-gradient-accent text-white shadow-medium hover:shadow-strong hover:scale-[1.02] active:scale-[0.98]",
        success: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-soft",
        gold: "bg-gradient-primary text-white shadow-glow hover:shadow-accent hover:scale-[1.02] active:scale-[0.98] border border-white/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8 text-base font-semibold",
        xl: "h-14 rounded-lg px-10 text-lg font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
