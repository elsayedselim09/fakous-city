'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadAvatar, uploadIdCard } from '@/lib/storage'
import type { Profile } from '@/types'
import { LogOut, User, Phone, MapPin, Camera, ShieldCheck, Shield, Edit2, Save, X, Upload, Loader2 } from 'lucide-react'
import { CitizenNav } from '@/components/shared/BottomNav'
import { VILLAGES } from '@/utils'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile|null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ full_name:'', phone:'', second_phone:'', village:'', gender:'', birth_date:'' })

  const avatarRef = useRef<HTMLInputElement>(null)
  const idFrontRef = useRef<HTMLInputElement>(null)
  const idBackRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [idFrontPreview, setIdFrontPreview] = useState('')
  const [idBackPreview, setIdBackPreview] = useState('')

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      const { data } = await sb.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      if (data) setForm({ full_name:data.full_name||'', phone:data.phone||'', second_phone:data.second_phone||'', village:data.village||'', gender:data.gender||'', birth_date:data.birth_date||'' })
    })
  }, [router])

  async function signOut() {
    await createClient().auth.signOut(); router.push('/'); router.refresh()
  }

  async function saveProfile() {
    if (!profile) return
    setSaving(true)
    const sb = createClient()
    const updates: Partial<Profile> = { ...form } as any

    try {
      if (avatarRef.current?.files?.[0]) {
        updates.avatar_url = await uploadAvatar(profile.id, avatarRef.current.files[0])
      }
      if (idFrontRef.current?.files?.[0]) {
        updates.id_front_url = await uploadIdCard(profile.id, idFrontRef.current.files[0], 'front')
      }
      if (idBackRef.current?.files?.[0]) {
        updates.id_back_url = await uploadIdCard(profile.id, idBackRef.current.files[0], 'back')
      }
    } catch { /* non-blocking */ }

    const { data } = await sb.from('profiles').update(updates).eq('id', profile.id).select().single()
    setProfile(data)
    setSaving(false); setSaved(true); setEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  function previewFile(file: File, setPreview: (s:string)=>void) {
    const r = new FileReader()
    r.onload = e => setPreview(e.target?.result as string)
    r.readAsDataURL(file)
  }

  if (!profile) return <div className="min-h-screen flex items-center justify-center"><Loader2 size={28} className="animate-spin text-brand-600"/></div>

  const initials = profile.full_name?.[0] || '؟'
  const avatar = avatarPreview || profile.avatar_url

  return (
    <div className="min-h-screen bg-[var(--surface)] pb-nav">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-5 pt-12 pb-10">
        <div className="flex flex-col items-center relative">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden flex items-center justify-center bg-white/20 text-white text-3xl font-bold">
              {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="avatar"/> : initials}
            </div>
            {editing && (
              <button onClick={() => avatarRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Camera size={15} className="text-brand-600"/>
              </button>
            )}
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && previewFile(e.target.files[0], setAvatarPreview)}/>
          </div>
          <h1 className="text-white font-bold text-xl">{profile.full_name}</h1>
          <p className="text-brand-200 text-sm mt-1">مواطن</p>
          {profile.identity_verified && (
            <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 rounded-full px-3 py-1 mt-2">
              <ShieldCheck size={14} className="text-green-300"/>
              <span className="text-green-200 text-xs font-medium">هوية موثقة</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 -mt-4 max-w-sm mx-auto space-y-3">
        {saved && <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl px-4 py-3 text-sm text-center">✅ تم الحفظ بنجاح!</div>}

        {/* Edit Toggle */}
        <div className="flex gap-2">
          {!editing
            ? <button onClick={() => setEditing(true)} className="btn-outline flex items-center gap-2 flex-1"><Edit2 size={15}/>تعديل البيانات</button>
            : <>
                <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2 flex-1">{saving?<Loader2 size={15} className="animate-spin"/>:<><Save size={15}/>حفظ</>}</button>
                <button onClick={() => setEditing(false)} className="btn-outline px-4"><X size={15}/></button>
              </>
          }
        </div>

        {/* البيانات الشخصية */}
        <div className="card-p space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><User size={16} className="text-brand-600"/>البيانات الشخصية</h2>

          {editing ? (
            <div className="space-y-3">
              <div><label className="label">الاسم الكامل</label><input className="input" value={form.full_name} onChange={e => setForm(f=>({...f,full_name:e.target.value}))}/></div>
              <div><label className="label">الموبايل الأساسي</label><input className="input" type="tel" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))}/></div>
              <div><label className="label">موبايل بديل</label><input className="input" type="tel" value={form.second_phone} onChange={e => setForm(f=>({...f,second_phone:e.target.value}))}/></div>
              <div><label className="label">القرية / المنطقة</label>
                <select className="input" value={form.village} onChange={e => setForm(f=>({...f,village:e.target.value}))}>
                  <option value="">اختار</option>
                  {VILLAGES.map(v=><option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">الجنس</label>
                  <select className="input" value={form.gender} onChange={e => setForm(f=>({...f,gender:e.target.value}))}>
                    <option value="">اختار</option><option value="male">ذكر</option><option value="female">أنثى</option>
                  </select>
                </div>
                <div><label className="label">الميلاد</label><input className="input" type="date" value={form.birth_date} onChange={e => setForm(f=>({...f,birth_date:e.target.value}))}/></div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { Icon:User, l:'الاسم', v:profile.full_name },
                { Icon:Phone, l:'الموبايل', v:profile.phone||'غير مضاف' },
                { Icon:Phone, l:'موبايل بديل', v:profile.second_phone||'غير مضاف' },
                { Icon:MapPin, l:'المنطقة', v:profile.village||'غير محددة' },
                { Icon:User, l:'الجنس', v:profile.gender==='male'?'ذكر':profile.gender==='female'?'أنثى':'—' },
                { Icon:User, l:'تاريخ الميلاد', v:profile.birth_date||'—' },
              ].map(({Icon,l,v}) => (
                <div key={l} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0"><Icon size={16} className="text-brand-600"/></div>
                  <div><p className="text-xs text-gray-400">{l}</p><p className="text-sm font-medium text-gray-900">{v}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* الهوية الرسمية */}
        <div className="card-p space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><Shield size={16} className="text-brand-600"/>الهوية الرسمية</h2>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0"><Shield size={16} className="text-brand-600"/></div>
            <div>
              <p className="text-xs text-gray-400">رقم الهوية</p>
              <p className="text-sm font-medium text-gray-900">
                {profile.national_id ? `****${profile.national_id.slice(-4)}` : 'غير مضاف'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* أمامية */}
            <div>
              <p className="text-xs text-gray-500 mb-1.5">البطاقة — أمامية</p>
              <div onClick={() => editing && idFrontRef.current?.click()} className={`border-2 border-dashed rounded-2xl h-20 flex items-center justify-center overflow-hidden ${editing?'cursor-pointer hover:border-brand-400':''} ${profile.id_front_url||idFrontPreview?'border-green-300 bg-green-50':'border-gray-200 bg-gray-50'}`}>
                {idFrontPreview || profile.id_front_url
                  ? <img src={idFrontPreview||profile.id_front_url} className="h-full object-contain" alt="id-front"/>
                  : <div className="flex flex-col items-center gap-1 text-gray-400">{editing?<><Upload size={16}/><span className="text-xs">رفع</span></>:<span className="text-xs">غير مرفوعة</span>}</div>
                }
              </div>
              <input ref={idFrontRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && previewFile(e.target.files[0], setIdFrontPreview)}/>
            </div>
            {/* خلفية */}
            <div>
              <p className="text-xs text-gray-500 mb-1.5">البطاقة — خلفية</p>
              <div onClick={() => editing && idBackRef.current?.click()} className={`border-2 border-dashed rounded-2xl h-20 flex items-center justify-center overflow-hidden ${editing?'cursor-pointer hover:border-brand-400':''} ${profile.id_back_url||idBackPreview?'border-green-300 bg-green-50':'border-gray-200 bg-gray-50'}`}>
                {idBackPreview || profile.id_back_url
                  ? <img src={idBackPreview||profile.id_back_url} className="h-full object-contain" alt="id-back"/>
                  : <div className="flex flex-col items-center gap-1 text-gray-400">{editing?<><Upload size={16}/><span className="text-xs">رفع</span></>:<span className="text-xs">غير مرفوعة</span>}</div>
                }
              </div>
              <input ref={idBackRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && previewFile(e.target.files[0], setIdBackPreview)}/>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 flex gap-2">
            <ShieldCheck size={14} className="text-amber-600 flex-shrink-0 mt-0.5"/>
            <p className="text-amber-700 text-xs">صور الهوية مشفرة ومحمية — لا تُشارك إلا عند الضرورة القانونية</p>
          </div>
        </div>

        <button onClick={signOut} className="btn-danger flex items-center gap-2 justify-center w-full">
          <LogOut size={16}/>تسجيل الخروج
        </button>
      </div>
      <CitizenNav/>
    </div>
  )
}
