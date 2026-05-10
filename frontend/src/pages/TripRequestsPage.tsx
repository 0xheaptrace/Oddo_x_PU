import { api } from '@/api/client'
import { PageTransition } from '@/components/PageTransition'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

type TripAccessRequest = {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  message?: string | null
  requester?: {
    id: string
    name?: string | null
    email: string
  }
}

export function TripRequestsPage() {
  const { tripId = '' } = useParams()
  const [requests, setRequests] = useState<TripAccessRequest[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const { data } = await api.get<{ requests: TripAccessRequest[] }>(`/trips/${tripId}/requests`)
      setRequests(data.requests)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId])

  const respond = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      await api.patch(`/trips/${tripId}/requests/${requestId}`, { action })
      toast.success(action === 'APPROVE' ? 'Request approved' : 'Request rejected')
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Access requests</h2>
          <p className="text-slate-600">Approve or reject travelers who requested full itinerary access.</p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading requests…</p>
        ) : requests.length === 0 ? (
          <Card className="py-12 text-center text-slate-500">No requests yet.</Card>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <Card key={r.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardTitle className="!mb-1">{r.requester?.name || 'Traveler'}</CardTitle>
                    <p className="text-sm text-slate-500">{r.requester?.email}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Status: {r.status}</p>
                    {r.message ? <p className="mt-2 text-sm text-slate-700">{r.message}</p> : null}
                  </div>
                  {r.status === 'PENDING' ? (
                    <div className="flex gap-2">
                      <Button variant="secondary" type="button" className="text-xs" onClick={() => respond(r.id, 'APPROVE')}>
                        Approve
                      </Button>
                      <Button variant="ghost" type="button" className="text-xs text-orange-600" onClick={() => respond(r.id, 'REJECT')}>
                        Reject
                      </Button>
                    </div>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
