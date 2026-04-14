'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getNotifications, markNotificationsRead } from '@/lib/api'
import type { Notification } from '@/types'
import { Bell, ChevronRight, Loader2 } from 'lucide-react'
import { timeAgo } from '@/utils'

export default function NotificationsPage() {
  const router = useRouter()
  const [notifs, setNotifs]   = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const n = await getNotifications(user.id)
      setNotifs(n as Notification[])
      await markNotificationsRead(user.id)
      setLoading(false)
    }
    load()
  }, [router])

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-500 mb-3 text-sm">
          <ChevronRight size={18} /> رجوع
        </button>
        <h1 className="font-bold text-gray-900 text-xl">الإشعارات</h1>
      </div>
      <div className="px-5 py-4 max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-brand-600" />
          </div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="font-bold text-gray-600">لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifs.map(n => (
              <div key={n.id} className={`card-p ${!n.is_read ? 'border-brand-200 bg-brand-50/30' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 bg-gray-50">
                    {n.type === 'booking' ? '📅' : n.type === 'review' ? '⭐' : '🔔'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">{n.title}</p>
                    <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-gray-400 text-xs mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && <div className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-1" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
