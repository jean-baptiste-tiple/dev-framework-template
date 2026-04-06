import { cn } from "@/lib/utils/cn"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  heading: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon,
  heading,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground">{heading}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
