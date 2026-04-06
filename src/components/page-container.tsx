import { cn } from "@/lib/utils/cn"

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: string
  description?: string
}

export function PageContainer({
  heading,
  description,
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8", className)} {...props}>
      {(heading || description) && (
        <div className="mb-6">
          {heading && (
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {heading}
            </h1>
          )}
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
