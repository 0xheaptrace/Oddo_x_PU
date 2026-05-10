import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageTransition } from '@/components/PageTransition'
import { useTripContext } from '@/hooks/useTripContext'
import { formatMoney } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f97316', '#a855f7']

export function BudgetPage() {
  const { trip, setTrip } = useTripContext()
  const currency = trip.currency || 'INR'
  const [lines, setLines] = useState(trip.budgetLines)

  useEffect(() => {
    setLines(trip.budgetLines)
  }, [trip.budgetLines])

  const total = useMemo(() => lines.reduce((s, l) => s + l.amount, 0), [lines])
  const byCat = useMemo(() => {
    const m: Record<string, number> = {}
    for (const l of lines) {
      m[l.category] = (m[l.category] || 0) + l.amount
    }
    return Object.entries(m).map(([name, value]) => ({ name, value }))
  }, [lines])

  const dailyAvg = useMemo(() => {
    const ms = new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()
    const days = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)))
    return total / days
  }, [trip.endDate, trip.startDate, total])

  const over = trip.budgetCap != null && total > trip.budgetCap

  const refreshTrip = async () => {
    const { data } = await api.get<{ trip: typeof trip }>(`/trips/${trip.id}`)
    setTrip(data.trip)
  }

  const addLine = async () => {
    try {
      await api.post(`/trips/${trip.id}/budget`, {
        category: 'OTHER',
        label: 'New line',
        amount: 0,
      })
      toast.success('Line added')
      await refreshTrip()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Budget & costs</h2>
            <p className="text-slate-600">Live breakdown with gentle guardrails.</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase text-slate-500">Total tracked</p>
            <p className="text-3xl font-bold text-slate-900">{formatMoney(total, currency)}</p>
            <p className="text-xs text-slate-500">~{formatMoney(dailyAvg, currency)} / day</p>
          </div>
        </div>

        {over && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-800">
            Spend exceeds your stated cap of {formatMoney(trip.budgetCap!, currency)} — trim transport or experiences.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardTitle>Category split</CardTitle>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCat} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                    {byCat.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatMoney(Number(v ?? 0), currency)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <CardTitle>Spend by category</CardTitle>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCat}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatMoney(Number(v ?? 0), currency)} />
                  <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card>
          <CardTitle>Trend (by entry order)</CardTitle>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lines.map((l, i) => ({ i: i + 1, amount: l.amount }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="i" />
                <YAxis />
                <Tooltip formatter={(v) => formatMoney(Number(v ?? 0), currency)} />
                <Line type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Budget lines</CardTitle>
            <Button variant="secondary" type="button" className="text-xs" onClick={addLine}>
              Add line
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {lines.map((line) => (
              <BudgetLineRow key={line.id} tripId={trip.id} line={line} onSaved={refreshTrip} />
            ))}
          </div>
        </Card>
      </div>
    </PageTransition>
  )
}

function BudgetLineRow({
  tripId,
  line,
  onSaved,
}: {
  tripId: string
  line: { id: string; label: string; amount: number; category: string }
  onSaved: () => Promise<void>
}) {
  const [label, setLabel] = useState(line.label)
  const [amount, setAmount] = useState(String(line.amount))
  const save = async () => {
    try {
      await api.patch(`/trips/${tripId}/budget/${line.id}`, {
        label,
        amount: Number(amount),
      })
      toast.success('Saved')
      await onSaved()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }
  const remove = async () => {
    try {
      await api.delete(`/trips/${tripId}/budget/${line.id}`)
      toast.success('Removed')
      await onSaved()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-4 md:flex-row md:items-center">
      <Input className="md:flex-1" value={label} onChange={(e) => setLabel(e.target.value)} />
      <Input className="md:w-32" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <div className="flex gap-2">
        <Button variant="secondary" type="button" className="text-xs" onClick={save}>
          Save
        </Button>
        <Button variant="ghost" type="button" className="text-xs text-orange-600" onClick={remove}>
          Delete
        </Button>
      </div>
    </div>
  )
}
