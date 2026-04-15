'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getProviderByUserId, updateProvider } from '@/lib/api'
import type { Provider } from '@/types'
import { Loader2, ChevronRight, Save } from 'lucide-react'
import { VILLAGES } from '@/utils'

export default function EditPage() {
  const router = useRouter()
  const [provider, setProvider] = useState<Provider|null>(null)
  const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ business_name:'', description:'', address:'', village:'', phone:'', whatsapp:'', price_info:'', working_hours:'', tags:[] as string[], tagInput:'' })

  useEffect(() => {
    createClient().auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      const p = await getProviderByUserId(user.id)
      if (!p) { router.push('/provider/setup'); return }
      setProvider(p); setForm({ business_name:p.business_name||'', description:p.description||'', address:p.address||'', village:p.village||'', phone:p.phone||'', whatsapp:p.whatsapp||'', price_info:p.price_info||'', working_hours:p.working_hours||'', tags:p.tags||[], tagInput:'' })
    })
  }, [router])

  const up = (f: string, v: unknown) => setForm(p => ({...p,[f]:v}))

  async function save() {
    if (!provider) return; setSaving(true)
    try {
      await updateProvider(provider.id, { business_name:form.business_name, description:form.description, address:form.address, village:form.village, phone:form.phone, whatsapp:form.whatsapp, price_info:form.price_info, working_hours:form.working_hours, tags:form.tags })
      setSaved(true); setTimeout(() => setSaved(false), 3000)
    } catch { alert('حصل خطأ') } finally { setSaving(false) }
  }

  if (!provider) return <div className="min-h-screen flex items-center justify-center"><Loader2 size={28} className="animate-spin text-brand-600"/></div>

  return (
    <div className="min-h-screen bg-[var(--surface)] pb-8">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-500 mb-3 text-sm"><ChevronRight size={18}/>رجوع</button>
        <h1 className="font-bold text-gray-900 text-xl">تعديل بيانات العمل</h1>
      </div>
      <div className="px-5 py-5 max-w-sm mx-auto space-y-4">
        {saved && <div className="success-box">✅ تم الحفظ بنجاح!</div>}
        {[{l:'اسم العمل',f:'business_name',p:'صيدلية النور'},{l:'الموبايل',f:'phone',p:'01xxxxxxxxx',t:'tel'},{l:'واتساب',f:'whatsapp',p:'01xxxxxxxxx',t:'tel'},{l:'العنوان',f:'address',p:'شارع الجمهورية'},{l:'السعر',f:'price_info',p:'كشف 100 جنيه'},{l:'أوقات العمل',f:'working_hours',p:'9 ص — 3 م'}].map(({l,f,p,t}) => (
          <div key={f}><label className="label">{l}</label><input className="input" type={t||'text'} placeholder={p} value={(form as any)[f]} onChange={e => up(f,e.target.value)}/></div>
        ))}
        <div><label className="label">القرية</label><select className="input" value={form.village} onChange={e => up('village',e.target.value)}><option value="">اختار</option>{VILLAGES.map(v=><option key={v} value={v}>{v}</option>)}</select></div>
        <div><label className="label">الوصف</label><textarea className="input" rows={3} value={form.description} onChange={e => up('description',e.target.value)}/></div>
        <div>
          <label className="label">التخصصات ({form.tags.length}/8)</label>
          <div className="flex gap-2 mb-2"><input className="input flex-1" placeholder="أضف تخصص..." value={form.tagInput} onChange={e => up('tagInput',e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();const t=form.tagInput.trim();if(t&&!form.tags.includes(t)&&form.tags.length<8){up('tags',[...form.tags,t]);up('tagInput','')}}}}/><button type="button" onClick={()=>{const t=form.tagInput.trim();if(t&&!form.tags.includes(t)&&form.tags.length<8){up('tags',[...form.tags,t]);up('tagInput','')}}} className="bg-brand-600 text-white px-4 rounded-xl font-bold">+</button></div>
          {form.tags.length>0&&<div className="flex flex-wrap gap-2">{form.tags.map(t=><span key={t} className="badge bg-brand-100 text-brand-700">{t}<button onClick={()=>up('tags',form.tags.filter(x=>x!==t))} className="font-bold mr-1">×</button></span>)}</div>}
        </div>
        <button onClick={save} disabled={saving} className="btn-primary">{saving?<Loader2 size={18} className="animate-spin"/>:<><Save size={16}/>حفظ التغييرات</>}</button>
      </div>
    </div>
  )
}
