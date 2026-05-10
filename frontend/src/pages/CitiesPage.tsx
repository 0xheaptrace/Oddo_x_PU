import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageTransition } from '@/components/PageTransition'
import type { Destination, TripListItem } from '@/lib/types'
import { formatMoney } from '@/lib/utils'
import { CloudSun, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

export function CitiesPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [trips, setTrips] = useState<TripListItem[]>([])
  const [q, setQ] = useState('')
  const [country, setCountry] = useState('')
  const [pickTrip, setPickTrip] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const [dRes, tRes] = await Promise.all([
          api.get<{ destinations: Destination[] }>('/destinations'),
          api.get<{ trips: TripListItem[] }>('/trips'),
        ])
        setDestinations(dRes.data.destinations)
        setTrips(tRes.data.trips)
        if (tRes.data.trips[0]) setPickTrip(tRes.data.trips[0].id)
      } catch (e) {
        toast.error((e as Error).message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    return destinations.filter((d) => {
      if (country && !d.country.toLowerCase().includes(country.toLowerCase())) return false
      if (q && !`${d.name} ${d.country}`.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
  }, [destinations, q, country])

  const addToTrip = async (destinationId: string) => {
    if (!pickTrip) {
      toast.error('Select a trip first')
      return
    }
    try {
      await api.post(`/trips/${pickTrip}/stops/from-destination/${destinationId}`)
      toast.success('City added to itinerary')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Explore cities</h1>
          <p className="text-slate-600">Curated destinations with budget + climate cues.</p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-10" placeholder="Search cities…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Input
            className="lg:w-56"
            placeholder="Country filter"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <div className="lg:w-72">
            <label className="text-xs font-semibold uppercase text-slate-500">Target trip</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
              value={pickTrip}
              onChange={(e) => setPickTrip(e.target.value)}
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading destinations…</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((d) => (
              <Card key={d.id} className="overflow-hidden p-0">
                <div
                  className="h-36 bg-cover bg-center"
                  style={{
                    backgroundImage: d.imageUrl
                      ? `linear-gradient(180deg,transparent,rgba(15,23,42,.65)), url(${d.imageUrl})`
                      : 'linear-gradient(135deg,#6366f1,#0ea5e9)',
                  }}
                />
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-slate-900">{d.name}</h3>
                      <p className="text-sm text-slate-500">{d.country}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {d.popularity}/100
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                    <span>{d.attractionsCount ?? '—'} attractions</span>
                    <span className="flex items-center gap-1">
                      <CloudSun className="h-3.5 w-3.5 text-sky-500" />
                      {d.weatherSummary || 'Climate data'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-emerald-700">
                    Est. {d.avgCostPerDay != null ? `${formatMoney(d.avgCostPerDay)} / day` : 'Ask locals'}
                  </p>
                  <Button variant="primary" type="button" className="w-full text-sm" onClick={() => addToTrip(d.id)}>
                    Add to trip
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
