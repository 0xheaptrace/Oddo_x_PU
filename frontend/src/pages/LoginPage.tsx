import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Required'),
  remember: z.boolean().optional(),
})

type Form = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const loc = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)
  const from = (loc.state as { from?: string } | null)?.from || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { remember: true } })

  const onSubmit = async (data: Form) => {
    try {
      const { data: res } = await api.post<{ token: string; user: Parameters<typeof setAuth>[1] }>('/auth/login', {
        email: data.email,
        password: data.password,
      })
      setAuth(res.token, res.user)
      toast.success('Welcome back')
      navigate(from, { replace: true })
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(14,165,233,0.18),transparent_45%)]" />
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-lg">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-xl font-bold text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-lg shadow-indigo-500/25">
              T
            </span>
            Traveloop
          </Link>
          <p className="mt-3 text-sm text-slate-600">Sign in to orchestrate your next journey.</p>
        </div>
        <Card className="p-8">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
              <Input type="email" autoComplete="email" {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-orange-600">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
              <Input type="password" autoComplete="current-password" {...register('password')} />
              {errors.password && <p className="mt-1 text-xs text-orange-600">{errors.password.message}</p>}
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" {...register('remember')} className="rounded border-slate-300 text-indigo-600" />
                Remember me
              </label>
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-700">
                Forgot password?
              </Link>
            </div>
            <Button variant="primary" type="submit" disabled={isSubmitting} className="w-full py-3 text-base">
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-center text-xs text-slate-500">
            Social login placeholders · Google / Apple buttons ship in production integrations.
          </div>
          <p className="mt-6 text-center text-sm text-slate-600">
            New here?{' '}
            <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Create an account
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  )
}
