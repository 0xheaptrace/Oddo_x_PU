import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  primary:
    'gradient-cta hover:opacity-95 active:scale-[0.98] text-white border border-transparent',
  secondary:
    'border text-[color:var(--text)] hover:opacity-95 shadow-sm',
  ghost: 'bg-transparent text-[color:var(--muted)] hover:opacity-95 border border-transparent',
  danger: 'bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/20',
}

export function Button({
  className,
  variant = 'secondary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2',
        variants[variant],
        variant === 'secondary' && 'bg-[color:var(--panel-solid)] border-[color:var(--panel-border)]',
        variant === 'ghost' && 'hover:bg-white/10 dark:hover:bg-white/5',
        className,
      )}
      {...props}
    />
  )
}
