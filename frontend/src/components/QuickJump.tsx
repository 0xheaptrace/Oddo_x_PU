import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import type { TripListItem } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'

type Item = { label: string; to: string; hint?: string }

export function QuickJump() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [trips, setTrips] = useState<TripListItem[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!open) return
    ;(async () => {
      try {
        const { data } = await api.get<{ trips: TripListItem[] }>('/trips')
        setTrips(data.trips.slice(0, 8))
      } catch {
        setTrips([])
      }
    })()
  }, [open])

  const base: Item[] = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'My Trips', to: '/dashboard/trips' },
    { label: 'Create Trip', to: '/dashboard/trips/new', hint: 'New' },
    { label: 'Explore Cities', to: '/dashboard/explore/cities' },
    { label: 'Explore Activities', to: '/dashboard/explore/activities' },
    { label: 'Shared Trips', to: '/dashboard/shared' },
    { label: 'Profile & Settings', to: '/dashboard/profile' },
  ]

  const tripItems: Item[] = trips.map((t) => ({
    label: t.name,
    to: `/dashboard/trips/${t.id}`,
    hint: t.destination,
  }))

  const items = useMemo(() => {
    const all = [...base, ...tripItems]
    if (!q.trim()) return all
    const s = q.toLowerCase()
    return all.filter((i) => `${i.label} ${i.hint ?? ''}`.toLowerCase().includes(s))
  }, [q, tripItems])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="mx-auto mt-24 max-w-xl px-4" onClick={(e) => e.stopPropagation()}>
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-sm font-semibold text-[color:var(--text)]">Quick jump</p>
            <span className="text-xs text-[color:var(--muted)]">Ctrl+K</span>
          </div>
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search pages, trips…"
            className="mt-3"
          />
          <div className="mt-3 max-h-[360px] overflow-auto">
            {items.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-[color:var(--muted)]">No matches</p>
            ) : (
              <ul className="space-y-1">
                {items.map((i) => (
                  <li key={i.to}>
                    <button
                      type="button"
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-white/10',
                        'text-[color:var(--text)]',
                      )}
                      onClick={() => {
                        navigate(i.to)
                        setOpen(false)
                      }}
                    >
                      <span className="font-medium">{i.label}</span>
                      {i.hint && <span className="text-xs text-[color:var(--muted)]">{i.hint}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-3 flex justify-end">
            <Button variant="secondary" type="button" className="text-xs" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </Card>
      </div>
    </div>,
    document.body,
  )
}

