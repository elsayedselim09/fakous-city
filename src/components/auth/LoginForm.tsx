import { useState } from 'react'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { loginSchema, type LoginInput } from '@/lib/validations'

export function LoginForm() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginInput) {
    setServerError('')
    const sb = createClient()
    const { data, error } = await sb.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })
    if (error || !data.user) {
      setServerError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      return
    }
    const { data: profile } = await sb
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()
    router.push(profile?.role === 'provider' ? '/provider/dashboard' : '/citizen')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card-p space-y-4">
      <Input
        label="البريد الإلكتروني"
        type="email"
        placeholder="example@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <div>
        <Input
          label="كلمة المرور"
          type={showPass ? 'text' : 'password'}
          placeholder="••••••••"
          autoComplete="current-password"
          className="pl-12"
          error={errors.password?.message}
          {...register('password')}
        />
        <button
          type="button"
          onClick={() => setShowPass((v) => !v)}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
          aria-label={showPass ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
        >
          {showPass ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
        </button>
      </div>
      {serverError && <div role="alert" className="error-box">{serverError}</div>}
      <Button type="submit" loading={isSubmitting} fullWidth>
        دخول
      </Button>
      <p className="text-center text-sm text-gray-500">
        ماعندكش حساب؟{' '}
        <Link href="/auth/register" className="text-brand-600 font-semibold">
          سجّل دلوقتي
        </Link>
      </p>
    </form>
  )
}
