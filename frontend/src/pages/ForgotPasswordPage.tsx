import { api } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
})

type Form = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Form) => {
    try {
      await api.post('/auth/forgot-password', data)
      toast.success('Check your inbox for reset instructions.')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="p-8">
          <h1 className="font-display text-2xl font-bold text-slate-900">Reset password</h1>
          <p className="mt-2 text-sm text-slate-600">
            We will email a secure reset link if an account exists for this address.
          </p>
          <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
              <Input type="email" {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-orange-600">{errors.email.message}</p>}
            </div>
            <Button variant="primary" type="submit" disabled={isSubmitting} className="w-full py-3">
              {isSubmitting ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm">
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Back to login
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  )
}
