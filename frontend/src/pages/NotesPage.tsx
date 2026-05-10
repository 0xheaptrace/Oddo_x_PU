import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import { PageTransition } from '@/components/PageTransition'
import { useTripContext } from '@/hooks/useTripContext'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format, parseISO } from 'date-fns'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export function NotesPage() {
  const { trip, setTrip } = useTripContext()
  const [notes, setNotes] = useState(trip.notes)

  useEffect(() => {
    setNotes(trip.notes)
  }, [trip.notes])

  const refresh = async () => {
    const { data } = await api.get<{ trip: typeof trip }>(`/trips/${trip.id}`)
    setTrip(data.trip)
  }

  const create = async () => {
    try {
      await api.post(`/trips/${trip.id}/notes`, {
        title: 'New note',
        content: '',
      })
      toast.success('Note created')
      await refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Trip journal</h2>
            <p className="text-slate-600">Markdown-friendly notes with day anchors.</p>
          </div>
          <Button variant="primary" type="button" onClick={create}>
            New note
          </Button>
        </div>

        <div className="grid gap-6">
          {notes.map((n) => (
            <NoteCard key={n.id} tripId={trip.id} note={n} onSaved={refresh} />
          ))}
        </div>
        {notes.length === 0 && (
          <Card className="py-12 text-center text-slate-500">Capture reminders, contacts, and memories.</Card>
        )}
      </div>
    </PageTransition>
  )
}

function NoteCard({
  tripId,
  note,
  onSaved,
}: {
  tripId: string
  note: {
    id: string
    title?: string | null
    content: string
    dayDate?: string | null
    contactInfo?: string | null
  }
  onSaved: () => Promise<void>
}) {
  const [title, setTitle] = useState(note.title || '')
  const [content, setContent] = useState(note.content)
  const [day, setDay] = useState(note.dayDate ? note.dayDate.slice(0, 10) : '')
  const [contact, setContact] = useState(note.contactInfo || '')
  const [preview, setPreview] = useState(false)

  const save = async () => {
    try {
      await api.patch(`/trips/${tripId}/notes/${note.id}`, {
        title,
        content,
        dayDate: day ? new Date(day).toISOString() : null,
        contactInfo: contact || null,
      })
      toast.success('Saved')
      await onSaved()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const remove = async () => {
    if (!confirm('Delete note?')) return
    try {
      await api.delete(`/trips/${tripId}/notes/${note.id}`)
      toast.success('Deleted')
      await onSaved()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap gap-3 border-b border-slate-100 pb-4">
        <Input className="max-w-md" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <Input type="date" className="w-44" value={day} onChange={(e) => setDay(e.target.value)} />
        <Input
          className="max-w-md flex-1"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Hotel / contact info"
        />
        <Button variant="secondary" type="button" className="text-xs" onClick={() => setPreview(!preview)}>
          {preview ? 'Edit' : 'Preview'}
        </Button>
        <Button variant="primary" type="button" className="text-xs" onClick={save}>
          Save
        </Button>
        <Button variant="ghost" type="button" className="text-xs text-orange-600" onClick={remove}>
          Delete
        </Button>
      </div>
      {note.dayDate && (
        <p className="mt-3 text-xs text-slate-500">
          Day anchor · {format(parseISO(note.dayDate), 'MMM d, yyyy')}
        </p>
      )}
      {preview ? (
        <div className="prose prose-slate mt-4 max-w-none prose-headings:font-display prose-a:text-indigo-600">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || '*Nothing written yet*'}</ReactMarkdown>
        </div>
      ) : (
        <Textarea className="mt-4 min-h-[200px] font-mono text-sm" value={content} onChange={(e) => setContent(e.target.value)} />
      )}
    </Card>
  )
}
