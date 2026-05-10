import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageTransition } from '@/components/PageTransition'
import { Copy, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

type PublicTripItem = {
  id: string
  name: string
  destination: string
  description?: string | null
  startDate: string
  endDate: string
  shareSlug: string
  cityCount?: number
  owner?: { name?: string | null }
}

export function SharedTripsPage() {
  const [trips, setTrips] = useState<PublicTripItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const { data } = await api.get<{ trips: PublicTripItem[] }>('/public/trips')
      setTrips(data.trips)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/share/${slug}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied')
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Shared itineraries</h1>
          <p className="text-slate-600">Explore public trips published by the Traveloop community.</p>
        </div>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : trips.length === 0 ? (
          <Card className="py-16 text-center text-slate-500">
            No public trips yet. Publish one from My Trips to appear here.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {trips.map((t) => (
              <Card key={t.id}>
                <h3 className="font-display text-lg font-semibold text-slate-900">{t.name}</h3>
                <p className="text-sm text-slate-500">{t.destination}</p>
                <p className="mt-1 text-xs text-slate-500">
                  By {t.owner?.name || 'Traveler'} · {new Date(t.startDate).toLocaleDateString()} to{' '}
                  {new Date(t.endDate).toLocaleDateString()}
                </p>
                {t.description && <p className="mt-2 text-sm text-slate-600">{t.description}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" type="button" className="text-xs" onClick={() => copyLink(t.shareSlug)}>
                    <Copy className="h-4 w-4" /> Copy URL
                  </Button>
                  <a href={`/share/${t.shareSlug}`} target="_blank" rel="noreferrer">
                    <Button variant="primary" type="button" className="text-xs">
                      <ExternalLink className="h-4 w-4" /> Open
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
