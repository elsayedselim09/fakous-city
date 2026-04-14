'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getProviderByUserId, updateProvider } from '@/lib/api'
import type { Provider } from '@/types'
import { Loader2, ChevronRight, Save } from 'lucide-react'
import { VILLAGES } from '@/utils'

export default function ProviderEditPage() {
  const router = useRouter()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [form, setForm] = useState({
    business_name: '', description: '', address: '', village: '',
    phone: '', whatsapp: '', price_info: '', working_hours: '',
    tags: [] as string[], tagInput: '',
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const p = await getProviderByUserId(user.id)
      if (!p) { router.push('/provider/setup'); return }
      setProvider(p)
      setForm({
        business_name: p.business_name || '',
        description:   p.description   || '',
        address:       p.address       || '',
        village:       p.village       || '',
        phone:         p.phone         || '',
        whatsapp:      p.whatsapp      || '',
        price_info:    p.price_info    || '',
        working_hours: p.working_hours || '',
        tags:          p.tags          || [],
        tagInput:      '',
      })
      setLoading(false)
    }
    load()
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

  async function handleSave() {
    if (!provider) return
    setSaving(true)
    try {
      await updateProvider(provider.id, {
        business_name: form.business_name,
        description:   form.description,
        address:       form.address,
        village:       form.village,
        phone:         form.phone,
        whatsapp:      form.whatsapp,
        price_info:    form.price_info,
        working_hours: form.working_hours,
        tags:          form.tags,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      alert('حصل خطأ، حاول تاني')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-brand-600" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--surface)] pb-8">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-500 mb-3 text-sm">
          <ChevronRight size={18} /> رجوع
        </button>
        <h1 className="font-bold text-gray-900 text-xl">تعديل بيانات العمل</h1>
      </div>

      <div className="px-5 py-5 max-w-sm mx-auto space-y-4">
        {saved && (
          <div className="success-box flex items-center justify-center gap-2">
            ✅ تم الحفظ بنجاح!
          </div>
        )}

        <div>
          <label className="label">اسم العمل</label>
          <input className="input" value={form.business_name} onChange={e => update('business_name', e.target.value)} />
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
          <input className="input" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} />
        </div>
        <div>
          <label className="label">واتساب</label>
          <input className="input" type="tel" value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)} />
        </div>
        <div>
          <label className="label">العنوان</label>
          <input className="input" value={form.address} onChange={e => update('address', e.target.value)} />
        </div>
        <div>
          <label className="label">وصف العمل</label>
          <textarea className="input" rows={3} value={form.description} onChange={e => update('description', e.target.value)} />
        </div>
        <div>
          <label className="label">معلومات السعر</label>
          <input className="input" value={form.price_info} onChange={e => update('price_info', e.target.value)} />
        </div>
        <div>
          <label className="label">أوقات العمل</label>
          <input className="input" value={form.working_hours} onChange={e => update('working_hours', e.target.value)} />
        </div>
        <div>
          <label className="label">التخصصات ({form.tags.length}/8)</label>
          <div className="flex gap-2 mb-2">
            <input className="input flex-1" placeholder="أضف تخصص..."
              value={form.tagInput} onChange={e => update('tagInput', e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() }}} />
            <button onClick={addTag} type="button" className="bg-brand-600 text-white px-4 rounded-xl font-bold">+</button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.tags.map(tag => (
                <span key={tag} className="badge bg-brand-100 text-brand-700">
                  {tag}
                  <button onClick={() => update('tags', form.tags.filter(t => t !== tag))} className="text-brand-400 hover:text-red-500 font-bold mr-1">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={16} /> حفظ التغييرات</>}
        </button>
      </div>
    </div>
  )
}
