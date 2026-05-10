import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import { PageTransition } from '@/components/PageTransition'
import { useTripContext } from '@/hooks/useTripContext'
import type { Activity, Stop } from '@/lib/types'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

type CityGuide = {
  key: string
  city: string
  state: string
  country: string
  attractions: { title: string; category: string; durationMinutes: number; cost: number }[]
  hotels: { name: string; area: string; priceBand: string }[]
  tips: string[]
}

function SortStop({
  stop,
  tripId,
  onRefresh,
}: {
  stop: Stop
  tripId: string
  onRefresh: () => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [guide, setGuide] = useState<CityGuide | null>(null)
  const [loadingGuide, setLoadingGuide] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      try {
        setLoadingGuide(true)
        const { data } = await api.get<{ guide: CityGuide | null }>(`/guides/city`, {
          params: { city: stop.city },
        })
        if (!cancelled) setGuide(data.guide)
      } catch {
        if (!cancelled) setGuide(null)
      } finally {
        if (!cancelled) setLoadingGuide(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, stop.city])

  const addActivity = async () => {
    try {
      await api.post(`/trips/${tripId}/stops/${stop.id}/activities`, {
        title: 'New experience',
        category: 'OTHER',
        durationMinutes: 60,
        status: 'PLANNED',
      })
      toast.success('Activity added')
      await onRefresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const removeStop = async () => {
    if (!confirm('Remove this stop?')) return
    try {
      await api.delete(`/trips/${tripId}/stops/${stop.id}`)
      toast.success('Stop removed')
      await onRefresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const applyHotel = async (name: string) => {
    try {
      await api.patch(`/trips/${tripId}/stops/${stop.id}`, { hotelName: name })
      toast.success('Hotel applied')
      await onRefresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const addAttraction = async (a: CityGuide['attractions'][number]) => {
    try {
      await api.post(`/trips/${tripId}/stops/${stop.id}/activities`, {
        title: a.title,
        category: a.category,
        durationMinutes: a.durationMinutes,
        cost: a.cost,
        status: 'PLANNED',
      })
      toast.success('Added to itinerary')
      await onRefresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-2xl border shadow-sm border-[color:var(--panel-border)] bg-[color:var(--panel-solid)]"
    >
      <div className="flex items-center gap-2 border-b px-4 py-3 border-[color:var(--panel-border)]">
        <button type="button" className="cursor-grab rounded-lg p-1 hover:bg-white/10" {...attributes} {...listeners}>
          <GripVertical className="h-5 w-5 text-slate-400" />
        </button>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">
            {stop.city}
            {stop.country ? ` · ${stop.country}` : ''}
          </p>
          <p className="text-xs text-slate-500">
            {stop.stayNights ? `${stop.stayNights} nights` : 'Stay duration TBD'}
          </p>
        </div>
        <Button variant="ghost" type="button" className="text-xs" onClick={() => setOpen(!open)}>
          {open ? 'Collapse' : 'Expand'}
        </Button>
        <Button variant="ghost" type="button" className="text-orange-600" onClick={removeStop}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {open && (
        <div className="space-y-4 px-4 py-4">
          <div className="rounded-2xl border p-4 border-[color:var(--panel-border)] bg-[color:var(--panel-bg)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Smart suggestions</p>
            {loadingGuide ? (
              <p className="mt-2 text-sm text-slate-500">Fetching top attractions & hotels…</p>
            ) : guide ? (
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Top attractions in {guide.city}</p>
                  <div className="mt-2 space-y-2">
                    {guide.attractions.slice(0, 5).map((a) => (
                      <div
                        key={a.title}
                        className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm border-[color:var(--panel-border)] bg-[color:var(--panel-solid)]"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{a.title}</p>
                          <p className="text-xs text-slate-500">
                            {a.category} · {a.durationMinutes} min
                          </p>
                        </div>
                        <Button variant="secondary" type="button" className="text-xs" onClick={() => addAttraction(a)}>
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Top hotels</p>
                  <div className="mt-2 space-y-2">
                    {guide.hotels.slice(0, 5).map((h) => (
                      <div
                        key={h.name}
                        className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm border-[color:var(--panel-border)] bg-[color:var(--panel-solid)]"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{h.name}</p>
                          <p className="text-xs text-slate-500">
                            {h.area} · {h.priceBand}
                          </p>
                        </div>
                        <Button variant="secondary" type="button" className="text-xs" onClick={() => applyHotel(h.name)}>
                          Use
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                Suggestions are available for Mumbai, Goa, Kashmir, Kerala, and Udaipur.
              </p>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="Hotel"
              value={stop.hotelName || ''}
              onSave={(v) => patchStop(v, 'hotelName', tripId, stop.id, onRefresh)}
            />
            <Field
              label="Transport"
              value={stop.transportFromPrev || ''}
              onSave={(v) => patchStop(v, 'transportFromPrev', tripId, stop.id, onRefresh)}
            />
          </div>
          <NotesField stop={stop} tripId={tripId} onRefresh={onRefresh} />
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Activities</p>
            <div className="space-y-2">
              {stop.activities.map((a) => (
                <ActivityRow key={a.id} tripId={tripId} stopId={stop.id} activity={a} onRefresh={onRefresh} />
              ))}
            </div>
            <Button variant="secondary" type="button" className="mt-3 text-xs" onClick={addActivity}>
              <Plus className="h-4 w-4" /> Add activity
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  onSave,
}: {
  label: string
  value: string
  onSave: (v: string) => void
}) {
  const [v, setV] = useState(value)
  return (
    <div>
      <label className="text-xs font-semibold uppercase text-slate-500">{label}</label>
      <div className="mt-1 flex gap-2">
        <Input value={v} onChange={(e) => setV(e.target.value)} />
        <Button type="button" variant="secondary" className="shrink-0 text-xs" onClick={() => onSave(v)}>
          Save
        </Button>
      </div>
    </div>
  )
}

async function patchStop(
  val: string,
  field: keyof Stop,
  tripId: string,
  stopId: string,
  onRefresh: () => Promise<void>,
) {
  try {
    await api.patch(`/trips/${tripId}/stops/${stopId}`, { [field]: val })
    toast.success('Updated')
    await onRefresh()
  } catch (e) {
    toast.error((e as Error).message)
  }
}

function NotesField({ stop, tripId, onRefresh }: { stop: Stop; tripId: string; onRefresh: () => Promise<void> }) {
  const [notes, setNotes] = useState(stop.hotelNotes || '')
  return (
    <div>
      <label className="text-xs font-semibold uppercase text-slate-500">Hotel & logistics notes</label>
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" />
      <Button
        type="button"
        variant="secondary"
        className="mt-2 text-xs"
        onClick={() => patchStop(notes, 'hotelNotes', tripId, stop.id, onRefresh)}
      >
        Save notes
      </Button>
    </div>
  )
}

function ActivityRow({
  tripId,
  stopId,
  activity,
  onRefresh,
}: {
  tripId: string
  stopId: string
  activity: Activity
  onRefresh: () => Promise<void>
}) {
  const [assignedTo, setAssignedTo] = useState(activity.assignedTo || '')
  const [status, setStatus] = useState(activity.status || 'PLANNED')

  const saveMeta = async () => {
    try {
      await api.patch(`/trips/${tripId}/stops/${stopId}/activities/${activity.id}`, {
        assignedTo: assignedTo || null,
        status,
      })
      toast.success('Updated')
      await onRefresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const remove = async () => {
    try {
      await api.delete(`/trips/${tripId}/stops/${stopId}/activities/${activity.id}`)
      toast.success('Removed')
      await onRefresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }
  return (
    <div className="rounded-xl border p-3 border-[color:var(--panel-border)] bg-[color:var(--panel-bg)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">{activity.title}</p>
          <p className="text-xs text-slate-500">{activity.category}</p>
        </div>
        <Button variant="ghost" type="button" className="text-xs text-orange-600" onClick={remove}>
          Remove
        </Button>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <div className="md:col-span-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</label>
          <select
            className="mt-1 w-full rounded-xl border px-3 py-2 text-xs border-[color:var(--panel-border)] bg-[color:var(--panel-solid)] text-[color:var(--text)]"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="PLANNED">Planned</option>
            <option value="BOOKED">Booked</option>
            <option value="DONE">Done</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Assigned to</label>
          <div className="mt-1 flex gap-2">
            <Input
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Name / email"
              className="!py-2 text-xs"
            />
            <Button variant="secondary" type="button" className="text-xs" onClick={saveMeta}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ItineraryBuilderPage() {
  const { trip, setTrip } = useTripContext()
  const tripId = trip.id

  const refresh = async () => {
    const { data } = await api.get<{ trip: typeof trip }>(`/trips/${tripId}`)
    setTrip(data.trip)
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const sortedStops = useMemo(() => [...trip.stops].sort((a, b) => a.sortOrder - b.sortOrder), [trip.stops])

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sortedStops.findIndex((s) => s.id === active.id)
    const newIndex = sortedStops.findIndex((s) => s.id === over.id)
    const ordered = arrayMove(sortedStops, oldIndex, newIndex).map((s) => s.id)
    try {
      await api.patch(`/trips/${tripId}/stops/reorder`, { orderedIds: ordered })
      toast.success('Order updated')
      await refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const [city, setCity] = useState('')
  const addStop = async () => {
    if (!city.trim()) return
    try {
      await api.post(`/trips/${tripId}/stops`, { city: city.trim() })
      setCity('')
      toast.success('Stop added')
      await refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Itinerary builder</h2>
          <p className="text-slate-600">Reorder stops, attach logistics, and stack experiences per city.</p>
        </div>

        <Card>
          <CardTitle>Add stop</CardTitle>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <Input placeholder="City name" value={city} onChange={(e) => setCity(e.target.value)} />
            <Button variant="primary" type="button" onClick={addStop}>
              <Plus className="h-4 w-4" /> Add city stop
            </Button>
          </div>
        </Card>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={sortedStops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {sortedStops.map((stop) => (
                <SortStop key={stop.id} stop={stop} tripId={tripId} onRefresh={refresh} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {sortedStops.length === 0 && (
          <Card className="py-12 text-center text-slate-500">Add your first city to unlock the timeline.</Card>
        )}
      </div>
    </PageTransition>
  )
}
