import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageTransition } from '@/components/PageTransition'
import type { BrowseActivity, TripDetail, TripListItem } from '@/lib/types'
import { formatMoney } from '@/lib/utils'
import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const CATS = ['ALL', 'ADVENTURE', 'FOOD', 'CULTURE', 'NIGHTLIFE', 'NATURE', 'SHOPPING']

export function ActivitiesPage() {
  const [activities, setActivities] = useState<BrowseActivity[]>([])
  const [trips, setTrips] = useState<TripListItem[]>([])
  const [tripId, setTripId] = useState('')
  const [tripDetail, setTripDetail] = useState<TripDetail | null>(null)
  const [stopId, setStopId] = useState('')
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('ALL')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get<{ trips: TripListItem[] }>('/trips')
        setTrips(data.trips)
        if (data.trips[0]) setTripId(data.trips[0].id)
      } catch (e) {
        toast.error((e as Error).message)
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const params: Record<string, string> = {}
        if (q.trim()) params.q = q.trim()
        if (category !== 'ALL') params.category = category
        if (maxPrice) params.maxPrice = maxPrice
        const { data } = await api.get<{ activities: BrowseActivity[] }>('/browse-activities', { params })
        setActivities(data.activities)
      } catch (e) {
        toast.error((e as Error).message)
      }
    })()
  }, [q, category, maxPrice])

  useEffect(() => {
    if (!tripId) return
    ;(async () => {
      try {
        const { data } = await api.get<{ trip: TripDetail }>(`/trips/${tripId}`)
        setTripDetail(data.trip)
        if (data.trip.stops[0]) setStopId(data.trip.stops[0].id)
      } catch {
        setTripDetail(null)
      }
    })()
  }, [tripId])

  const add = async (browseActivityId: string) => {
    if (!tripId || !stopId) {
      toast.error('Pick a trip with at least one stop')
      return
    }
    try {
      await api.post(`/trips/${tripId}/stops/${stopId}/activities/from-browse/${browseActivityId}`)
      toast.success('Added to itinerary stop')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Activity catalog</h1>
          <p className="text-slate-600">Filter by vibe, duration, and price — send wins straight into your planner.</p>
        </div>

        <Card className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Trip</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Stop</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={stopId}
              onChange={(e) => setStopId(e.target.value)}
            >
              {(tripDetail?.stops ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Search</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Keywords"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Max price</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </Card>

        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                category === c ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'
              }`}
            >
              {c === 'ALL' ? 'All' : c[0] + c.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {activities.map((a) => (
            <Card key={a.id} className="overflow-hidden p-0">
              <div
                className="h-32 bg-cover bg-center"
                style={{
                  backgroundImage: a.imageUrl
                    ? `linear-gradient(180deg,transparent,rgba(15,23,42,.55)), url(${a.imageUrl})`
                    : 'linear-gradient(135deg,#a855f7,#6366f1)',
                }}
              />
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{a.title}</h3>
                    <p className="text-xs text-slate-500">
                      {a.city}, {a.country}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    <Star className="h-3 w-3" />
                    {a.rating?.toFixed(1) ?? '—'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-3">{a.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>{a.durationMinutes ? `${a.durationMinutes} min` : 'Flexible'}</span>
                  <span>{a.priceEstimate != null ? formatMoney(a.priceEstimate) : 'Free / varies'}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">{a.category}</span>
                </div>
                <Button variant="primary" type="button" className="w-full text-sm" onClick={() => add(a.id)}>
                  Add to itinerary
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
