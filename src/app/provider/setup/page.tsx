'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createProvider, getCategories } from '@/lib/api'
import { uploadAvatar, uploadIdCard, uploadIntroVideo, uploadProviderImage } from '@/lib/storage'
import type { Category } from '@/types'
import { Loader2, Check, Camera, Upload, ShieldCheck, Video, Image as ImageIcon, X } from 'lucide-react'
import { VILLAGES } from '@/utils'

const STEPS = ['المهنة','البيانات','الهوية','الميديا']

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    category_id: 0, business_name: '', village: '', phone: '', whatsapp: '',
    address: '', description: '', price_info: '', working_hours: '',
    tags: [] as string[], tagInput: '', years_experience: '',
    // هوية
    national_id: '', gender: '', birth_date: '',
    // شهادات
    certInput: '', certificates: [] as string[],
  })

  // ملفات
  const avatarRef = useRef<HTMLInputElement>(null)
  const idFrontRef = useRef<HTMLInputElement>(null)
  const idBackRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const imagesRef = useRef<HTMLInputElement>(null)

  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarFile, setAvatarFile] = useState<File|null>(null)
  const [idFrontFile, setIdFrontFile] = useState<File|null>(null)
  const [idFrontPreview, setIdFrontPreview] = useState('')
  const [idBackFile, setIdBackFile] = useState<File|null>(null)
  const [idBackPreview, setIdBackPreview] = useState('')
  const [videoFile, setVideoFile] = useState<File|null>(null)
  const [videoName, setVideoName] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  useEffect(() => {
    getCategories().then(setCategories)
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/auth/login')
      else setUserId(data.user.id)
    })
  }, [router])

  const up = (f: string, v: unknown) => setForm(p => ({ ...p, [f]: v }))

  function preview(file: File, setP: (s:string)=>void) {
    const r = new FileReader(); r.onload = e => setP(e.target?.result as string); r.readAsDataURL(file)
  }

  function validateStep(s: number) {
    if (s === 0 && !form.category_id) return 'اختار مهنتك أولاً'
    if (s === 1 && (!form.business_name || !form.village || !form.phone)) return 'أكمل البيانات الأساسية'
    if (s === 2) {
      if (!form.national_id.match(/^\d{14}$/)) return 'رقم الهوية 14 رقم'
      if (!form.gender) return 'اختار الجنس'
      if (!form.birth_date) return 'تاريخ الميلاد مطلوب'
      if (!idFrontFile) return 'صورة البطاقة الأمامية مطلوبة'
      if (!idBackFile) return 'صورة البطاقة الخلفية مطلوبة'
    }
    return ''
  }

  function nextStep() {
    const err = validateStep(step)
    if (err) { setError(err); return }
    setError(''); setStep(s => s + 1)
  }

  async function submit() {
    setLoading(true); setError('')
    try {
      // رفع الميديا
      const updates: Record<string,unknown> = {}
      if (avatarFile) updates.avatar_url = await uploadAvatar(userId, avatarFile)
      if (idFrontFile) updates.id_front_url = await uploadIdCard(userId, idFrontFile, 'front')
      if (idBackFile) updates.id_back_url = await uploadIdCard(userId, idBackFile, 'back')

      // تحديث الـ profile بالهوية
      await createClient().from('profiles').update({
        gender: form.gender, birth_date: form.birth_date,
        national_id: form.national_id, ...updates,
      }).eq('id', userId)

      // رفع فيديو وصور المزود
      let intro_video_url = ''
      const providerImages: string[] = []
      if (videoFile) {
        const { uploadFile } = await import('@/lib/storage')
        intro_video_url = await uploadFile('intro-videos', userId, videoFile)
      }
      for (const imgFile of imageFiles.slice(0,6)) {
        const { uploadProviderImage } = await import('@/lib/storage')
        const url = await uploadProviderImage(userId, imgFile)
        providerImages.push(url)
      }

      // إنشاء المزود
      await createProvider({
        user_id: userId, category_id: form.category_id,
        business_name: form.business_name, village: form.village,
        phone: form.phone, whatsapp: form.whatsapp || form.phone,
        address: form.address, description: form.description,
        price_info: form.price_info, working_hours: form.working_hours,
        tags: form.tags, national_id: form.national_id,
        gender: form.gender, birth_date: form.birth_date,
        years_experience: form.years_experience ? parseInt(form.years_experience) : undefined,
        certificates: form.certificates,
        intro_video_url: intro_video_url || undefined,
        images: providerImages,
      } as any)

      router.push('/provider/dashboard')
    } catch (e: any) {
      setError('حصل خطأ: ' + (e?.message || 'حاول تاني'))
    } finally { setLoading(false) }
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
        {error && <div className="bg-red-50 text-red-700 text-sm rounded-2xl px-4 py-3 mb-4 border border-red-100">{error}</div>}

        {/* STEP 0 — المهنة */}
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
            <button onClick={nextStep} className="btn-primary">التالي ←</button>
          </div>
        )}

        {/* STEP 1 — البيانات الأساسية */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 text-xl">البيانات الأساسية</h2>
            {sel && <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-2xl px-4 py-3"><span className="text-2xl">{sel.icon}</span><div><p className="text-brand-700 font-bold text-sm">{sel.name_ar}</p></div></div>}

            {/* صورة بروفايل المزود */}
            <div className="flex flex-col items-center gap-2">
              <div onClick={() => avatarRef.current?.click()} className="w-24 h-24 rounded-full border-2 border-dashed border-brand-300 flex items-center justify-center cursor-pointer overflow-hidden bg-brand-50">
                {avatarPreview ? <img src={avatarPreview} className="w-full h-full object-cover" alt="avatar"/> : <div className="flex flex-col items-center gap-1"><Camera size={22} className="text-brand-400"/><span className="text-xs text-brand-500">صورة</span></div>}
              </div>
              <p className="text-xs text-gray-400">صورة واضحة لصاحب العمل</p>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={e => { if(e.target.files?.[0]){setAvatarFile(e.target.files[0]);preview(e.target.files[0],setAvatarPreview)} }}/>
            </div>

            <div><label className="label">اسم العمل / اسمك <span className="text-red-500">*</span></label><input className="input" placeholder="د. أحمد السيد / صيدلية النور" value={form.business_name} onChange={e => up('business_name', e.target.value)}/></div>
            <div><label className="label">سنوات الخبرة</label><input className="input" type="number" min={0} max={60} placeholder="5" value={form.years_experience} onChange={e => up('years_experience', e.target.value)}/></div>
            <div><label className="label">القرية <span className="text-red-500">*</span></label><select className="input" value={form.village} onChange={e => up('village', e.target.value)}><option value="">اختار</option>{VILLAGES.map(v=><option key={v} value={v}>{v}</option>)}</select></div>
            <div><label className="label">الموبايل <span className="text-red-500">*</span></label><input className="input" type="tel" placeholder="01xxxxxxxxx" value={form.phone} onChange={e => up('phone', e.target.value)}/></div>
            <div><label className="label">واتساب</label><input className="input" type="tel" placeholder="01xxxxxxxxx" value={form.whatsapp} onChange={e => up('whatsapp', e.target.value)}/></div>
            <div><label className="label">العنوان</label><input className="input" placeholder="شارع الجمهورية، أمام المسجد" value={form.address} onChange={e => up('address', e.target.value)}/></div>
            <div><label className="label">وصف العمل</label><textarea className="input" rows={3} placeholder="وصف خدماتك وخبرتك..." value={form.description} onChange={e => up('description', e.target.value)}/></div>
            <div><label className="label">السعر</label><input className="input" placeholder="كشف 100 جنيه" value={form.price_info} onChange={e => up('price_info', e.target.value)}/></div>
            <div><label className="label">أوقات العمل</label><input className="input" placeholder="9 ص — 3 م" value={form.working_hours} onChange={e => up('working_hours', e.target.value)}/></div>
            <div>
              <label className="label">التخصصات ({form.tags.length}/8)</label>
              <div className="flex gap-2"><input className="input flex-1" placeholder="أطفال، باطنة..." value={form.tagInput} onChange={e => up('tagInput', e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();const t=form.tagInput.trim();if(t&&!form.tags.includes(t)&&form.tags.length<8){up('tags',[...form.tags,t]);up('tagInput','')}}}}/><button type="button" onClick={()=>{const t=form.tagInput.trim();if(t&&!form.tags.includes(t)&&form.tags.length<8){up('tags',[...form.tags,t]);up('tagInput','')}}} className="bg-brand-600 text-white px-4 rounded-xl font-bold">+</button></div>
              {form.tags.length>0&&<div className="flex flex-wrap gap-2 mt-2">{form.tags.map(t=><span key={t} className="badge bg-brand-100 text-brand-700">{t}<button onClick={()=>up('tags',form.tags.filter(x=>x!==t))} className="font-bold mr-1">×</button></span>)}</div>}
            </div>
            <div>
              <label className="label">الشهادات والمؤهلات</label>
              <div className="flex gap-2"><input className="input flex-1" placeholder="بكالوريوس طب، دكتوراه..." value={form.certInput} onChange={e => up('certInput', e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();const t=form.certInput.trim();if(t&&form.certificates.length<10){up('certificates',[...form.certificates,t]);up('certInput','')}}}}/><button type="button" onClick={()=>{const t=form.certInput.trim();if(t&&form.certificates.length<10){up('certificates',[...form.certificates,t]);up('certInput','')}}} className="bg-brand-600 text-white px-4 rounded-xl font-bold">+</button></div>
              {form.certificates.length>0&&<div className="flex flex-wrap gap-2 mt-2">{form.certificates.map((c,i)=><span key={i} className="badge bg-green-100 text-green-700">{c}<button onClick={()=>up('certificates',form.certificates.filter((_,j)=>j!==i))} className="font-bold mr-1">×</button></span>)}</div>}
            </div>
            <div className="flex gap-3"><button onClick={() => {setStep(0);setError('')}} className="btn-outline flex-none px-6">← رجوع</button><button onClick={nextStep} className="btn-primary">التالي ←</button></div>
          </div>
        )}

        {/* STEP 2 — الهوية الرسمية */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 text-xl">الهوية الرسمية</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex gap-3">
              <ShieldCheck size={20} className="text-amber-600 flex-shrink-0 mt-0.5"/>
              <div>
                <p className="text-amber-800 font-bold text-sm">لماذا نطلب الهوية؟</p>
                <p className="text-amber-700 text-xs mt-0.5">لضمان أمان المواطنين وإمكانية التحقق منك عند الحاجة — بياناتك محمية ومشفرة</p>
              </div>
            </div>
            <div><label className="label">رقم الهوية الوطنية <span className="text-red-500">*</span></label><input className="input" placeholder="14 رقم" maxLength={14} value={form.national_id} onChange={e => up('national_id', e.target.value.replace(/\D/g,''))}/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">الجنس <span className="text-red-500">*</span></label><select className="input" value={form.gender} onChange={e => up('gender', e.target.value)}><option value="">اختار</option><option value="male">ذكر</option><option value="female">أنثى</option></select></div>
              <div><label className="label">الميلاد <span className="text-red-500">*</span></label><input className="input" type="date" value={form.birth_date} onChange={e => up('birth_date', e.target.value)}/></div>
            </div>
            <div>
              <label className="label">البطاقة — الوجه الأمامي <span className="text-red-500">*</span></label>
              <div onClick={() => idFrontRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-2xl h-28 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 hover:border-brand-400 transition">
                {idFrontPreview ? <img src={idFrontPreview} className="h-full object-contain" alt="front"/> : <div className="flex flex-col items-center gap-2 text-gray-400"><Upload size={22}/><span className="text-xs">اضغط لإضافة صورة</span></div>}
              </div>
              <input ref={idFrontRef} type="file" accept="image/*" className="hidden" onChange={e=>{if(e.target.files?.[0]){setIdFrontFile(e.target.files[0]);preview(e.target.files[0],setIdFrontPreview)}}}/>
            </div>
            <div>
              <label className="label">البطاقة — الوجه الخلفي <span className="text-red-500">*</span></label>
              <div onClick={() => idBackRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-2xl h-28 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 hover:border-brand-400 transition">
                {idBackPreview ? <img src={idBackPreview} className="h-full object-contain" alt="back"/> : <div className="flex flex-col items-center gap-2 text-gray-400"><Upload size={22}/><span className="text-xs">اضغط لإضافة صورة</span></div>}
              </div>
              <input ref={idBackRef} type="file" accept="image/*" className="hidden" onChange={e=>{if(e.target.files?.[0]){setIdBackFile(e.target.files[0]);preview(e.target.files[0],setIdBackPreview)}}}/>
            </div>
            <p className="text-xs text-gray-400 flex gap-1.5 items-start"><ShieldCheck size={14} className="text-green-500 flex-shrink-0 mt-0.5"/>صور الهوية مشفرة ومحمية — لا تُشارك إلا عند الضرورة القانونية</p>
            <div className="flex gap-3"><button onClick={() => {setStep(1);setError('')}} className="btn-outline flex-none px-6">← رجوع</button><button onClick={nextStep} className="btn-primary">التالي ←</button></div>
          </div>
        )}

        {/* STEP 3 — الميديا */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 text-xl">الميديا (اختياري)</h2>

            {/* فيديو تعريفي */}
            <div className="card-p space-y-3">
              <div className="flex items-center gap-2">
                <Video size={18} className="text-brand-600"/>
                <h3 className="font-bold text-gray-900 text-sm">فيديو تعريفي</h3>
                <span className="text-xs text-gray-400">MP4 / حتى 50MB</span>
              </div>
              <div onClick={() => videoRef.current?.click()} className={`border-2 border-dashed rounded-2xl h-24 flex items-center justify-center cursor-pointer transition ${videoFile?'border-green-400 bg-green-50':'border-gray-300 bg-gray-50 hover:border-brand-400'}`}>
                {videoFile
                  ? <div className="flex flex-col items-center gap-1.5 text-green-700"><Check size={24}/><span className="text-xs font-medium">{videoName}</span></div>
                  : <div className="flex flex-col items-center gap-2 text-gray-400"><Video size={24}/><span className="text-xs">اضغط لرفع فيديو تعريفي</span></div>
                }
              </div>
              <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={e=>{if(e.target.files?.[0]){setVideoFile(e.target.files[0]);setVideoName(e.target.files[0].name)}}}/>
            </div>

            {/* صور العمل */}
            <div className="card-p space-y-3">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-brand-600"/>
                <h3 className="font-bold text-gray-900 text-sm">صور العمل</h3>
                <span className="text-xs text-gray-400">حتى 6 صور</span>
              </div>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((p,i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img src={p} className="w-full h-full object-cover" alt={`img-${i}`}/>
                      <button onClick={() => { setImagePreviews(prev => prev.filter((_,j)=>j!==i)); setImageFiles(prev => prev.filter((_,j)=>j!==i)) }} className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"><X size={10} className="text-white"/></button>
                    </div>
                  ))}
                </div>
              )}
              {imageFiles.length < 6 && (
                <div onClick={() => imagesRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-2xl h-16 flex items-center justify-center cursor-pointer hover:border-brand-400 transition">
                  <div className="flex items-center gap-2 text-gray-400"><ImageIcon size={18}/><span className="text-xs">أضف صور لعملك</span></div>
                </div>
              )}
              <input ref={imagesRef} type="file" accept="image/*" multiple className="hidden" onChange={e=>{
                if(e.target.files){
                  const files = Array.from(e.target.files).slice(0, 6-imageFiles.length)
                  setImageFiles(prev=>[...prev,...files])
                  files.forEach(f => preview(f, url => setImagePreviews(prev=>[...prev,url])))
                }
              }}/>
            </div>

            <div className="flex gap-3">
              <button onClick={() => {setStep(2);setError('')}} className="btn-outline flex-none px-6">← رجوع</button>
              <button onClick={submit} disabled={loading} className="btn-primary">
                {loading ? <Loader2 size={18} className="animate-spin"/> : 'إنشاء الصفحة 🎉'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
