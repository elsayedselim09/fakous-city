'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, MapPin } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('البريد الإلكتروني أو كلمة المرور غلط')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    router.push(profile?.role === 'provider' ? '/provider/dashboard' : '/citizen')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex flex-col justify-center px-5">
      <div className="w-full max-w-sm mx-auto">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-600/30">
            <MapPin size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">أهلاً بيك</h1>
          <p className="text-gray-500 text-sm mt-1">سجّل دخولك لحسابك</p>
        </div>

        <form onSubmit={handleLogin} className="card-p space-y-4">
          <div>
            <label className="label">البريد الإلكتروني</label>
            <input
              type="email"
              className="input"
              placeholder="example@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="input pl-12"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'دخول'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          ماعندكش حساب؟{' '}
          <Link href="/auth/register" className="text-brand-600 font-semibold">
            سجّل دلوقتي
          </Link>
        </p>
        <p className="text-center mt-2">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            ← رجوع للرئيسية
          </Link>
        </p>
      </div>
    </div>
  )
}
