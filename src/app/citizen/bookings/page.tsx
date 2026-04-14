'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getCitizenBookings } from '@/lib/api'
import type { Booking } from '@/types'
import { CalendarDays, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { CitizenNav } from '@/components/shared/BottomNav'
import { STATUS_LABELS, formatDate, formatTime } from '@/utils'

export default function CitizenBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const b = await getCitizenBookings(user.id)
      setBookings(b)
      setLoading(false)
    }
    load()
  }, [router])

  return (
    <div className="min-h-screen bg-[var(--surface)] pb-nav">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <h1 className="font-bold text-gray-900 text-xl">حجوزاتي</h1>
        <p className="text-sm text-gray-400 mt-0.5">كل مواعيدك في مكان واحد</p>
      </div>

      <div className="px-5 py-4 max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-brand-600" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="font-bold text-gray-700 mb-1">مفيش حجوزات لحد دلوقتي</p>
            <p className="text-gray-400 text-sm mb-5">ابحث عن خدمة واحجز موعد</p>
            <Link href="/citizen/search" className="btn-primary max-w-xs mx-auto">
              استعرض الخدمات
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => {
              const st = STATUS_LABELS[b.status]
              const prov = b.provider as any
              return (
                <div key={b.id} className="card-p">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {prov?.category?.icon && (
                        <span className="text-xl">{prov.category.icon}</span>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{prov?.business_name || 'مزود خدمة'}</p>
                        <p className="text-xs text-gray-400">{prov?.category?.name_ar}</p>
                      </div>
                    </div>
                    <span className={st.className}>{st.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                    <span>📅 {formatDate(b.booking_date)}</span>
                    <span>🕐 {formatTime(b.booking_time)}</span>
                  </div>
                  {b.notes && (
                    <p className="mt-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">{b.notes}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <CitizenNav />
    </div>
  )
}
