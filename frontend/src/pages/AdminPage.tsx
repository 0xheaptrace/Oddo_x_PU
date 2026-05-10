import { api } from '@/api/client'
import { Card, CardTitle } from '@/components/ui/Card'
import { PageTransition } from '@/components/PageTransition'
import { Skeleton } from '@/components/ui/Skeleton'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

type Analytics = {
  users: number
  trips: number
  notes: number
  recentTrips: { id: string; name: string; destination: string; user: { email: string } }[]
  topCities: { city: string; count: number }[]
  activityMix: { category: string; count: number }[]
}

export function AdminPage() {
  const [data, setData] = useState<Analytics | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const { data: res } = await api.get<Analytics>('/admin/analytics')
        setData(res)
      } catch (e) {
        toast.error((e as Error).message)
      }
    })()
  }, [])

  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Platform analytics</h1>
          <p className="text-slate-600">Mission control for hackathon storytelling.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-xs uppercase text-slate-500">Users</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{data.users}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase text-slate-500">Trips</p>
            <p className="mt-2 text-3xl font-bold text-indigo-700">{data.trips}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase text-slate-500">Journal entries</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">{data.notes}</p>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardTitle>Top cities</CardTitle>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topCities}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="city" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <CardTitle>Activity mix</CardTitle>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.activityMix}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card>
          <CardTitle>Recent trips</CardTitle>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-500">
                  <th className="py-2">Trip</th>
                  <th className="py-2">Destination</th>
                  <th className="py-2">Owner</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTrips.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50">
                    <td className="py-3 font-medium text-slate-900">{t.name}</td>
                    <td className="py-3 text-slate-600">{t.destination}</td>
                    <td className="py-3 text-slate-500">{t.user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageTransition>
  )
}
