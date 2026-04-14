'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getProviderByUserId, getProviderBookings, updateBookingStatus, toggleAvailability } from '@/lib/api'
import type { Provider, Booking } from '@/types'
import { LayoutDashboard, CalendarDays, Settings, Eye, Loader2, CheckCircle2, XCircle, Star, TrendingUp, Users, ToggleLeft, ToggleRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STATUS_LABELS, formatDate, formatTime } from '@/utils'

type Tab = 'home' | 'bookings' | 'settings'

export default function ProviderDashboard() {
  const router = useRouter()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState<Tab>('home')
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const p = await getProviderByUserId(user.id)
      if (!p) { router.push('/provider/setup'); return }

      const b = await getProviderBookings(p.id)
      setProvider(p)
      setBookings(b)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleStatusUpdate(bookingId: string, status: Booking['status']) {
    await updateBookingStatus(bookingId, status)
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b))
  }

  async function handleToggleAvailability() {
    if (!provider) return
    setToggling(true)
    await toggleAvailability(provider.id, !provider.is_available)
    setProvider(p => p ? { ...p, is_available: !p.is_available } : p)
    setToggling(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-brand-600" />
    </div>
  )
  if (!provider) return null

  const today = new Date().toISOString().split('T')[0]
  const todayBookings   = bookings.filter(b => b.booking_date === today)
  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const totalRevenue    = bookings.filter(b => b.status === 'completed').length

  return (
    <div className="min-h-screen bg-[var(--surface)] pb-20">

      {/* Header */}
      <div className="bg-gradient-to-br from-brand-700 to-brand-900 pt-12 pb-5 px-5">
        <div className="flex items-start justify-between max-w-lg mx-auto">
          <div>
            <p className="text-brand-300 text-xs font-medium mb-0.5">لوحة التحكم</p>
            <h1 className="text-white font-bold text-lg leading-tight">{provider.business_name}</h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-brand-300 text-xs">{provider.category?.icon} {provider.category?.name_ar}</span>
              <button
                onClick={handleToggleAvailability}
                disabled={toggling}
                className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-all ${
                  provider.is_available
                    ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                    : 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30'
                }`}
              >
                {toggling ? <Loader2 size={10} className="animate-spin" /> :
                  provider.is_available ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                {provider.is_available ? 'متاح' : 'مشغول'}
              </button>
            </div>
          </div>
          <Link href={`/citizen/provider/${provider.id}`} target="_blank">
            <button className="bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all border border-white/20">
              <Eye size={13} />
              صفحتي
            </button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="flex max-w-lg mx-auto">
          {([
            { key: 'home' as Tab,     label: 'الرئيسية', Icon: LayoutDashboard },
            { key: 'bookings' as Tab, label: 'الحجوزات', Icon: CalendarDays },
            { key: 'settings' as Tab, label: 'الإعدادات', Icon: Settings },
          ]).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-semibold border-b-2 transition-all ${
                tab === key
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={15} />
              {label}
              {key === 'bookings' && pendingBookings.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingBookings.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-5 max-w-lg mx-auto">

        {/* ===== HOME TAB ===== */}
        {tab === 'home' && (
          <div className="space-y-4 animate-fade-up">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { Icon: CalendarDays, label: 'حجوزات اليوم', value: todayBookings.length, color: 'text-brand-600', bg: 'bg-brand-50' },
                { Icon: TrendingUp,   label: 'في الانتظار',   value: pendingBookings.length, color: 'text-amber-600', bg: 'bg-amber-50' },
                { Icon: Star,         label: 'التقييم',        value: provider.rating.toFixed(1), color: 'text-purple-600', bg: 'bg-purple-50' },
                { Icon: Users,        label: 'المشاهدات',      value: provider.views_count, color: 'text-blue-600', bg: 'bg-blue-50' },
              ].map(({ Icon, label, value, color, bg }) => (
                <div key={label} className="card-p">
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-2`}>
                    <Icon size={18} className={color} />
                  </div>
                  <p className={`font-bold text-2xl ${color}`}>{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Today's bookings */}
            <div className="card-p">
              <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                <CalendarDays size={15} className="text-brand-600" />
                حجوزات اليوم ({todayBookings.length})
              </h3>
              {todayBookings.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">لا توجد حجوزات اليوم</p>
              ) : (
                <div className="space-y-3">
                  {todayBookings.map(b => (
                    <BookingCard key={b.id} booking={b} onUpdate={handleStatusUpdate} />
                  ))}
                </div>
              )}
            </div>

            {/* Subscription */}
            <div className={`card-p border-2 ${
              provider.subscription_plan === 'pro' ? 'border-amber-300 bg-amber-50/30' :
              provider.subscription_plan === 'basic' ? 'border-blue-200' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">الاشتراك الحالي</p>
                  <p className="font-bold text-gray-900 mt-0.5">
                    {provider.subscription_plan === 'free' ? '🆓 مجاني' :
                     provider.subscription_plan === 'basic' ? '💎 أساسي' : '⭐ احترافي'}
                  </p>
                </div>
                {provider.subscription_plan !== 'pro' && (
                  <Link href="/provider/subscribe">
                    <button className="bg-brand-600 text-white text-xs px-4 py-2 rounded-xl font-semibold hover:bg-brand-700 transition-colors">
                      ترقية ↑
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== BOOKINGS TAB ===== */}
        {tab === 'bookings' && (
          <div className="space-y-3 animate-fade-up">
            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-3">📅</p>
                <p className="font-bold text-gray-700 mb-1">لا توجد حجوزات بعد</p>
                <p className="text-gray-400 text-sm">ستظهر هنا عندما يحجز العملاء</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-400 font-medium">
                  إجمالي {bookings.length} حجز · {pendingBookings.length} في الانتظار
                </p>
                {bookings.map(b => (
                  <BookingCard key={b.id} booking={b} onUpdate={handleStatusUpdate} showDate />
                ))}
              </>
            )}
          </div>
        )}

        {/* ===== SETTINGS TAB ===== */}
        {tab === 'settings' && (
          <div className="space-y-3 animate-fade-up">
            {[
              { href: '/provider/edit', label: 'تعديل بيانات العمل', icon: '✏️', desc: 'اسم، وصف، أوقات العمل' },
              { href: '/provider/subscribe', label: 'الاشتراكات والباقات', icon: '⭐', desc: 'ترقية حسابك' },
              { href: `/citizen/provider/${provider.id}`, label: 'معاينة صفحتي', icon: '👁️', desc: 'شوف صفحتك زي ما يشوفها العملاء', external: true },
            ].map(({ href, label, icon, desc, external }) => (
              <Link key={href} href={href} target={external ? '_blank' : undefined}>
                <div className="card-p flex items-center gap-3 hover:shadow-md transition-all active:scale-[0.99]">
                  <span className="text-2xl w-10 text-center flex-shrink-0">{icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                  <span className="text-gray-300 text-lg">←</span>
                </div>
              </Link>
            ))}

            <button
              onClick={async () => {
                await createClient().auth.signOut()
                router.push('/')
                router.refresh()
              }}
              className="btn-danger mt-4"
            >
              تسجيل الخروج
            </button>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex safe-area-bottom z-40">
        {([
          { key: 'home' as Tab,     label: 'الرئيسية', Icon: LayoutDashboard },
          { key: 'bookings' as Tab, label: 'الحجوزات', Icon: CalendarDays },
          { key: 'settings' as Tab, label: 'الإعدادات', Icon: Settings },
        ]).map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex flex-col items-center pt-3 pb-2 gap-1 transition-colors ${
              tab === key ? 'text-brand-600' : 'text-gray-400'
            }`}
          >
            <Icon size={22} strokeWidth={tab === key ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

// ===== Booking Card Component =====
function BookingCard({
  booking,
  onUpdate,
  showDate = false,
}: {
  booking: Booking
  onUpdate: (id: string, status: Booking['status']) => void
  showDate?: boolean
}) {
  const [acting, setActing] = useState(false)
  const st = STATUS_LABELS[booking.status]

  async function act(status: Booking['status']) {
    setActing(true)
    await onUpdate(booking.id, status)
    setActing(false)
  }

  return (
    <div className="border border-gray-100 rounded-2xl p-3.5 space-y-2.5 bg-gray-50/50">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-gray-900 text-sm">{booking.citizen_name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{booking.citizen_phone}</p>
          <p className="text-xs text-brand-600 mt-1 font-medium">
            {showDate ? `${formatDate(booking.booking_date)} · ` : ''}
            {formatTime(booking.booking_time)}
          </p>
        </div>
        <span className={`${st.className} flex-shrink-0`}>{st.label}</span>
      </div>

      {booking.notes && (
        <p className="text-xs text-gray-500 bg-white rounded-xl px-3 py-2 border border-gray-100">
          {booking.notes}
        </p>
      )}

      {booking.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={() => act('confirmed')}
            disabled={acting}
            className="flex-1 flex items-center justify-center gap-1.5 bg-brand-50 text-brand-700 py-2 rounded-xl text-xs font-bold hover:bg-brand-100 transition-colors"
          >
            {acting ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={14} />}
            تأكيد
          </button>
          <button
            onClick={() => act('cancelled')}
            disabled={acting}
            className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
          >
            <XCircle size={14} />
            رفض
          </button>
        </div>
      )}

      {booking.status === 'confirmed' && (
        <button
          onClick={() => act('completed')}
          disabled={acting}
          className="w-full bg-green-50 text-green-700 py-2 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors"
        >
          ✅ تم الانتهاء
        </button>
      )}
    </div>
  )
}
