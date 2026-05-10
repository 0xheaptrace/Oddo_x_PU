import { api } from '@/api/client'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import type { TripDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/uiStore'
import { CalendarRange, MapPinned, NotebookPen, Wallet, Backpack, LayoutGrid, Inbox } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

const tabs = [
  { to: '', label: 'Overview', icon: LayoutGrid, end: true },
  { to: 'itinerary', label: 'Planner', icon: MapPinned },
  { to: 'view', label: 'Views', icon: CalendarRange },
  { to: 'budget', label: 'Budget', icon: Wallet },
  { to: 'packing', label: 'Packing', icon: Backpack },
  { to: 'notes', label: 'Journal', icon: NotebookPen },
  { to: 'requests', label: 'Requests', icon: Inbox },
]

export function TripLayout() {
  const { tripId = '' } = useParams()
  const setLastTripId = useUiStore((s) => s.setLastTripId)
  const [trip, setTrip] = useState<TripDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLastTripId(tripId)
  }, [tripId, setLastTripId])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const { data } = await api.get<{ trip: TripDetail }>(`/trips/${tripId}`)
        if (!cancelled) setTrip(data.trip)
      } catch (e) {
        toast.error((e as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tripId])

  if (loading || !trip) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  const base = `/dashboard/trips/${tripId}`

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div
          className="h-36 bg-cover bg-center"
          style={{
            backgroundImage: trip.coverImageUrl
              ? `linear-gradient(120deg,rgba(15,23,42,.75),rgba(14,165,233,.35)), url(${trip.coverImageUrl})`
              : 'linear-gradient(120deg,#312e81,#0ea5e9)',
          }}
        />
        <div className="space-y-1 px-6 pb-4 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">{trip.destination}</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 md:text-3xl">{trip.name}</h1>
          <p className="max-w-2xl text-sm text-slate-600">
            {trip.description || 'Your adventure hub — refine every detail from one place.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-[color:var(--panel-border)] bg-[color:var(--panel-solid)] px-4 py-3">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to || 'overview'}
              to={tab.to ? `${base}/${tab.to}` : base}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[color:var(--panel-bg)] text-indigo-700 shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-400/20'
                    : 'text-slate-600 hover:bg-white/10',
                )
              }
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </NavLink>
          ))}
        </div>
      </Card>

      <Outlet context={{ trip, setTrip }} />
    </div>
  )
}
