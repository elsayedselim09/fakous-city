import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { CalendarDays, Loader2 } from 'lucide-react'

import { CitizenNav } from '@/components/shared/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { getCitizenBookings } from '@/lib/api'
import { STATUS_LABELS, formatDate, formatTime } from '@/utils'
import type { Booking } from '@/types'

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    createClient().auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setBookings(await getCitizenBookings(user.id)); setLoading(false)
    })
  }, [router])

  return (
    <div className="min-h-screen bg-[var(--surface)] pb-nav">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <h1 className="font-bold text-gray-900 text-xl">حجوزاتي</h1>
      </div>
      <div className="px-5 py-4 max-w-lg mx-auto">
        {loading ? <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-brand-600"/></div>
        : bookings.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays size={48} className="text-gray-200 mx-auto mb-4"/>
            <p className="font-bold text-gray-700 mb-1">مفيش حجوزات لحد دلوقتي</p>
            <Link href="/citizen/search" className="mt-4 inline-block btn-primary max-w-xs">استعرض الخدمات</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => {
              const st = STATUS_LABELS[b.status]; const prov = b.provider as any
              return (
                <div key={b.id} className="card-p">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {prov?.category?.icon && <span className="text-xl">{prov.category.icon}</span>}
                      <div><p className="font-bold text-gray-900 text-sm">{prov?.business_name || 'مزود خدمة'}</p><p className="text-xs text-gray-400">{prov?.category?.name_ar}</p></div>
                    </div>
                    <span className={st.className}>{st.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>📅 {formatDate(b.booking_date)}</span><span>🕐 {formatTime(b.booking_time)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <CitizenNav/>
    </div>
  )
}
