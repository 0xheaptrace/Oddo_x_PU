import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageTransition } from '@/components/PageTransition'
import { useTripContext } from '@/hooks/useTripContext'
import { Check } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function PackingPage() {
  const { trip, setTrip } = useTripContext()
  const list = trip.packingLists[0]
  const items = list?.items ?? []
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')

  const refresh = async () => {
    const { data } = await api.get<{ trip: typeof trip }>(`/trips/${trip.id}`)
    setTrip(data.trip)
  }

  const toggle = async (itemId: string, packed: boolean) => {
    if (!list) return
    try {
      await api.patch(`/trips/${trip.id}/packing/${list.id}/items/${itemId}`, { packed: !packed })
      await refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const addItem = async () => {
    if (!list) return
    try {
      await api.post(`/trips/${trip.id}/packing/${list.id}/items`, {
        label: 'New item',
        category: 'OTHER',
      })
      toast.success('Item added')
      await refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const saveLabel = async (itemId: string, label: string) => {
    if (!list) return
    const trimmed = label.trim()
    if (!trimmed) {
      toast.error('Item name cannot be empty')
      return
    }
    try {
      await api.patch(`/trips/${trip.id}/packing/${list.id}/items/${itemId}`, { label: trimmed })
      toast.success('Item renamed')
      setEditingId(null)
      setEditingLabel('')
      await refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const applyTemplate = async (template: string) => {
    if (!list) return
    try {
      await api.post(`/trips/${trip.id}/packing/${list.id}/template`, { template })
      toast.success('Template merged')
      await refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const grouped = items.reduce<Record<string, typeof items>>((acc, it) => {
    acc[it.category] = acc[it.category] || []
    acc[it.category].push(it)
    return acc
  }, {})

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Packing checklist</h2>
            <p className="text-slate-600">Templates + per-category clarity.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" type="button" className="text-xs" onClick={() => applyTemplate('weekend')}>
              Weekend template
            </Button>
            <Button variant="secondary" type="button" className="text-xs" onClick={() => applyTemplate('business')}>
              Business template
            </Button>
            <Button variant="primary" type="button" className="text-xs" onClick={addItem}>
              Add item
            </Button>
          </div>
        </div>

        {!list ? (
          <Card>No packing list yet.</Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(grouped).map(([cat, rows]) => (
              <Card key={cat}>
                <CardTitle>{cat}</CardTitle>
                <ul className="mt-4 space-y-2">
                  {rows.map((it) => (
                    <li key={it.id}>
                      <div
                        className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${
                          it.packed
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                            : 'border-[color:var(--panel-border)] bg-[color:var(--panel-solid)]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggle(it.id, it.packed)}
                          className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                            it.packed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200'
                          }`}
                          title={it.packed ? 'Mark unpacked' : 'Mark packed'}
                        >
                          {it.packed && <Check className="h-4 w-4" />}
                        </button>

                        {editingId === it.id ? (
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <Input
                              autoFocus
                              value={editingLabel}
                              onChange={(e) => setEditingLabel(e.target.value)}
                              className="!py-1.5 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') void saveLabel(it.id, editingLabel)
                                if (e.key === 'Escape') {
                                  setEditingId(null)
                                  setEditingLabel('')
                                }
                              }}
                            />
                            <Button variant="secondary" type="button" className="text-xs" onClick={() => saveLabel(it.id, editingLabel)}>
                              Save
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className={`min-w-0 flex-1 truncate text-left ${
                              it.packed ? 'line-through opacity-70' : ''
                            }`}
                            onClick={() => {
                              setEditingId(it.id)
                              setEditingLabel(it.label === 'New item' ? '' : it.label)
                            }}
                            title="Click to rename"
                          >
                            {it.label}
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
