import Link from 'next/link'

import { Search, Briefcase, MapPin, Star, Users, Shield, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <div className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 pt-16 pb-24 px-5 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="relative text-center max-w-sm mx-auto">
          <div className="w-20 h-20 bg-white/15 backdrop-blur-sm border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl">
            <MapPin size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">فاقوس سيتي</h1>
          <p className="text-brand-200 text-base leading-relaxed">كل خدمات مدينتك في مكان واحد</p>
          <p className="text-brand-300 text-sm mt-1">64 قرية · مليون نسمة</p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['🩺 أطباء','💊 صيدليات','⚖️ محامون','☕ كافيهات','🛒 سوبرماركت','📱 موبايلات'].map(c => (
              <span key={c} className="bg-white/10 border border-white/15 text-white text-xs px-3 py-1.5 rounded-full">{c}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 -mt-10 max-w-sm mx-auto relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <Link href="/citizen">
            <div className="bg-white rounded-3xl p-5 shadow-xl border border-gray-100 hover:shadow-2xl transition-all active:scale-95">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                <Search size={24} className="text-blue-600" />
              </div>
              <p className="font-bold text-gray-900 text-base">مواطن</p>
              <p className="text-xs text-gray-400 mt-0.5">ابحث عن خدمة</p>
            </div>
          </Link>
          <Link href="/auth/register?role=provider">
            <div className="bg-white rounded-3xl p-5 shadow-xl border border-gray-100 hover:shadow-2xl transition-all active:scale-95">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-3">
                <Briefcase size={24} className="text-brand-600" />
              </div>
              <p className="font-bold text-gray-900 text-base">مزود خدمة</p>
              <p className="text-xs text-gray-400 mt-0.5">سجّل عملك</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="px-5 mt-6 max-w-sm mx-auto">
        <div className="grid grid-cols-3 gap-3">
          {[{Icon:Users,v:'1M+',l:'مواطن'},{Icon:Briefcase,v:'500+',l:'مزود'},{Icon:Star,v:'4.9',l:'تقييم'}].map(({Icon,v,l}) => (
            <div key={l} className="card-p text-center">
              <Icon size={16} className="text-brand-600 mx-auto mb-1" />
              <p className="font-bold text-gray-900 text-lg leading-none">{v}</p>
              <p className="text-xs text-gray-400 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-8 max-w-sm mx-auto space-y-3">
        {[
          {Icon:Zap,color:'bg-amber-50 text-amber-600',t:'سريع وسهل',d:'ابحث واحجز في ثواني'},
          {Icon:Shield,color:'bg-blue-50 text-blue-600',t:'آمن وموثوق',d:'أمان بنكي على بياناتك'},
          {Icon:Star,color:'bg-purple-50 text-purple-600',t:'تقييمات حقيقية',d:'آراء من مواطنين حقيقيين'},
        ].map(({Icon,color,t,d}) => (
          <div key={t} className="card-p flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{t}</p>
              <p className="text-xs text-gray-500 mt-0.5">{d}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8 pb-12">
        <p className="text-sm text-gray-400 mb-2">عندك حساب؟</p>
        <Link href="/auth/login" className="text-brand-600 font-semibold text-sm">سجّل دخولك ←</Link>
      </div>
    </div>
  )
}
