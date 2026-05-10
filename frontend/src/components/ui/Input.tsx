import { cn } from '@/lib/utils'
import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-xl border px-4 py-2.5 text-sm shadow-inner placeholder:opacity-70 transition focus:outline-none focus:ring-2 focus:ring-sky-400/40',
        'bg-[color:var(--panel-solid)] border-[color:var(--panel-border)] text-[color:var(--text)] placeholder:text-[color:var(--muted)]',
        className,
      )}
      {...props}
    />
  )
})

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          'min-h-[120px] w-full rounded-xl border px-4 py-3 text-sm shadow-inner placeholder:opacity-70 transition focus:outline-none focus:ring-2 focus:ring-sky-400/40',
          'bg-[color:var(--panel-solid)] border-[color:var(--panel-border)] text-[color:var(--text)] placeholder:text-[color:var(--muted)]',
          className,
        )}
        {...props}
      />
    )
  },
)
