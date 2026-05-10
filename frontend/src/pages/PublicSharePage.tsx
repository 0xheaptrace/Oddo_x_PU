import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import type { TripDetail } from '@/lib/types'
import { formatMoney } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Copy, Link2, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

type PublicTripPreview = {
  id: string
  name: string
  destination: string
  description?: string | null
  startDate: string
  endDate: string
  coverImageUrl?: string | null
  shareSlug?: string | null
  shareMode?: string
  currency?: string
  travelers?: number
  owner?: { name?: string | null }
  highlights?: { cities?: string[] }
}

export function PublicSharePage() {
  const { slug = '' } = useParams()
  const token = useAuthStore((s) => s.token)
  const [preview, setPreview] = useState<PublicTripPreview | null>(null)
  const [trip, setTrip] = useState<(TripDetail & { user?: { name: string } }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [requestMessage, setRequestMessage] = useState('')
  const [requested, setRequested] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setDetailsError(null)
        const { data } = await api.get<{ trip: PublicTripPreview }>(`/public/trips/${slug}`)
        setPreview(data.trip)
        if (token) {
          try {
            const full = await api.get<{ trip: TripDetail & { user?: { name: string } } }>(`/public/trips/${slug}/details`)
            setTrip(full.data.trip)
          } catch (e) {
            setDetailsError((e as Error).message)
          }
        }
      } catch (e) {
        toast.error((e as Error).message)
      } finally {
        setLoading(false)
      }
    })()
  }, [slug, token])

  const unlock = async () => {
    if (!token) {
      toast.error('Sign in first to unlock protected details')
      return
    }
    try {
      const { data } = await api.get<{ trip: TripDetail & { user?: { name: string } } }>(`/public/trips/${slug}/details`, {
        params: { password },
      })
      setTrip(data.trip)
      setDetailsError(null)
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const requestAccess = async () => {
    if (!token) {
      toast.error('Sign in first to request access')
      return
    }
    try {
      await api.post(`/public/trips/${slug}/request`, { message: requestMessage || undefined })
      setRequested(true)
      toast.success('Access request sent to trip owner')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const copyTrip = async () => {
    if (!token) {
      toast.error('Sign in to copy this trip')
      return
    }
    try {
      await api.post(`/share/trips/${slug}/copy`, password ? { password } : {})
      toast.success('Copied into your workspace')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-slate-500">
        Loading immersive itinerary…
      </div>
    )
  }

  if (!preview) {
    return <div className="flex min-h-screen items-center justify-center px-4 text-slate-500">Trip not found.</div>
  }

  const canViewFull = Boolean(trip)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.15),transparent_45%)]" />
      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 md:px-8">
          <Link to="/" className="font-display text-lg font-bold">
            Traveloop
          </Link>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              type="button"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl)
                toast.success('Link copied')
              }}
            >
              <Copy className="h-4 w-4" /> Copy link
            </Button>
            <Link to="/signup">
              <Button variant="primary">Plan yours</Button>
            </Link>
          </div>
        </div>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mx-auto max-w-5xl px-4 py-16 md:px-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Shared itinerary</p>
        <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">{preview.name}</h1>
        <p className="mt-4 max-w-2xl text-lg text-indigo-100">{preview.description}</p>
        <div className="mt-8 flex flex-wrap gap-4 text-sm text-indigo-100/90">
          <span>{preview.destination}</span>
          <span>
            {new Date(preview.startDate).toLocaleDateString()} — {new Date(preview.endDate).toLocaleDateString()}
          </span>
          {preview.owner?.name && <span>Curated by {preview.owner.name}</span>}
        </div>

        {canViewFull ? (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {trip.stops.map((stop, idx) => (
              <Card key={stop.id} className="border-white/10 bg-white/10 text-white backdrop-blur-xl">
                <p className="text-xs uppercase text-sky-200">Stop {idx + 1}</p>
                <CardTitle className="!text-white">{stop.city}</CardTitle>
                <p className="mt-2 text-sm text-indigo-100">{stop.hotelName || 'Lodging TBD'}</p>
                <ul className="mt-4 space-y-2 text-sm text-indigo-50">
                  {stop.activities.map((a) => (
                    <li key={a.id} className="rounded-xl bg-white/5 px-3 py-2">
                      {a.title}{' '}
                      {a.cost != null && (
                        <span className="text-emerald-300"> · {formatMoney(a.cost, trip.currency || 'INR')}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mt-10 border-white/10 bg-white/10 p-6 text-white backdrop-blur-xl">
            <CardTitle className="!text-white">Trip highlights</CardTitle>
            <p className="mt-2 text-sm text-indigo-100">
              Full itinerary is protected. Request access from owner to see all stops and activities.
            </p>
            {preview.highlights?.cities?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {preview.highlights.cities.map((city) => (
                  <span key={city} className="rounded-full bg-white/15 px-3 py-1 text-xs text-indigo-50">
                    {city}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-5 space-y-3">
              {preview.shareMode === 'UNLISTED' && (
                <>
                  <input
                    className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-indigo-200/70"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter unlisted password"
                    type="password"
                  />
                  <Button variant="secondary" type="button" className="border-white/30 bg-white/10 text-white" onClick={unlock}>
                    Unlock with password
                  </Button>
                </>
              )}
              {preview.shareMode === 'PUBLIC' && token && (
                <>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Optional message to owner"
                    className="min-h-24 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-indigo-200/70"
                  />
                  <Button variant="secondary" type="button" className="border-white/30 bg-white/10 text-white" onClick={requestAccess}>
                    {requested ? 'Requested' : 'Request full access'}
                  </Button>
                </>
              )}
              {!token && (
                <p className="text-xs text-indigo-100">
                  Sign in to request access or unlock protected details.
                </p>
              )}
              {detailsError && <p className="text-xs text-orange-200">{detailsError}</p>}
            </div>
          </Card>
        )}

        <div className="mt-12 flex flex-wrap gap-3">
          {canViewFull && (
            <Button variant="primary" type="button" onClick={copyTrip}>
              Copy trip into my workspace
            </Button>
          )}
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
            >
              <Share2 className="h-4 w-4" /> Post to X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
            >
              <Link2 className="h-4 w-4" /> LinkedIn
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
