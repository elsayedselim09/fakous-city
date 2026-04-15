'use client'
import { useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { uploadAvatar, uploadIdCard } from '@/lib/storage'
import { Loader2, MapPin, Camera, Upload, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { VILLAGES } from '@/utils'

function Form() {
  const router = useRouter()
  const params = useSearchParams()
  const [role, setRole] = useState<'citizen'|'provider'>((params.get('role') || 'citizen') as 'citizen'|'provider')
  const [step, setStep] = useState(0) // 0=أساسي، 1=هوية، 2=تأكيد
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', second_phone: '',
    password: '', village: '', gender: '', birth_date: '',
    national_id: '',
  })

  // ملفات الصور
  const [avatarFile, setAvatarFile] = useState<File|null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [idFrontFile, setIdFrontFile] = useState<File|null>(null)
  const [idFrontPreview, setIdFrontPreview] = useState('')
  const [idBackFile, setIdBackFile] = useState<File|null>(null)
  const [idBackPreview, setIdBackPreview] = useState('')

  const avatarRef = useRef<HTMLInputElement>(null)
  const idFrontRef = useRef<HTMLInputElement>(null)
  const idBackRef = useRef<HTMLInputElement>(null)

  const up = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  function pickImg(file: File, setFile: (f:File)=>void, setPreview: (s:string)=>void) {
    setFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  function validateStep0() {
    if (!form.full_name.trim()) return 'الاسم الكامل مطلوب'
    if (!form.phone.match(/^01[0-9]{9}$/)) return 'رقم الموبايل غير صحيح (01xxxxxxxxx)'
    if (!form.village) return 'اختار قريتك / منطقتك'
    if (!form.email.includes('@')) return 'البريد الإلكتروني غير صحيح'
    if (form.password.length < 8) return 'كلمة المرور 8 أحرف على الأقل'
    return ''
  }

  function validateStep1() {
    if (!form.national_id.match(/^\d{14}$/)) return 'رقم الهوية الوطنية 14 رقم'
    if (!form.gender) return 'اختار الجنس'
    if (!form.birth_date) return 'تاريخ الميلاد مطلوب'
    if (!idFrontFile) return 'صورة البطاقة الأمامية مطلوبة'
    if (!idBackFile) return 'صورة البطاقة الخلفية مطلوبة'
    return ''
  }

  function nextStep() {
    const err = step === 0 ? validateStep0() : validateStep1()
    if (err) { setError(err); return }
    setError('')
    setStep(s => s + 1)
  }

  async function submit() {
    setLoading(true); setError('')
    const sb = createClient()

    const { data, error: signErr } = await sb.auth.signUp({
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

    if (signErr || !data.user) {
      setError(signErr?.message.includes('already') ? 'البريد مسجل قبل كده' : 'حصل خطأ، حاول تاني')
      setLoading(false); return
    }

    const userId = data.user.id

    // رفع الملفات
    const updates: Record<string,unknown> = {
      second_phone: form.second_phone || null,
      gender: form.gender,
      birth_date: form.birth_date,
      national_id: form.national_id,
    }

    try {
      if (avatarFile) updates.avatar_url = await uploadAvatar(userId, avatarFile)
      if (idFrontFile) updates.id_front_url = await uploadIdCard(userId, idFrontFile, 'front')
      if (idBackFile) updates.id_back_url = await uploadIdCard(userId, idBackFile, 'back')
    } catch { /* non-blocking */ }

    await sb.from('profiles').update(updates).eq('id', userId)

    router.push(role === 'provider' ? '/provider/setup' : '/citizen')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex flex-col justify-center px-5 py-8">
      <div className="w-full max-w-sm mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-600/30">
            <MapPin size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">إنشاء حساب</h1>
          <p className="text-xs text-gray-400 mt-1">خطوة {step+1} من 3</p>
        </div>

        {/* Role Switch */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {(['citizen','provider'] as const).map(r => (
            <button key={r} onClick={() => setRole(r)} className={`py-3.5 rounded-2xl font-semibold text-sm border-2 transition-all ${role===r?'bg-brand-600 text-white border-brand-600':'bg-white text-gray-600 border-gray-200'}`}>
              {r === 'citizen' ? '👤 مواطن' : '💼 مزود خدمة'}
            </button>
          ))}
        </div>

        {/* Step Progress */}
        <div className="flex gap-2 mb-6">
          {['البيانات الأساسية','الهوية الرسمية','المراجعة'].map((s,i) => (
            <div key={i} className={`h-1.5 rounded-full flex-1 transition-all ${i<step?'bg-brand-600':i===step?'bg-brand-400':'bg-gray-200'}`}/>
          ))}
        </div>

        {error && <div className="bg-red-50 text-red-700 text-sm rounded-2xl px-4 py-3 mb-4 border border-red-100">{error}</div>}

        {/* ===== STEP 0: بيانات أساسية ===== */}
        {step === 0 && (
          <div className="card-p space-y-4">
            {/* صورة البروفايل */}
            <div className="flex flex-col items-center gap-3">
              <div
                onClick={() => avatarRef.current?.click()}
                className="w-24 h-24 rounded-full border-2 border-dashed border-brand-300 flex items-center justify-center cursor-pointer overflow-hidden bg-brand-50 hover:bg-brand-100 transition"
              >
                {avatarPreview
                  ? <img src={avatarPreview} className="w-full h-full object-cover" alt="avatar"/>
                  : <div className="flex flex-col items-center gap-1"><Camera size={24} className="text-brand-400"/><span className="text-xs text-brand-500">صورة</span></div>
                }
              </div>
              <p className="text-xs text-gray-400">صورة شخصية واضحة للوجه</p>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && pickImg(e.target.files[0], setAvatarFile, setAvatarPreview)}/>
            </div>

            <div><label className="label">الاسم الكامل (رباعي) <span className="text-red-500">*</span></label><input className="input" placeholder="محمد أحمد علي السيد" value={form.full_name} onChange={e => up('full_name', e.target.value)} required/></div>
            <div><label className="label">رقم الموبايل الأساسي <span className="text-red-500">*</span></label><input className="input" type="tel" placeholder="01xxxxxxxxx" value={form.phone} onChange={e => up('phone', e.target.value)} required/></div>
            <div><label className="label">رقم موبايل بديل (اختياري)</label><input className="input" type="tel" placeholder="01xxxxxxxxx" value={form.second_phone} onChange={e => up('second_phone', e.target.value)}/></div>
            <div><label className="label">القرية / المنطقة <span className="text-red-500">*</span></label>
              <select className="input" value={form.village} onChange={e => up('village', e.target.value)} required>
                <option value="">اختار منطقتك</option>
                {VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div><label className="label">البريد الإلكتروني <span className="text-red-500">*</span></label><input className="input" type="email" placeholder="example@email.com" value={form.email} onChange={e => up('email', e.target.value)} required/></div>
            <div>
              <label className="label">كلمة المرور <span className="text-red-500">*</span></label>
              <div className="relative">
                <input className="input pl-10" type={showPass?'text':'password'} placeholder="8 أحرف على الأقل" value={form.password} onChange={e => up('password', e.target.value)} minLength={8} required/>
                <button type="button" onClick={() => setShowPass(v=>!v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="button" onClick={nextStep} className="btn-primary">التالي ← <span className="text-xs opacity-70">(الهوية الرسمية)</span></button>
          </div>
        )}

        {/* ===== STEP 1: الهوية الرسمية ===== */}
        {step === 1 && (
          <div className="card-p space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex gap-3">
              <ShieldCheck size={20} className="text-amber-600 flex-shrink-0 mt-0.5"/>
              <div>
                <p className="text-amber-800 font-bold text-sm">لماذا نطلب هذا؟</p>
                <p className="text-amber-700 text-xs mt-0.5">لضمان أمان جميع الأطراف — المواطن، المزود، والجهات المعنية — وللتحقق من الهوية عند الحاجة</p>
              </div>
            </div>

            <div>
              <label className="label">رقم الهوية الوطنية (14 رقم) <span className="text-red-500">*</span></label>
              <input className="input" placeholder="12345678901234" maxLength={14} value={form.national_id} onChange={e => up('national_id', e.target.value.replace(/\D/g,''))} required/>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">الجنس <span className="text-red-500">*</span></label>
                <select className="input" value={form.gender} onChange={e => up('gender', e.target.value)} required>
                  <option value="">اختار</option>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
              <div>
                <label className="label">تاريخ الميلاد <span className="text-red-500">*</span></label>
                <input className="input" type="date" value={form.birth_date} onChange={e => up('birth_date', e.target.value)} required/>
              </div>
            </div>

            {/* بطاقة الهوية الأمامية */}
            <div>
              <label className="label">صورة البطاقة — الوجه الأمامي <span className="text-red-500">*</span></label>
              <div onClick={() => idFrontRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-2xl h-28 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 hover:border-brand-400 transition">
                {idFrontPreview
                  ? <img src={idFrontPreview} className="h-full object-contain" alt="id-front"/>
                  : <div className="flex flex-col items-center gap-2 text-gray-400"><Upload size={22}/><span className="text-xs">اضغط لإضافة صورة</span></div>
                }
              </div>
              <input ref={idFrontRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && pickImg(e.target.files[0], setIdFrontFile, setIdFrontPreview)}/>
            </div>

            {/* بطاقة الهوية الخلفية */}
            <div>
              <label className="label">صورة البطاقة — الوجه الخلفي <span className="text-red-500">*</span></label>
              <div onClick={() => idBackRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-2xl h-28 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 hover:border-brand-400 transition">
                {idBackPreview
                  ? <img src={idBackPreview} className="h-full object-contain" alt="id-back"/>
                  : <div className="flex flex-col items-center gap-2 text-gray-400"><Upload size={22}/><span className="text-xs">اضغط لإضافة صورة</span></div>
                }
              </div>
              <input ref={idBackRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && pickImg(e.target.files[0], setIdBackFile, setIdBackPreview)}/>
            </div>

            <div className="text-xs text-gray-400 flex items-start gap-2">
              <ShieldCheck size={14} className="text-green-500 flex-shrink-0 mt-0.5"/>
              صور الهوية مشفرة ومحمية ولا تُشارك إلا عند الضرورة القانونية
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => {setStep(0);setError('')}} className="btn-outline flex-none px-6">← رجوع</button>
              <button type="button" onClick={nextStep} className="btn-primary">التالي ← <span className="text-xs opacity-70">(مراجعة)</span></button>
            </div>
          </div>
        )}

        {/* ===== STEP 2: مراجعة وتأكيد ===== */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="card-p space-y-3">
              <h3 className="font-bold text-gray-900 text-base">مراجعة البيانات</h3>

              {avatarPreview && (
                <div className="flex justify-center">
                  <img src={avatarPreview} className="w-20 h-20 rounded-full object-cover border-4 border-brand-200" alt="avatar"/>
                </div>
              )}

              {[
                { l: 'الاسم', v: form.full_name },
                { l: 'الدور', v: role === 'citizen' ? '👤 مواطن' : '💼 مزود خدمة' },
                { l: 'الموبايل', v: form.phone },
                { l: 'المنطقة', v: form.village },
                { l: 'البريد', v: form.email },
                { l: 'رقم الهوية', v: form.national_id ? `****${form.national_id.slice(-4)}` : '—' },
                { l: 'الجنس', v: form.gender === 'male' ? 'ذكر' : form.gender === 'female' ? 'أنثى' : '—' },
                { l: 'تاريخ الميلاد', v: form.birth_date || '—' },
                { l: 'البطاقة الأمامية', v: idFrontFile ? '✅ مرفوعة' : '❌ غير مرفوعة' },
                { l: 'البطاقة الخلفية', v: idBackFile ? '✅ مرفوعة' : '❌ غير مرفوعة' },
              ].map(({ l, v }) => (
                <div key={l} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                  <span className="text-gray-500">{l}</span>
                  <span className="font-medium text-gray-900">{v}</span>
                </div>
              ))}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-green-800 text-sm flex gap-2">
              <ShieldCheck size={18} className="flex-shrink-0 mt-0.5 text-green-600"/>
              بياناتك محمية بالكامل وفق سياسة الخصوصية
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => {setStep(1);setError('')}} className="btn-outline flex-none px-6">← رجوع</button>
              <button type="button" onClick={submit} disabled={loading} className="btn-primary">
                {loading ? <Loader2 size={20} className="animate-spin"/> : 'إنشاء الحساب 🎉'}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-5">
          عندك حساب؟{' '}<Link href="/auth/login" className="text-brand-600 font-semibold">سجّل دخول</Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() { return <Suspense><Form /></Suspense> }
