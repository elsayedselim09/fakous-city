'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getProviderByUserId, updateProvider } from '@/lib/api'
import { uploadAvatar, uploadIdCard, uploadIntroVideo, uploadProviderImage } from '@/lib/storage'
import type { Provider } from '@/types'
import { Loader2, ChevronRight, Save, Camera, Upload, Video, ShieldCheck, Image as ImageIcon, X, Check } from 'lucide-react'
import { VILLAGES } from '@/utils'

type Tab = 'basic' | 'identity' | 'media'

export default function EditPage() {
  const router = useRouter()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('basic')
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')

  const [form, setForm] = useState({
    business_name: '', description: '', address: '', village: '', phone: '', whatsapp: '',
    price_info: '', working_hours: '', tags: [] as string[], tagInput: '',
    years_experience: '', certInput: '', certificates: [] as string[],
    national_id: '', gender: '', birth_date: '',
  })

  const avatarRef = useRef<HTMLInputElement>(null)
  const idFrontRef = useRef<HTMLInputElement>(null)
  const idBackRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const imagesRef = useRef<HTMLInputElement>(null)

  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null)
  const [idFrontPreview, setIdFrontPreview] = useState('')
  const [idBackFile, setIdBackFile] = useState<File | null>(null)
  const [idBackPreview, setIdBackPreview] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoName, setVideoName] = useState('')
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])

  useEffect(() => {
    createClient().auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const p = await getProviderByUserId(user.id)
      if (!p) { router.push('/provider/setup'); return }
      setProvider(p)
      setForm({
        business_name: p.business_name || '', description: p.description || '',
        address: p.address || '', village: p.village || '', phone: p.phone || '',
        whatsapp: p.whatsapp || '', price_info: p.price_info || '', working_hours: p.working_hours || '',
        tags: p.tags || [], tagInput: '', years_experience: p.years_experience?.toString() || '',
        certInput: '', certificates: p.certificates || [],
        national_id: p.national_id || '', gender: p.gender || '', birth_date: p.birth_date || '',
      })
    })
  }, [router])

  const up = (f: string, v: unknown) => setForm(p => ({ ...p, [f]: v }))

  function previewFile(file: File, setP: (s: string) => void) {
    const r = new FileReader(); r.onload = e => setP(e.target?.result as string); r.readAsDataURL(file)
  }

  function addTag() { const t = form.tagInput.trim(); if (t && !form.tags.includes(t) && form.tags.length < 8) { up('tags', [...form.tags, t]); up('tagInput', '') } }
  function addCert() { const t = form.certInput.trim(); if (t && form.certificates.length < 10) { up('certificates', [...form.certificates, t]); up('certInput', '') } }

  async function save() {
    if (!provider) return
    setSaving(true); setError('')
    try {
      const profileUpdates: Record<string, unknown> = {}
      const providerUpdates: Record<string, unknown> = {
        business_name: form.business_name, description: form.description,
        address: form.address, village: form.village, phone: form.phone,
        whatsapp: form.whatsapp, price_info: form.price_info, working_hours: form.working_hours,
        tags: form.tags, years_experience: form.years_experience ? parseInt(form.years_experience) : null,
        certificates: form.certificates, national_id: form.national_id,
        gender: form.gender, birth_date: form.birth_date,
      }

      if (avatarFile) profileUpdates.avatar_url = await uploadAvatar(userId, avatarFile)
      if (idFrontFile) { const url = await uploadIdCard(userId, idFrontFile, 'front'); providerUpdates.id_front_url = url; profileUpdates.id_front_url = url }
      if (idBackFile) { const url = await uploadIdCard(userId, idBackFile, 'back'); providerUpdates.id_back_url = url; profileUpdates.id_back_url = url }
      if (videoFile) providerUpdates.intro_video_url = await uploadIntroVideo(userId, videoFile)

      const existingImages = provider.images || []
      if (newImageFiles.length > 0) {
        const newUrls: string[] = []
        for (const f of newImageFiles.slice(0, 6 - existingImages.length)) newUrls.push(await uploadProviderImage(userId, f))
        providerUpdates.images = [...existingImages, ...newUrls]
      }

      if (Object.keys(profileUpdates).length > 0) await createClient().from('profiles').update(profileUpdates).eq('id', userId)
      const updated = await updateProvider(provider.id, providerUpdates)
      setProvider(updated); setSaved(true); setTimeout(() => setSaved(false), 3000)
      setNewImageFiles([]); setNewImagePreviews([])
    } catch (e: any) { setError('حصل خطأ: ' + (e?.message || '')) }
    finally { setSaving(false) }
  }

  if (!provider) return <div className="min-h-screen flex items-center justify-center"><Loader2 size={28} className="animate-spin text-brand-600" /></div>

  const currentAvatar = avatarPreview || (provider as any).profile?.avatar_url
  const TABS: { id: Tab; label: string }[] = [
    { id: 'basic', label: '📋 البيانات' },
    { id: 'identity', label: '🛡️ الهوية' },
    { id: 'media', label: '📷 الميديا' },
  ]

  return (
    <div className="min-h-screen bg-[var(--surface)] pb-8">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-500 mb-3 text-sm"><ChevronRight size={18} />رجوع</button>
        <h1 className="font-bold text-gray-900 text-xl">تعديل بيانات العمل</h1>
        <div className="flex gap-2 mt-3">
          {TABS.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === t.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{t.label}</button>)}
        </div>
      </div>

      <div className="px-5 py-5 max-w-sm mx-auto space-y-4">
        {saved && <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl px-4 py-3 text-sm text-center">✅ تم الحفظ بنجاح!</div>}
        {error && <div className="bg-red-50 text-red-700 text-sm rounded-2xl px-4 py-3 border border-red-100">{error}</div>}

        {/* === TAB: البيانات الأساسية === */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            {/* صورة البروفايل */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div onClick={() => avatarRef.current?.click()} className="w-24 h-24 rounded-full border-2 border-brand-300 overflow-hidden flex items-center justify-center cursor-pointer bg-brand-50">
                  {currentAvatar ? <img src={currentAvatar} className="w-full h-full object-cover" alt="avatar" /> : <Camera size={24} className="text-brand-400" />}
                </div>
                <div className="absolute bottom-0 right-0 w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center pointer-events-none"><Camera size={13} className="text-white" /></div>
              </div>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) { setAvatarFile(e.target.files[0]); previewFile(e.target.files[0], setAvatarPreview) } }} />
            </div>

            {[{ l: 'اسم العمل', f: 'business_name', p: 'صيدلية النور' }, { l: 'الموبايل', f: 'phone', p: '01xxxxxxxxx', t: 'tel' }, { l: 'واتساب', f: 'whatsapp', p: '01xxxxxxxxx', t: 'tel' }, { l: 'العنوان', f: 'address', p: 'شارع الجمهورية' }, { l: 'السعر', f: 'price_info', p: 'كشف 100 جنيه' }, { l: 'أوقات العمل', f: 'working_hours', p: '9 ص — 3 م' }].map(({ l, f, p, t }) => (
              <div key={f}><label className="label">{l}</label><input className="input" type={t || 'text'} placeholder={p} value={(form as any)[f]} onChange={e => up(f, e.target.value)} /></div>
            ))}
            <div><label className="label">سنوات الخبرة</label><input className="input" type="number" min={0} max={60} value={form.years_experience} onChange={e => up('years_experience', e.target.value)} /></div>
            <div><label className="label">القرية</label><select className="input" value={form.village} onChange={e => up('village', e.target.value)}><option value="">اختار</option>{VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
            <div><label className="label">الوصف</label><textarea className="input" rows={3} value={form.description} onChange={e => up('description', e.target.value)} /></div>

            <div>
              <label className="label">التخصصات ({form.tags.length}/8)</label>
              <div className="flex gap-2 mb-2"><input className="input flex-1" placeholder="أضف تخصص..." value={form.tagInput} onChange={e => up('tagInput', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} /><button type="button" onClick={addTag} className="bg-brand-600 text-white px-4 rounded-xl font-bold">+</button></div>
              {form.tags.length > 0 && <div className="flex flex-wrap gap-2">{form.tags.map(t => <span key={t} className="badge bg-brand-100 text-brand-700">{t}<button onClick={() => up('tags', form.tags.filter(x => x !== t))} className="font-bold mr-1">×</button></span>)}</div>}
            </div>

            <div>
              <label className="label">الشهادات والمؤهلات</label>
              <div className="flex gap-2 mb-2"><input className="input flex-1" placeholder="بكالوريوس طب..." value={form.certInput} onChange={e => up('certInput', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCert() } }} /><button type="button" onClick={addCert} className="bg-brand-600 text-white px-4 rounded-xl font-bold">+</button></div>
              {form.certificates.length > 0 && <div className="flex flex-wrap gap-2">{form.certificates.map((c, i) => <span key={i} className="badge bg-green-100 text-green-700">{c}<button onClick={() => up('certificates', form.certificates.filter((_, j) => j !== i))} className="font-bold mr-1">×</button></span>)}</div>}
            </div>
          </div>
        )}

        {/* === TAB: الهوية === */}
        {activeTab === 'identity' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex gap-3">
              <ShieldCheck size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-700 text-xs">بيانات الهوية محمية ومشفرة — لا تُشارك إلا عند الضرورة القانونية</p>
            </div>
            {provider.identity_verified && <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-2"><Check size={18} className="text-green-600" /><span className="text-green-800 text-sm font-medium">هويتك موثقة ✅</span></div>}

            <div><label className="label">رقم الهوية الوطنية</label><input className="input" placeholder="14 رقم" maxLength={14} value={form.national_id} onChange={e => up('national_id', e.target.value.replace(/\D/g, ''))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">الجنس</label><select className="input" value={form.gender} onChange={e => up('gender', e.target.value)}><option value="">اختار</option><option value="male">ذكر</option><option value="female">أنثى</option></select></div>
              <div><label className="label">الميلاد</label><input className="input" type="date" value={form.birth_date} onChange={e => up('birth_date', e.target.value)} /></div>
            </div>

            {/* بطاقة أمامية */}
            <div>
              <label className="label">البطاقة — الوجه الأمامي</label>
              <div onClick={() => idFrontRef.current?.click()} className={`border-2 border-dashed rounded-2xl h-28 flex items-center justify-center cursor-pointer overflow-hidden transition ${idFrontPreview || provider.id_front_url ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-brand-400'}`}>
                {idFrontPreview || provider.id_front_url ? <img src={idFrontPreview || provider.id_front_url} className="h-full object-contain" alt="id-front" /> : <div className="flex flex-col items-center gap-2 text-gray-400"><Upload size={22} /><span className="text-xs">اضغط لرفع صورة</span></div>}
              </div>
              <input ref={idFrontRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) { setIdFrontFile(e.target.files[0]); previewFile(e.target.files[0], setIdFrontPreview) } }} />
            </div>

            {/* بطاقة خلفية */}
            <div>
              <label className="label">البطاقة — الوجه الخلفي</label>
              <div onClick={() => idBackRef.current?.click()} className={`border-2 border-dashed rounded-2xl h-28 flex items-center justify-center cursor-pointer overflow-hidden transition ${idBackPreview || provider.id_back_url ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-brand-400'}`}>
                {idBackPreview || provider.id_back_url ? <img src={idBackPreview || provider.id_back_url} className="h-full object-contain" alt="id-back" /> : <div className="flex flex-col items-center gap-2 text-gray-400"><Upload size={22} /><span className="text-xs">اضغط لرفع صورة</span></div>}
              </div>
              <input ref={idBackRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) { setIdBackFile(e.target.files[0]); previewFile(e.target.files[0], setIdBackPreview) } }} />
            </div>
          </div>
        )}

        {/* === TAB: الميديا === */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            {/* فيديو تعريفي */}
            <div className="card-p space-y-3">
              <div className="flex items-center gap-2"><Video size={18} className="text-brand-600" /><h3 className="font-bold text-gray-900 text-sm">فيديو تعريفي</h3><span className="text-xs text-gray-400">MP4 — حتى 50MB</span></div>
              {provider.intro_video_url && !videoFile && <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-center gap-2"><Check size={16} className="text-green-600" /><span className="text-green-800 text-xs">فيديو موجود</span></div>}
              <div onClick={() => videoRef.current?.click()} className={`border-2 border-dashed rounded-2xl h-20 flex items-center justify-center cursor-pointer transition ${videoFile ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-brand-400'}`}>
                {videoFile ? <div className="flex items-center gap-2 text-green-700"><Check size={18} /><span className="text-xs">{videoName}</span></div> : <div className="flex items-center gap-2 text-gray-400"><Video size={20} /><span className="text-xs">{provider.intro_video_url ? 'تغيير الفيديو' : 'رفع فيديو تعريفي'}</span></div>}
              </div>
              <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={e => { if (e.target.files?.[0]) { setVideoFile(e.target.files[0]); setVideoName(e.target.files[0].name) } }} />
            </div>

            {/* صور العمل */}
            <div className="card-p space-y-3">
              <div className="flex items-center gap-2"><ImageIcon size={18} className="text-brand-600" /><h3 className="font-bold text-gray-900 text-sm">صور العمل</h3><span className="text-xs text-gray-400">حتى 6 صور</span></div>
              {(provider.images || []).length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {(provider.images || []).map((url, i) => <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100"><img src={url} className="w-full h-full object-cover" alt={`img-${i}`} /></div>)}
                </div>
              )}
              {newImagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {newImagePreviews.map((p, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img src={p} className="w-full h-full object-cover" alt={`new-${i}`} />
                      <button onClick={() => { setNewImagePreviews(prev => prev.filter((_, j) => j !== i)); setNewImageFiles(prev => prev.filter((_, j) => j !== i)) }} className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"><X size={10} className="text-white" /></button>
                    </div>
                  ))}
                </div>
              )}
              {(provider.images || []).length + newImageFiles.length < 6 && (
                <div onClick={() => imagesRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-2xl h-16 flex items-center justify-center cursor-pointer hover:border-brand-400 transition">
                  <div className="flex items-center gap-2 text-gray-400"><ImageIcon size={18} /><span className="text-xs">أضف صور جديدة</span></div>
                </div>
              )}
              <input ref={imagesRef} type="file" accept="image/*" multiple className="hidden" onChange={e => {
                if (e.target.files) {
                  const maxNew = 6 - (provider.images || []).length - newImageFiles.length
                  const files = Array.from(e.target.files).slice(0, maxNew)
                  setNewImageFiles(prev => [...prev, ...files])
                  files.forEach(f => previewFile(f, url => setNewImagePreviews(prev => [...prev, url])))
                }
              }} />
            </div>
          </div>
        )}

        <button onClick={save} disabled={saving} className="btn-primary w-full">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={16} />حفظ التغييرات</>}
        </button>
      </div>
    </div>
  )
}
