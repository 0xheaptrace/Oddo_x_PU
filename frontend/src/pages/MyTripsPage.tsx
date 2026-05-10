import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageTransition } from '@/components/PageTransition'
import { Badge } from '@/components/ui/Badge'
import type { TripListItem } from '@/lib/types'
import { formatMoney } from '@/lib/utils'
import { Copy, Link2, Search, Share2, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export function MyTripsPage() {
  const [trips, setTrips] = useState<TripListItem[]>([])
  const [filter, setFilter] = useState<string>('ALL')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (filter !== 'ALL') params.status = filter
      if (q.trim()) params.q = q.trim()
      const { data } = await api.get<{ trips: TripListItem[] }>('/trips', { params })
      setTrips(data.trips)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const filtered = useMemo(() => {
    if (!q.trim()) return trips
    const s = q.toLowerCase()
    return trips.filter((t) => t.name.toLowerCase().includes(s) || t.destination.toLowerCase().includes(s))
  }, [trips, q])

  const remove = async (id: string) => {
    if (!confirm('Delete this trip permanently?')) return
    try {
      await api.delete(`/trips/${id}`)
      toast.success('Trip deleted')
      load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const duplicate = async (id: string) => {
    try {
      await api.post(`/trips/${id}/duplicate`)
      toast.success('Trip duplicated')
      load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const share = async (id: string) => {
    try {
      const { data } = await api.post<{ publicUrl: string }>(`/trips/${id}/share`, { mode: 'PUBLIC' })
      await navigator.clipboard.writeText(data.publicUrl)
      toast.success('Public link copied')
      load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">My trips</h1>
            <p className="text-slate-600">Search, filter, and orchestrate every itinerary.</p>
          </div>
          <Link to="/dashboard/trips/new">
            <Button variant="primary">Create trip</Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-10" placeholder="Search trips…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {['ALL', 'UPCOMING', 'COMPLETED', 'DRAFT'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  filter === f
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-[color:var(--panel-solid)] text-slate-600 ring-1 ring-[color:var(--panel-border)]'
                }`}
              >
                {f === 'ALL' ? 'All' : f[0] + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filtered.map((t) => (
              <Card key={t.id} className="overflow-hidden p-0">
                <div
                  className="h-36 bg-cover bg-center"
                  style={{
                    backgroundImage: t.coverImageUrl
                      ? `linear-gradient(180deg,transparent,rgba(15,23,42,.65)), url(${t.coverImageUrl})`
                      : 'linear-gradient(135deg,#6366f1,#0ea5e9)',
                  }}
                />
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-slate-900">{t.name}</h3>
                      <p className="text-sm text-slate-600">{t.destination}</p>
                    </div>
                    <Badge>{t.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>{t.cityCount ?? 0} cities</span>
                    <span>{t.durationDays ?? '—'} days</span>
                    <span>Budget preview {formatMoney(t.budgetPreview ?? 0)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    <Link to={`/dashboard/trips/${t.id}`}>
                      <Button variant="primary" className="text-xs">
                        View
                      </Button>
                    </Link>
                    <Link to={`/dashboard/trips/${t.id}/itinerary`}>
                      <Button variant="secondary" className="text-xs">
                        Planner
                      </Button>
                    </Link>
                    <Button variant="ghost" className="text-xs" onClick={() => duplicate(t.id)}>
                      <Copy className="h-4 w-4" /> Duplicate
                    </Button>
                    <Button variant="ghost" className="text-xs" onClick={() => share(t.id)}>
                      <Share2 className="h-4 w-4" /> Share Publicly
                    </Button>
                    {t.isPublic && t.shareSlug && (
                      <a
                        href={`/share/${t.shareSlug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-100/20"
                      >
                        <Link2 className="h-4 w-4" /> Public
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      className="ml-auto text-xs text-orange-600 hover:bg-orange-500/15"
                      onClick={() => remove(t.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <Card className="py-16 text-center text-slate-500">
            No trips match. Adjust filters or create a new adventure.
          </Card>
        )}
      </div>
    </PageTransition>
  )
}
