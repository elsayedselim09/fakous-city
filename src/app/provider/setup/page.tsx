'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createProvider, getCategories } from '@/lib/api'
import type { Category } from '@/types'
import { Loader2, Check } from 'lucide-react'
import { VILLAGES } from '@/utils'

const STEPS = ['المهنة','البيانات','التفاصيل']

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState({ category_id:0, business_name:'', village:'', phone:'', whatsapp:'', address:'', description:'', price_info:'', working_hours:'', tags:[] as string[], tagInput:'' })

  useEffect(() => {
    getCategories().then(setCategories)
    createClient().auth.getUser().then(({ data }) => { if (!data.user) router.push('/auth/login'); else setUserId(data.user.id) })
  }, [router])

  const up = (f: string, v: unknown) => setForm(p => ({ ...p, [f]: v }))

  async function submit() {
    setLoading(true)
    try {
      await createProvider({ user_id: userId, category_id: form.category_id, business_name: form.business_name, village: form.village, phone: form.phone, whatsapp: form.whatsapp||form.phone, address: form.address, description: form.description, price_info: form.price_info, working_hours: form.working_hours, tags: form.tags } as any)
      router.push('/provider/dashboard')
    } catch { alert('حصل خطأ') } finally { setLoading(false) }
  }

  const sel = categories.find(c => c.id === form.category_id)

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <div className="bg-white shadow-sm px-5 pt-12 pb-5 sticky top-0 z-20">
        <div className="max-w-sm mx-auto">
          <h1 className="text-lg font-bold text-gray-900 mb-1">إعداد صفحتك</h1>
          <div className="flex gap-2">{STEPS.map((_,i) => <div key={i} className={`h-1.5 rounded-full flex-1 transition-all ${i<step?'bg-brand-600':i===step?'bg-brand-400':'bg-gray-200'}`}/>)}</div>
          <p className="text-xs text-gray-400 mt-1.5">{STEPS[step]} — {step+1}/{STEPS.length}</p>
        </div>
      </div>
      <div className="px-5 py-6 max-w-sm mx-auto">
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="font-bold text-gray-900 text-xl">إيه مهنتك؟</h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => up('category_id', cat.id)} className={`card-p flex flex-col items-center py-5 gap-2 relative transition-all active:scale-95 ${form.category_id===cat.id?'border-2 border-brand-500 shadow-md bg-brand-50/50':'hover:shadow-md'}`}>
                  {form.category_id===cat.id && <div className="absolute top-2 left-2 w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center"><Check size={12} className="text-white"/></div>}
                  <span className="text-3xl">{cat.icon}</span>
                  <p className="text-sm font-bold text-gray-800 text-center">{cat.name_ar}</p>
                  <p className="text-xs text-brand-600 font-medium">{cat.action_button}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} disabled={!form.category_id} className="btn-primary">التالي ←</button>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 text-xl">البيانات الأساسية</h2>
            {sel && <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-2xl px-4 py-3"><span className="text-2xl">{sel.icon}</span><div><p className="text-brand-700 font-bold text-sm">{sel.name_ar}</p><p className="text-brand-500 text-xs">{sel.action_button}</p></div></div>}
            <div><label className="label">اسم العمل / اسمك</label><input className="input" placeholder="د. أحمد السيد / صيدلية النور" value={form.business_name} onChange={e => up('business_name', e.target.value)}/></div>
            <div><label className="label">القرية</label><select className="input" value={form.village} onChange={e => up('village', e.target.value)}><option value="">اختار</option>{VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
            <div><label className="label">الموبايل</label><input className="input" type="tel" placeholder="01xxxxxxxxx" value={form.phone} onChange={e => up('phone', e.target.value)}/></div>
            <div><label className="label">واتساب (اختياري)</label><input className="input" type="tel" placeholder="01xxxxxxxxx" value={form.whatsapp} onChange={e => up('whatsapp', e.target.value)}/></div>
            <div className="flex gap-3"><button onClick={() => setStep(0)} className="btn-outline flex-none px-6">← رجوع</button><button onClick={() => setStep(2)} disabled={!form.business_name||!form.village||!form.phone} className="btn-primary">التالي ←</button></div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 text-xl">التفاصيل (اختياري)</h2>
            <div><label className="label">العنوان</label><input className="input" placeholder="شارع الجمهورية، أمام المسجد" value={form.address} onChange={e => up('address', e.target.value)}/></div>
            <div><label className="label">وصف العمل</label><textarea className="input" rows={3} placeholder="وصف خدماتك وخبرتك..." value={form.description} onChange={e => up('description', e.target.value)}/></div>
            <div><label className="label">السعر</label><input className="input" placeholder="كشف 100 جنيه" value={form.price_info} onChange={e => up('price_info', e.target.value)}/></div>
            <div><label className="label">أوقات العمل</label><input className="input" placeholder="9 ص — 3 م" value={form.working_hours} onChange={e => up('working_hours', e.target.value)}/></div>
            <div>
              <label className="label">التخصصات ({form.tags.length}/8)</label>
              <div className="flex gap-2"><input className="input flex-1" placeholder="أطفال، باطنة..." value={form.tagInput} onChange={e => up('tagInput', e.target.value)} onKeyDown={e => { if (e.key==='Enter') { e.preventDefault(); const t=form.tagInput.trim(); if(t&&!form.tags.includes(t)&&form.tags.length<8){up('tags',[...form.tags,t]);up('tagInput','')} }}}/><button type="button" onClick={() => { const t=form.tagInput.trim(); if(t&&!form.tags.includes(t)&&form.tags.length<8){up('tags',[...form.tags,t]);up('tagInput','')} }} className="bg-brand-600 text-white px-4 rounded-xl font-bold">+</button></div>
              {form.tags.length>0 && <div className="flex flex-wrap gap-2 mt-2">{form.tags.map(t => <span key={t} className="badge bg-brand-100 text-brand-700">{t}<button onClick={() => up('tags',form.tags.filter(x=>x!==t))} className="font-bold mr-1">×</button></span>)}</div>}
            </div>
            <div className="flex gap-3"><button onClick={() => setStep(1)} className="btn-outline flex-none px-6">← رجوع</button><button onClick={submit} disabled={loading} className="btn-primary">{loading?<Loader2 size={18} className="animate-spin"/>:'إنشاء الصفحة 🎉'}</button></div>
          </div>
        )}
      </div>
    </div>
  )
}
