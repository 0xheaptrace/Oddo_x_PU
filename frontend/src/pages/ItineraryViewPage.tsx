import { PageTransition } from '@/components/PageTransition'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useTripContext } from '@/hooks/useTripContext'
import { formatMoney } from '@/lib/utils'
import { CalendarDays, List, MapPinned, Timeline } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { parseISO, format } from 'date-fns'

type ViewTab = 'timeline' | 'calendar' | 'list'

const fallbackCoords: Record<string, [number, number]> = {
  mumbai: [19.076, 72.8777],
  goa: [15.2993, 74.124],
  udaipur: [24.5854, 73.7125],
  kerala: [10.8505, 76.2711],
  kochi: [9.9312, 76.2673],
  kashmir: [34.0837, 74.7973],
  srinagar: [34.0837, 74.7973],
}

function coordForCity(city: string): [number, number] | null {
  const c = city.toLowerCase()
  for (const k of Object.keys(fallbackCoords)) {
    if (c.includes(k)) return fallbackCoords[k]
  }
  return null
}

export function ItineraryViewPage() {
  const { trip } = useTripContext()
  const [tab, setTab] = useState<ViewTab>('timeline')

  const markers = useMemo(
    () =>
      trip.stops
        .map((s) => {
          if (s.lat != null && s.lng != null) return { id: s.id, city: s.city, lat: s.lat, lng: s.lng }
          const coords = coordForCity(s.city)
          if (!coords) return null
          return { id: s.id, city: s.city, lat: coords[0], lng: coords[1] }
        })
        .filter(Boolean) as { id: string; city: string; lat: number; lng: number }[],
    [trip.stops],
  )

  const center = markers[0] ? [markers[0].lat, markers[0].lng] as [number, number] : ([35.6762, 139.6503] as [number, number])

  const icon =
    typeof window !== 'undefined'
      ? L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      : undefined

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['timeline', 'Timeline', Timeline],
              ['calendar', 'Calendar', CalendarDays],
              ['list', 'List', List],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                tab === id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-[color:var(--panel-solid)] text-slate-600 ring-1 ring-[color:var(--panel-border)]'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {tab === 'timeline' && (
          <div className="relative space-y-4 border-l-2 border-indigo-100 pl-8">
            {trip.stops.map((stop, idx) => (
              <div key={stop.id} className="relative">
                <span className="absolute -left-[41px] flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--panel-solid)] font-display text-sm font-bold text-indigo-700 ring-2 ring-indigo-100 dark:ring-indigo-400/20">
                  {idx + 1}
                </span>
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle>
                        {stop.city}
                        {stop.country ? `, ${stop.country}` : ''}
                      </CardTitle>
                      <p className="mt-2 text-sm text-slate-600">
                        {stop.hotelName ? `Stay · ${stop.hotelName}` : 'Hotel TBD'}
                      </p>
                      {stop.transportFromPrev && (
                        <p className="mt-1 text-xs text-slate-500">Arriving via {stop.transportFromPrev}</p>
                      )}
                    </div>
                    <Badge>{stop.activities.length} activities</Badge>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {stop.activities.map((a) => (
                      <div key={a.id} className="rounded-xl p-3 bg-[color:var(--panel-bg)]">
                        <p className="font-medium text-slate-900">{a.title}</p>
                        <p className="text-xs text-slate-500">{a.category}</p>
                        {a.cost != null && <p className="mt-1 text-sm font-semibold text-emerald-700">{formatMoney(a.cost)}</p>}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}

        {tab === 'calendar' && (
          <Card>
            <CardTitle>Calendar snapshot</CardTitle>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {trip.stops.map((stop) => (
                <div key={stop.id} className="rounded-xl border p-4 border-[color:var(--panel-border)] bg-[color:var(--panel-solid)]">
                  <p className="font-semibold text-slate-900">{stop.city}</p>
                  <p className="text-xs text-slate-500">
                    {stop.arrivalDate && format(parseISO(stop.arrivalDate), 'MMM d')}
                    {stop.departureDate && ` → ${format(parseISO(stop.departureDate), 'MMM d')}`}
                  </p>
                  <div className="mt-3 space-y-2">
                    {stop.activities.map((a) => (
                      <div key={a.id} className="rounded-lg bg-indigo-50/30 px-3 py-2 text-sm text-indigo-900 dark:text-indigo-200">
                        {a.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === 'list' && (
          <Card>
            <CardTitle>Structured list</CardTitle>
            <ul className="mt-4 space-y-3">
              {trip.stops.flatMap((stop) =>
                stop.activities.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm bg-[color:var(--panel-bg)]"
                  >
                    <span className="font-medium text-slate-900">
                      {stop.city} · {a.title}
                    </span>
                    <span className="text-slate-500">{a.category}</span>
                  </li>
                )),
              )}
            </ul>
          </Card>
        )}

        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b px-5 py-4 border-[color:var(--panel-border)]">
            <MapPinned className="h-5 w-5 text-sky-600" />
            <CardTitle className="!mb-0">Route map</CardTitle>
          </div>
          <div className="h-[380px] w-full">
            <MapContainer center={center} zoom={markers.length ? 5 : 3} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              {icon &&
                markers.map((m) => (
                  <Marker key={m.id} position={[m.lat, m.lng]} icon={icon}>
                    <Popup>{m.city}</Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        </Card>
      </div>
    </PageTransition>
  )
}
