type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'studio'

const VARIANTS: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  danger: 'bg-red-500/10 text-red-400 ring-red-500/20',
  info: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
  neutral: 'bg-slate-500/10 text-slate-400 ring-slate-500/20',
  studio: 'bg-violet-500/10 text-violet-400 ring-violet-500/20',
}

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ring-1 ring-inset ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
