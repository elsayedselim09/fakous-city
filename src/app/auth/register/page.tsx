'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, MapPin } from 'lucide-react'
import { VILLAGES } from '@/utils'

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const defaultRole = (params.get('role') || 'citizen') as 'citizen' | 'provider'

  const [role, setRole] = useState<'citizen' | 'provider'>(defaultRole)
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '', village: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          role,
          phone: form.phone,
          village: form.village,
        }
      }
    })

    if (signUpError) {
      setError(
        signUpError.message.includes('already registered')
          ? 'البريد الإلكتروني ده مسجل قبل كده، سجّل دخولك'
          : 'حصل خطأ، حاول تاني'
      )
      setLoading(false)
      return
    }

    router.push(role === 'provider' ? '/provider/setup' : '/citizen')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex flex-col justify-center px-5 py-8">
      <div className="w-full max-w-sm mx-auto">

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-600/30">
            <MapPin size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">إنشاء حساب</h1>
          <p className="text-gray-500 text-sm mt-1">انضم لمجتمع فاقوس</p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {(['citizen', 'provider'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`py-3.5 rounded-2xl font-semibold text-sm transition-all border-2 ${
                role === r
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-600/30'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-200'
              }`}
            >
              {r === 'citizen' ? '👤 مواطن' : '💼 مزود خدمة'}
            </button>
          ))}
        </div>

        <form onSubmit={handleRegister} className="card-p space-y-4">
          <div>
            <label className="label">الاسم الكامل</label>
            <input className="input" placeholder="محمد أحمد السيد"
              value={form.full_name} onChange={e => update('full_name', e.target.value)} required />
          </div>

          <div>
            <label className="label">رقم الموبايل</label>
            <input className="input" type="tel" placeholder="01xxxxxxxxx"
              value={form.phone} onChange={e => update('phone', e.target.value)} required />
          </div>

          <div>
            <label className="label">القرية / المنطقة</label>
            <select className="input" value={form.village} onChange={e => update('village', e.target.value)} required>
              <option value="">اختار منطقتك</option>
              {VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div>
            <label className="label">البريد الإلكتروني</label>
            <input className="input" type="email" placeholder="example@email.com"
              value={form.email} onChange={e => update('email', e.target.value)}
              required autoComplete="email" />
          </div>

          <div>
            <label className="label">كلمة المرور</label>
            <input className="input" type="password" placeholder="8 أحرف على الأقل"
              value={form.password} onChange={e => update('password', e.target.value)}
              minLength={8} required autoComplete="new-password" />
          </div>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'إنشاء الحساب'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          عندك حساب؟{' '}
          <Link href="/auth/login" className="text-brand-600 font-semibold">سجّل دخول</Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
