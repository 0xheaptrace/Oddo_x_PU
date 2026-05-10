import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import { PageTransition } from '@/components/PageTransition'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { useState } from 'react'

const schema = z.object({
  name: z.string().min(2),
  destination: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'UPCOMING', 'COMPLETED']),
  currency: z.string().min(1),
  travelers: z.number().int().min(1).max(20),
})

type Form = z.infer<typeof schema>

export function CreateTripPage() {
  const navigate = useNavigate()
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'DRAFT', currency: 'INR', travelers: 1 },
  })

  const start = watch('startDate')
  const end = watch('endDate')
  let duration = 0
  try {
    if (start && end) {
      duration = differenceInCalendarDays(parseISO(end), parseISO(start)) + 1
    }
  } catch {
    duration = 0
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post<{ url: string }>('/upload/cover', fd)
      setCoverUrl(data.url)
      toast.success('Cover uploaded')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const saveTrip = async (data: Form, goPlanner: boolean) => {
    try {
      const { data: res } = await api.post<{ trip: { id: string } }>('/trips', {
        ...data,
        coverImageUrl: coverUrl,
      })
      toast.success('Trip saved')
      navigate(goPlanner ? `/dashboard/trips/${res.trip.id}/itinerary` : `/dashboard/trips/${res.trip.id}`)
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <PageTransition>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Create trip</h1>
          <p className="mt-2 text-slate-600">Name your adventure, anchor the dates, optional hero imagery.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit((d: Form) => saveTrip(d, true))}>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Trip name</label>
              <Input {...register('name')} />
              {errors.name && <p className="mt-1 text-xs text-orange-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Destination focus</label>
              <Input {...register('destination')} placeholder="e.g. Pacific Northwest" />
              {errors.destination && <p className="mt-1 text-xs text-orange-600">{errors.destination.message}</p>}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Start</label>
                <Input type="date" {...register('startDate')} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">End</label>
                <Input type="date" {...register('endDate')} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Description</label>
              <Textarea {...register('description')} placeholder="Mood, goals, travelers…" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Status</label>
              <select
                {...register('status')}
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              >
                <option value="DRAFT">Draft</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Currency</label>
                <select
                  {...register('currency')}
                  className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Travelers</label>
                <Input type="number" min={1} max={20} {...register('travelers', { valueAsNumber: true })} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Cover photo</label>
              <Input type="file" accept="image/*" onChange={onFile} disabled={uploading} />
              <p className="mt-1 text-xs text-slate-500">Stored locally on the API disk — swap to Cloudinary with env keys.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save & open planner'}
              </Button>
              <Button
                variant="secondary"
                type="button"
                disabled={isSubmitting}
                  onClick={() => handleSubmit((d: Form) => saveTrip(d, false))()}
              >
                Save draft only
              </Button>
            </div>
          </form>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardTitle>Live preview</CardTitle>
            <div
              className="mt-4 h-44 rounded-2xl bg-cover bg-center shadow-inner"
              style={{
                backgroundImage: coverUrl
                  ? `linear-gradient(145deg,rgba(15,23,42,.55),rgba(14,165,233,.35)), url(${coverUrl})`
                  : 'linear-gradient(145deg,#312e81,#0ea5e9)',
              }}
            />
            <div className="mt-4 space-y-1">
              <p className="text-xs font-semibold uppercase text-sky-700">Preview card</p>
              <h3 className="font-display text-xl font-bold text-slate-900">{watch('name') || 'Your trip name'}</h3>
              <p className="text-sm text-slate-600">{watch('destination') || 'Destination'}</p>
              <p className="text-sm text-slate-500">
                {duration > 0 ? `${duration} days planned` : 'Duration appears when dates are valid'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
