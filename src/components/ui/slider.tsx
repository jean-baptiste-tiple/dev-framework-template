import * as React from "react"
import { cn } from "@/lib/utils/cn"

const Slider = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    type="range"
    className={cn(
      "w-full h-2 rounded-full appearance-none cursor-pointer bg-secondary accent-primary",
      className
    )}
    ref={ref}
    {...props}
  />
))
Slider.displayName = "Slider"

export { Slider }
