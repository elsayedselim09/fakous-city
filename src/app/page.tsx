'use client'
import Link from 'next/link'
import { Search, Briefcase, MapPin, Star, Users, Shield, Zap } from 'lucide-react'

const CATEGORIES_PREVIEW = [
  { icon: '🩺', label: 'أطباء' },
  { icon: '💊', label: 'صيدليات' },
  { icon: '⚖️', label: 'محامون' },
  { icon: '☕', label: 'كافيهات' },
  { icon: '🛒', label: 'سوبرماركت' },
  { icon: '📱', label: 'موبايلات' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">

      {/* ===== Hero ===== */}
      <div className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 pt-16 pb-24 px-5 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-80 h-20 bg-brand-800/50 blur-3xl" />

        <div className="relative text-center max-w-sm mx-auto">
          {/* Logo */}
          <div className="w-20 h-20 bg-white/15 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl">
            <MapPin size={36} className="text-white" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">فاقوس</h1>
          <p className="text-brand-200 text-base leading-relaxed mb-2">
            كل خدمات مدينتك في مكان واحد
          </p>
          <p className="text-brand-300 text-sm">
            64 قرية · مليون نسمة
          </p>

          {/* Category chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {CATEGORIES_PREVIEW.map(c => (
              <span key={c.label} className="bg-white/10 backdrop-blur-sm border border-white/15 text-white text-xs px-3 py-1.5 rounded-full">
                {c.icon} {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Entry Cards — float over hero ===== */}
      <div className="px-5 -mt-10 max-w-sm mx-auto relative z-10">
        <div className="grid grid-cols-2 gap-4">

          {/* مواطن */}
          <Link href="/citizen">
            <div className="bg-white rounded-3xl p-5 shadow-xl border border-gray-100 hover:shadow-2xl transition-all active:scale-95 cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                <Search size={24} className="text-blue-600" />
              </div>
              <p className="font-bold text-gray-900 text-base">مواطن</p>
              <p className="text-xs text-gray-400 mt-0.5">ابحث عن خدمة</p>
            </div>
          </Link>

          {/* مزود */}
          <Link href="/auth/register?role=provider">
            <div className="bg-white rounded-3xl p-5 shadow-xl border border-gray-100 hover:shadow-2xl transition-all active:scale-95 cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-3">
                <Briefcase size={24} className="text-brand-600" />
              </div>
              <p className="font-bold text-gray-900 text-base">مزود خدمة</p>
              <p className="text-xs text-gray-400 mt-0.5">سجّل عملك</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ===== Stats ===== */}
      <div className="px-5 mt-6 max-w-sm mx-auto">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Users, value: '1M+', label: 'مواطن' },
            { icon: Briefcase, value: '500+', label: 'مزود' },
            { icon: Star, value: '4.9', label: 'تقييم' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="card-p text-center">
              <Icon size={16} className="text-brand-600 mx-auto mb-1" />
              <p className="font-bold text-gray-900 text-lg leading-none">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Features ===== */}
      <div className="px-5 mt-8 max-w-sm mx-auto">
        <h2 className="font-bold text-gray-900 text-lg mb-4">ليه فاقوس؟</h2>
        <div className="space-y-3">
          {[
            { icon: Zap, color: 'bg-amber-50 text-amber-600', title: 'سريع وسهل', desc: 'ابحث واحجز في ثواني بدون تعقيد' },
            { icon: Shield, color: 'bg-blue-50 text-blue-600', title: 'آمن وموثوق', desc: 'كل بياناتك محمية بأمان بنكي' },
            { icon: Star, color: 'bg-purple-50 text-purple-600', title: 'مراجعات حقيقية', desc: 'تقييمات من مواطنين حقيقيين' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="card-p flex items-center gap-4">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Footer CTA ===== */}
      <div className="px-5 mt-8 pb-12 max-w-sm mx-auto text-center">
        <p className="text-sm text-gray-400 mb-2">عندك حساب بالفعل؟</p>
        <Link href="/auth/login" className="text-brand-600 font-semibold text-sm">
          سجّل دخولك الآن ←
        </Link>
      </div>

    </div>
  )
}
