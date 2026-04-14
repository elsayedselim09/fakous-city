'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { LogOut, User, Phone, MapPin, ChevronLeft } from 'lucide-react'
import { CitizenNav } from '@/components/shared/BottomNav'

export default function CitizenProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
    }
    load()
  }, [router])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-[var(--surface)] pb-nav">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-5 pt-12 pb-10">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3">
            {profile.full_name[0]}
          </div>
          <h1 className="text-white font-bold text-xl">{profile.full_name}</h1>
          <p className="text-brand-200 text-sm mt-1">مواطن</p>
        </div>
      </div>

      <div className="px-5 -mt-4 max-w-sm mx-auto space-y-3">
        <div className="card-p space-y-3">
          {[
            { icon: User, label: 'الاسم', value: profile.full_name },
            { icon: Phone, label: 'الموبايل', value: profile.phone || 'غير مضاف' },
            { icon: MapPin, label: 'المنطقة', value: profile.village || 'غير محددة' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-brand-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={signOut} className="btn-danger">
          <LogOut size={16} />
          تسجيل الخروج
        </button>
      </div>

      <CitizenNav />
    </div>
  )
}
