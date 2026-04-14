'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createProvider, getCategories } from '@/lib/api'
import type { Category } from '@/types'
import { Loader2, Check } from 'lucide-react'
import { VILLAGES } from '@/utils'

const STEPS = ['اختار مهنتك', 'البيانات الأساسية', 'التفاصيل']

export default function ProviderSetupPage() {
  const router  = useRouter()
  const [step, setStep]             = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(false)
  const [userId, setUserId]         = useState('')
  const [form, setForm] = useState({
    category_id: 0,
    business_name: '', village: '', phone: '', whatsapp: '',
    address: '', description: '', price_info: '', working_hours: '',
    tags: [] as string[], tagInput: '',
  })

  useEffect(() => {
    getCategories().then(setCategories)
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setUserId(data.user.id)
    })
  }, [router])

  const update = (field: string, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }))

  function addTag() {
    const t = form.tagInput.trim()
    if (t && !form.tags.includes(t) && form.tags.length < 8) {
      update('tags', [...form.tags, t])
      update('tagInput', '')
    }
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      await createProvider({
        user_id: userId,
        category_id: form.category_id,
        business_name: form.business_name,
        village: form.village,
        phone: form.phone,
        whatsapp: form.whatsapp || form.phone,
        address: form.address,
        description: form.description,
        price_info: form.price_info,
        working_hours: form.working_hours,
        tags: form.tags,
      })
      router.push('/provider/dashboard')
      router.refresh()
    } catch {
      alert('حصل خطأ، حاول تاني')
      setLoading(false)
    }
  }

  const canStep1 = form.category_id > 0
  const canStep2 = form.business_name && form.village && form.phone

  const selectedCat = categories.find(c => c.id === form.category_id)

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* Progress Header */}
      <div className="bg-white shadow-sm px-5 pt-12 pb-5 sticky top-0 z-20">
        <div className="max-w-sm mx-auto">
          <h1 className="text-lg font-bold text-gray-900 mb-1">إعداد صفحتك</h1>
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1 flex items-center gap-1">
                <div className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                  i < step ? 'bg-brand-600' : i === step ? 'bg-brand-400' : 'bg-gray-200'
                }`} />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            {STEPS[step]} — {step + 1}/{STEPS.length}
          </p>
        </div>
      </div>

      <div className="px-5 py-6 max-w-sm mx-auto">

        {/* STEP 0: Category */}
        {step === 0 && (
          <div className="space-y-5 animate-fade-up">
            <div>
              <h2 className="font-bold text-gray-900 text-xl">إيه مهنتك؟</h2>
              <p className="text-gray-400 text-sm mt-1">اختار التصنيف الأقرب لنشاطك</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => update('category_id', cat.id)}
                  className={`card-p flex flex-col items-center py-5 gap-2 transition-all active:scale-95 ${
                    form.category_id === cat.id
                      ? 'border-2 border-brand-500 shadow-md bg-brand-50/50'
                      : 'hover:shadow-md'
                  }`}
                >
                  {form.category_id === cat.id && (
                    <div className="absolute top-2 left-2 w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                  <span className="text-3xl">{cat.icon}</span>
                  <p className="text-sm font-bold text-gray-800 text-center leading-tight">{cat.name_ar}</p>
                  <p className="text-xs text-brand-600 font-medium">{cat.action_button}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} disabled={!canStep1} className="btn-primary">
              التالي ←
            </button>
          </div>
        )}

        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-up">
            <div>
              <h2 className="font-bold text-gray-900 text-xl">البيانات الأساسية</h2>
              <p className="text-gray-400 text-sm mt-1">المعلومات اللي سيشوفها العملاء</p>
            </div>

            {selectedCat && (
              <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-2xl px-4 py-3">
                <span className="text-2xl">{selectedCat.icon}</span>
                <div>
                  <p className="text-brand-700 font-bold text-sm">{selectedCat.name_ar}</p>
                  <p className="text-brand-500 text-xs">زر الإجراء: {selectedCat.action_button}</p>
                </div>
              </div>
            )}

            <div>
              <label className="label">اسم العمل / اسمك بالكامل</label>
              <input className="input" placeholder="مثال: د. أحمد السيد / صيدلية النور"
                value={form.business_name} onChange={e => update('business_name', e.target.value)} />
            </div>
            <div>
              <label className="label">القرية / المنطقة</label>
              <select className="input" value={form.village} onChange={e => update('village', e.target.value)}>
                <option value="">اختار منطقتك</option>
                {VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">رقم الموبايل</label>
              <input className="input" type="tel" placeholder="01xxxxxxxxx"
                value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>
            <div>
              <label className="label">
                واتساب <span className="text-gray-400 font-normal">(لو مختلف عن الموبايل)</span>
              </label>
              <input className="input" type="tel" placeholder="01xxxxxxxxx (اختياري)"
                value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)} />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(0)} className="btn-outline flex-none px-6">← رجوع</button>
              <button onClick={() => setStep(2)} disabled={!canStep2} className="btn-primary">التالي ←</button>
            </div>
          </div>
        )}

        {/* STEP 2: Details */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-up">
            <div>
              <h2 className="font-bold text-gray-900 text-xl">التفاصيل</h2>
              <p className="text-gray-400 text-sm mt-1">اختياري — لكنها تزيد الثقة والظهور ⬆️</p>
            </div>

            <div>
              <label className="label">العنوان التفصيلي</label>
              <input className="input" placeholder="مثال: شارع الجمهورية، أمام المسجد"
                value={form.address} onChange={e => update('address', e.target.value)} />
            </div>
            <div>
              <label className="label">وصف العمل</label>
              <textarea className="input" rows={3}
                placeholder="اكتب وصف مختصر عن خدماتك وخبرتك..."
                value={form.description} onChange={e => update('description', e.target.value)} />
            </div>
            <div>
              <label className="label">معلومات السعر</label>
              <input className="input" placeholder="مثال: كشف 100 جنيه / من 50 جنيه"
                value={form.price_info} onChange={e => update('price_info', e.target.value)} />
            </div>
            <div>
              <label className="label">أوقات العمل</label>
              <input className="input" placeholder="مثال: 9 ص — 3 م"
                value={form.working_hours} onChange={e => update('working_hours', e.target.value)} />
            </div>
            <div>
              <label className="label">
                التخصصات / الكلمات الدلالية
                <span className="text-gray-400 font-normal"> ({form.tags.length}/8)</span>
              </label>
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="مثال: أطفال، باطنة..."
                  value={form.tagInput} onChange={e => update('tagInput', e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} />
                <button onClick={addTag} type="button"
                  className="bg-brand-600 text-white px-4 rounded-xl font-bold text-lg flex-shrink-0">+</button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.tags.map(tag => (
                    <span key={tag} className="badge bg-brand-100 text-brand-700">
                      {tag}
                      <button onClick={() => update('tags', form.tags.filter(t => t !== tag))}
                        className="text-brand-400 hover:text-red-500 font-bold mr-1">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="btn-outline flex-none px-6">← رجوع</button>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'إنشاء الصفحة 🎉'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
