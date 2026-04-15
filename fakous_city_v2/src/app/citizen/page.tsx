'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell } from 'lucide-react'
import { getCategories, searchProviders } from '@/lib/api'
import type { Category, Provider } from '@/types'
import Link from 'next/link'
import { CitizenNav } from '@/components/shared/BottomNav'
import { ProviderCard } from '@/components/citizen/ProviderCard'
import { SkeletonCard, SkeletonGrid } from '@/components/shared/Loaders'

export default function CitizenHome() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [topProviders, setTopProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getCategories(), searchProviders({ sort_by: 'rating' })]).then(([cats, res]) => {
      setCategories(cats); setTopProviders(res.providers.slice(0, 6)); setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-[var(--surface)] pb-nav">
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 pt-12 pb-8 px-5">
        <div className="flex items-center justify-between mb-5 max-w-lg mx-auto">
          <div>
            <p className="text-brand-200 text-sm">أهلاً 👋</p>
            <h1 className="text-white font-bold text-xl">إيه اللي تدور عليه؟</h1>
          </div>
          <button className="relative w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
            <Bell size={19} className="text-white" />
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); if (query.trim()) router.push(`/citizen/search?q=${encodeURIComponent(query)}`) }} className="max-w-lg mx-auto">
          <div className="relative">
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="w-full bg-white rounded-2xl py-3.5 pr-12 pl-4 text-gray-800 text-sm focus:outline-none shadow-lg" placeholder="ابحث عن طبيب، صيدلية، محامي..." value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </form>
      </div>

      <div className="px-5 py-5 max-w-lg mx-auto space-y-7">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-base">التصنيفات</h2>
            <Link href="/citizen/search" className="text-brand-600 text-sm font-medium">الكل</Link>
          </div>
          {loading ? <SkeletonGrid /> : (
            <div className="grid grid-cols-3 gap-3">
              {categories.slice(0, 6).map(cat => (
                <Link key={cat.id} href={`/citizen/search?category=${cat.slug}`}>
                  <div className="card-p flex flex-col items-center py-4 gap-2 hover:shadow-md transition-all active:scale-95">
                    <span className="text-2xl">{cat.icon}</span>
                    <p className="text-xs font-semibold text-gray-700 text-center leading-tight">{cat.name_ar}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-base">الأعلى تقييماً ⭐</h2>
            <Link href="/citizen/search" className="text-brand-600 text-sm font-medium">عرض الكل</Link>
          </div>
          {loading ? <div className="space-y-3">{[...Array(3)].map((_,i) => <SkeletonCard key={i}/>)}</div>
          : topProviders.length === 0 ? (
            <div className="card-p text-center py-10 text-gray-400"><p className="text-3xl mb-2">🏙️</p><p className="text-sm">لم يتم تسجيل مزودين بعد</p></div>
          ) : <div className="space-y-3">{topProviders.map(p => <ProviderCard key={p.id} provider={p}/>)}</div>}
        </section>
      </div>
      <CitizenNav />
    </div>
  )
}
