import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { z } from 'zod'

const schema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: 'Passwords must match', path: ['confirm'] })

type Form = z.infer<typeof schema>

export function SignupPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Form) => {
    try {
      const { data: res } = await api.post<{ token: string; user: Parameters<typeof setAuth>[1] }>('/auth/register', {
        email: data.email,
        password: data.password,
        name: data.name,
      })
      setAuth(res.token, res.user)
      toast.success('Workspace ready')
      navigate('/dashboard', { replace: true })
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(14,165,233,0.2),transparent_45%)]" />
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-lg">
        <div className="mb-8 text-center">
          <Link to="/" className="font-display text-xl font-bold text-slate-900">
            Traveloop
          </Link>
          <p className="mt-3 text-sm text-slate-600">Spin up your intelligent trip workspace.</p>
        </div>
        <Card className="p-8">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Full name</label>
              <Input {...register('name')} />
              {errors.name && <p className="mt-1 text-xs text-orange-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
              <Input type="email" {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-orange-600">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
              <Input type="password" {...register('password')} />
              {errors.password && <p className="mt-1 text-xs text-orange-600">{errors.password.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Confirm password</label>
              <Input type="password" {...register('confirm')} />
              {errors.confirm && <p className="mt-1 text-xs text-orange-600">{errors.confirm.message}</p>}
            </div>
            <Button variant="primary" type="submit" disabled={isSubmitting} className="w-full py-3 text-base">
              {isSubmitting ? 'Creating…' : 'Create account'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have access?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  )
}
