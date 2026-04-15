'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { LogOut, User, Phone, MapPin } from 'lucide-react'
import { CitizenNav } from '@/components/shared/BottomNav'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile|null>(null)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      const { data } = await sb.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
    })
  }, [router])

  async function signOut() {
    await createClient().auth.signOut(); router.push('/'); router.refresh()
  }

  if (!profile) return null
  return (
    <div className="min-h-screen bg-[var(--surface)] pb-nav">
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-5 pt-12 pb-10">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3">{profile.full_name[0]}</div>
          <h1 className="text-white font-bold text-xl">{profile.full_name}</h1>
          <p className="text-brand-200 text-sm mt-1">مواطن</p>
        </div>
      </div>
      <div className="px-5 -mt-4 max-w-sm mx-auto space-y-3">
        <div className="card-p space-y-3">
          {[{Icon:User,l:'الاسم',v:profile.full_name},{Icon:Phone,l:'الموبايل',v:profile.phone||'غير مضاف'},{Icon:MapPin,l:'المنطقة',v:profile.village||'غير محددة'}].map(({Icon,l,v}) => (
            <div key={l} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0"><Icon size={16} className="text-brand-600"/></div>
              <div><p className="text-xs text-gray-400">{l}</p><p className="text-sm font-medium text-gray-900">{v}</p></div>
            </div>
          ))}
        </div>
        <button onClick={signOut} className="btn-danger"><LogOut size={16}/>تسجيل الخروج</button>
      </div>
      <CitizenNav/>
    </div>
  )
}
