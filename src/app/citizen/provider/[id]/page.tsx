'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProviderById, getProviderReviews, createBooking } from '@/lib/api'
import type { Provider, Review } from '@/types'
import { MapPin, Clock, ChevronRight, Loader2, BadgeCheck } from 'lucide-react'
import { openWhatsapp, formatTime } from '@/utils'
import { RatingDisplay, StarRating } from '@/components/shared/StarRating'

const WaIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 2C6.47 2 2 6.47 2 12c0 1.76.46 3.41 1.26 4.85L2 22l5.33-1.39A10 10 0 0012 22c5.53 0 10-4.47 10-10S17.53 2 12 2z"/>
  </svg>
)

export default function ProviderPage() {
  const { id } = useParams()
  const router = useRouter()
  const [provider, setProvider] = useState<Provider|null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showBook, setShowBook] = useState(false)
  const [bookDone, setBookDone] = useState(false)
  const [bookLoad, setBookLoad] = useState(false)
  const [form, setForm] = useState({ citizen_name:'', citizen_phone:'', booking_date:'', booking_time:'', notes:'' })

  useEffect(() => {
    if (!id) return
    Promise.all([getProviderById(id as string), getProviderReviews(id as string)])
      .then(([p,r]) => { setProvider(p); setReviews(r) })
      .catch(() => router.push('/citizen'))
      .finally(() => setLoading(false))
  }, [id, router])

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault(); if (!provider) return; setBookLoad(true)
    try {
      await createBooking({ provider_id: provider.id, citizen_name: form.citizen_name, citizen_phone: form.citizen_phone, booking_date: form.booking_date, booking_time: form.booking_time, notes: form.notes })
      setBookDone(true)
    } catch { alert('حصل خطأ، حاول تاني') }
    finally { setBookLoad(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 size={32} className="animate-spin text-brand-600"/></div>
  if (!provider) return null

  const color = provider.category?.color || '#0d9262'
  const actionLabel = provider.category?.action_button || 'تواصل الآن'
  const isBookable = ['احجز الآن','احجز طاولة','احجز درساً'].includes(actionLabel)
  const waNum = provider.whatsapp || provider.phone || ''

  return (
    <div className="min-h-screen bg-[var(--surface)] pb-36">
      <div className="bg-white shadow-sm">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 px-4 pt-12 pb-3 text-gray-500">
          <ChevronRight size={20}/><span className="text-sm font-medium">رجوع</span>
        </button>
        <div className="px-5 pb-5 flex items-start gap-4">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl flex-shrink-0 shadow-sm" style={{ background: color+'18' }}>
            {provider.category?.icon || provider.business_name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-gray-900 text-xl leading-tight">{provider.business_name}</h1>
              {provider.is_verified && <BadgeCheck size={18} className="text-blue-500"/>}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="badge text-xs font-semibold" style={{ background: color+'18', color }}>{provider.category?.name_ar}</span>
              <span className={provider.is_available ? 'badge-available' : 'badge-busy'}>{provider.is_available ? '● متاح' : '● مشغول'}</span>
            </div>
            <div className="mt-2"><RatingDisplay rating={provider.rating} count={provider.reviews_count}/></div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 max-w-lg mx-auto space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {provider.price_info && <div className="card-p text-center"><p className="text-xs text-gray-400 mb-1">السعر</p><p className="font-bold text-gray-900 text-sm">{provider.price_info}</p></div>}
          {provider.working_hours && <div className="card-p text-center"><Clock size={14} className="text-gray-400 mx-auto mb-1"/><p className="text-xs text-gray-400">أوقات العمل</p><p className="font-bold text-gray-900 text-sm">{provider.working_hours}</p></div>}
        </div>
        {provider.description && <div className="card-p"><h3 className="font-bold text-gray-800 mb-2 text-sm">عن المكان</h3><p className="text-gray-600 text-sm leading-relaxed">{provider.description}</p></div>}
        {(provider.address || provider.village) && (
          <div className="card-p flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0"><MapPin size={16} className="text-brand-600"/></div>
            <div><p className="text-xs text-gray-400 mb-0.5">العنوان</p>{provider.address && <p className="text-sm text-gray-800 font-medium">{provider.address}</p>}<p className="text-xs text-brand-600 mt-0.5">{provider.village}</p></div>
          </div>
        )}
        {provider.tags && provider.tags.length > 0 && <div className="card-p"><h3 className="font-bold text-gray-800 mb-2 text-sm">التخصصات</h3><div className="flex flex-wrap gap-2">{provider.tags.map(t => <span key={t} className="badge bg-gray-100 text-gray-700">{t}</span>)}</div></div>}
        {reviews.length > 0 && (
          <div className="card-p">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">آراء العملاء ({reviews.length})</h3>
            <div className="space-y-4">
              {reviews.slice(0,4).map(r => (
                <div key={r.id} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{r.citizen_name}</p>
                    <StarRating rating={r.rating} size={12}/>
                  </div>
                  {r.comment && <p className="text-gray-600 text-xs leading-relaxed mt-1">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 space-y-2.5 safe-area-bottom z-30">
        {isBookable ? <button onClick={() => setShowBook(true)} className="btn-primary">{actionLabel}</button>
          : <button onClick={() => openWhatsapp(waNum, provider.business_name)} className="btn-primary">{actionLabel}</button>}
        {waNum && <button onClick={() => openWhatsapp(waNum, provider.business_name)} className="btn-whatsapp"><WaIcon/>تواصل عبر واتساب</button>}
      </div>

      {showBook && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={e => { if (e.target === e.currentTarget) setShowBook(false) }}>
          <div className="bg-white w-full rounded-t-3xl max-h-[92vh] overflow-y-auto animate-slide-up">
            {bookDone ? (
              <div className="text-center py-12 px-5">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="font-bold text-gray-900 text-xl mb-2">تم الحجز!</h3>
                <p className="text-gray-500 text-sm mb-6">سيتواصل معك {provider.business_name} قريباً</p>
                <button onClick={() => { setShowBook(false); setBookDone(false) }} className="btn-primary max-w-xs mx-auto">تمام</button>
              </div>
            ) : (
              <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-gray-900 text-lg">{actionLabel}</h3>
                  <button onClick={() => setShowBook(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">✕</button>
                </div>
                <form onSubmit={submitBooking} className="space-y-4">
                  <div><label className="label">اسمك</label><input className="input" placeholder="محمد أحمد" value={form.citizen_name} onChange={e => setForm(f => ({...f,citizen_name:e.target.value}))} required/></div>
                  <div><label className="label">رقم موبايلك</label><input className="input" type="tel" placeholder="01xxxxxxxxx" value={form.citizen_phone} onChange={e => setForm(f => ({...f,citizen_phone:e.target.value}))} required/></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">التاريخ</label><input className="input" type="date" min={new Date().toISOString().split('T')[0]} value={form.booking_date} onChange={e => setForm(f => ({...f,booking_date:e.target.value}))} required/></div>
                    <div><label className="label">الوقت</label><input className="input" type="time" value={form.booking_time} onChange={e => setForm(f => ({...f,booking_time:e.target.value}))} required/></div>
                  </div>
                  <div><label className="label">ملاحظات (اختياري)</label><textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f => ({...f,notes:e.target.value}))}/></div>
                  <button type="submit" className="btn-primary" disabled={bookLoad}>
                    {bookLoad ? <Loader2 size={20} className="animate-spin"/> : 'تأكيد الحجز'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
