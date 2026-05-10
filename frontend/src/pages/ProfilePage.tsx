import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageTransition } from '@/components/PageTransition'
import { useAuthStore } from '@/store/authStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useEffect } from 'react'

const schema = z.object({
  name: z.string().min(2),
  language: z.string(),
  avatarUrl: z.string().optional(),
})

type Form = z.infer<typeof schema>

export function ProfilePage() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get<{ user: Form & { email: string } }>('/users/me')
        reset({
          name: data.user.name,
          language: data.user.language || 'en',
          avatarUrl: data.user.avatarUrl || '',
        })
      } catch (e) {
        toast.error((e as Error).message)
      }
    })()
  }, [reset])

  const onSubmit = async (values: Form) => {
    try {
      const { data } = await api.patch<{ user: Record<string, unknown> }>('/users/me', values)
      if (token && data.user && user) {
        setAuth(token, {
          ...user,
          ...data.user,
          role: user.role,
          id: user.id,
          email: user.email,
        })
      }
      toast.success('Profile updated')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const deleteAccount = async () => {
    if (!confirm('Permanently delete your Traveloop account?')) return
    try {
      await api.delete('/users/me')
      useAuthStore.getState().logout()
      window.location.href = '/'
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Profile & settings</h1>
          <p className="text-slate-600">Avatar URL, language, and privacy stance.</p>
        </div>

        <Card>
          <CardTitle>Identity</CardTitle>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Email</label>
              <Input disabled value={user?.email ?? ''} className="mt-1 bg-slate-50" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Name</label>
              <Input {...register('name')} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Language</label>
              <select
                {...register('language')}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Profile photo URL</label>
              <Input {...register('avatarUrl')} placeholder="https://…" className="mt-1" />
            </div>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              Save changes
            </Button>
          </form>
        </Card>

        <Card className="border-orange-100 bg-orange-50/40">
          <CardTitle>Danger zone</CardTitle>
          <p className="mt-2 text-sm text-slate-600">Deleting removes trips and contributions permanently.</p>
          <Button variant="danger" type="button" className="mt-4" onClick={deleteAccount}>
            Delete account
          </Button>
        </Card>
      </div>
    </PageTransition>
  )
}
