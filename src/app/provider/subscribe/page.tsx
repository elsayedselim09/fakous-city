'use client'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, Zap } from 'lucide-react'

const PLANS = [
  {
    id: 'free', name: 'مجاني', price: 0, period: 'دائماً',
    highlight: false,
    features: ['صفحة أساسية', 'ظهور في البحث', 'زر واتساب', 'حجز يدوي'],
    missing: ['أول النتائج', 'شارة موثّق', 'إحصائيات', 'دعم فني'],
  },
  {
    id: 'basic', name: 'أساسي', price: 49, period: 'شهرياً',
    badge: 'الأكثر طلباً', highlight: true, accentClass: 'border-blue-400',
    features: ['كل مميزات المجاني', 'أول النتائج', 'نظام حجز متكامل', 'إشعارات فورية', 'إحصائيات أساسية'],
    missing: ['شارة موثّق', 'دعم فني أولوية'],
  },
  {
    id: 'pro', name: 'احترافي', price: 99, period: 'شهرياً',
    badge: '⭐ الأفضل', highlight: true, accentClass: 'border-brand-500',
    features: ['كل مميزات الأساسي', 'شارة موثّق ✓', 'أولوية قصوى', 'إحصائيات مفصلة', 'دعم فني أولوية', 'صور متعددة'],
    missing: [],
  },
]

export default function SubscribePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[var(--surface)] pb-10">
      <div className="bg-white border-b border-gray-100 px-5 pt-12 pb-5">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-500 mb-3 text-sm">
          <ChevronRight size={18} /> رجوع
        </button>
        <h1 className="font-bold text-gray-900 text-xl">الباقات والاشتراكات</h1>
        <p className="text-gray-400 text-sm mt-1">وسّع نشاطك وانتشارك</p>
      </div>

      <div className="px-5 py-5 space-y-4 max-w-sm mx-auto">
        {PLANS.map(plan => (
          <div key={plan.id} className={`bg-white rounded-3xl overflow-hidden border-2 transition-all ${
            plan.accentClass || 'border-gray-100'
          } ${plan.id === 'pro' ? 'shadow-xl shadow-brand-100' : 'shadow-sm'}`}>
            {plan.badge && (
              <div className={`py-2 text-center text-xs font-bold ${
                plan.id === 'pro' ? 'bg-brand-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                {plan.badge}
              </div>
            )}
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                  <p className="text-gray-400 text-xs">{plan.period}</p>
                </div>
                <div className="text-right">
                  {plan.price === 0 ? (
                    <p className="font-bold text-gray-900 text-2xl">مجاني</p>
                  ) : (
                    <p className="font-bold text-gray-900 text-2xl">
                      {plan.price}
                      <span className="text-sm font-normal text-gray-400"> جنيه</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-5">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-brand-600" />
                    </div>
                    <p className="text-sm text-gray-700">{f}</p>
                  </div>
                ))}
                {plan.missing.map(f => (
                  <div key={f} className="flex items-center gap-2 opacity-35">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-400 text-xs">✕</span>
                    </div>
                    <p className="text-sm text-gray-400">{f}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (plan.id === 'free') { router.back(); return }
                  alert(`سيتم تفعيل باقة ${plan.name} قريباً — جاري إضافة Fawry و PayMob`)
                }}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  plan.id === 'pro'   ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-600/30' :
                  plan.id === 'basic' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                  'border-2 border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {plan.id !== 'free' && <Zap size={15} />}
                {plan.id === 'free' ? 'الباقة الحالية' : `اشترك في ${plan.name}`}
              </button>
            </div>
          </div>
        ))}

        <p className="text-center text-xs text-gray-400 pt-2">
          يمكنك الإلغاء في أي وقت · بدون شروط مخفية
        </p>
      </div>
    </div>
  )
}
