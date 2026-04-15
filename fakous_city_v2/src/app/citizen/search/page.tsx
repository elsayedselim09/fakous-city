'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { searchProviders, getCategories } from '@/lib/api'
import type { Provider, Category, SearchFilters } from '@/types'
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react'
import { CitizenNav } from '@/components/shared/BottomNav'
import { ProviderCard } from '@/components/citizen/ProviderCard'
import { SkeletonCard } from '@/components/shared/Loaders'
import { VILLAGES } from '@/utils'

function SearchContent() {
  const sp = useSearchParams()
  const [query, setQuery] = useState(sp.get('q') || '')
  const [categorySlug, setCat] = useState(sp.get('category') || '')
  const [village, setVillage] = useState('')
  const [sortBy, setSortBy] = useState<'rating'|'reviews'|'newest'>('rating')
  const [showFilters, setFilters] = useState(false)
  const [providers, setProviders] = useState<Provider[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setMore] = useState(false)

  useEffect(() => { getCategories().then(setCategories) }, [])

  const doSearch = useCallback(async (reset = true) => {
    if (reset) { setLoading(true); setPage(1) } else setMore(true)
    const filters: SearchFilters = { query: query||undefined, category_slug: categorySlug||undefined, village: village||undefined, sort_by: sortBy, page: reset ? 1 : page+1 }
    try {
      const res = await searchProviders(filters)
      if (reset) setProviders(res.providers); else { setProviders(p => [...p, ...res.providers]); setPage(p => p+1) }
      setTotal(res.total)
    } finally { setLoading(false); setMore(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, categorySlug, village, sortBy, page])

  useEffect(() => { doSearch(true) }, [categorySlug, village, sortBy])

  return (
    <div className="min-h-screen bg-[var(--surface)] pb-nav">
      <div className="bg-white sticky top-0 z-30 shadow-sm">
        <div className="px-4 pt-12 pb-3">
          <form onSubmit={e => { e.preventDefault(); doSearch(true) }} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full border border-gray-200 rounded-xl py-2.5 pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-right bg-gray-50" placeholder="ابحث..." value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <button type="button" onClick={() => setFilters(!showFilters)} className={`p-2.5 rounded-xl border transition-all ${showFilters ? 'bg-brand-600 border-brand-600 text-white' : 'border-gray-200 text-gray-600 bg-gray-50'}`}>
              <SlidersHorizontal size={18}/>
            </button>
          </form>
        </div>
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          <button onClick={() => setCat('')} className={`badge whitespace-nowrap px-4 py-1.5 flex-shrink-0 font-semibold ${!categorySlug ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}>الكل</button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setCat(cat.slug)} className={`badge whitespace-nowrap px-3 py-1.5 flex-shrink-0 gap-1 ${categorySlug===cat.slug ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{cat.icon} {cat.name_ar}</button>
          ))}
        </div>
      </div>

      {showFilters && (
        <div className="bg-white border-b border-gray-100 px-4 py-4 space-y-4">
          <div className="flex items-center justify-between"><h3 className="font-bold text-gray-800 text-sm">الفلاتر</h3><button onClick={() => { setVillage(''); setCat(''); setSortBy('rating') }} className="text-xs text-red-500 flex items-center gap-1"><X size={12}/>مسح</button></div>
          <div>
            <label className="block text-xs text-gray-500 mb-2 font-medium">الترتيب</label>
            <div className="flex gap-2 flex-wrap">
              {[{v:'rating',l:'⭐ الأعلى'},{v:'reviews',l:'💬 الأكثر'},{v:'newest',l:'🆕 الأحدث'}].map(o => (
                <button key={o.v} onClick={() => setSortBy(o.v as typeof sortBy)} className={`badge px-3 py-1.5 text-xs font-medium ${sortBy===o.v ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{o.l}</button>
              ))}
            </div>
          </div>
          <div><label className="block text-xs text-gray-500 mb-2 font-medium">المنطقة</label>
            <select className="input text-sm py-2" value={village} onChange={e => setVillage(e.target.value)}>
              <option value="">كل المناطق</option>
              {VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="px-4 py-4 max-w-lg mx-auto">
        <p className="text-sm text-gray-500 mb-3">{loading ? 'جاري البحث...' : <><span className="font-semibold text-gray-900">{total}</span> نتيجة</>}</p>
        {loading ? <div className="space-y-3">{[...Array(4)].map((_,i) => <SkeletonCard key={i}/>)}</div>
        : providers.length === 0 ? (
          <div className="text-center py-20"><p className="text-5xl mb-3">🔍</p><p className="font-bold text-gray-700">مفيش نتائج</p><p className="text-gray-400 text-sm mt-1">جرب كلمة تانية</p></div>
        ) : (
          <>
            <div className="space-y-3">{providers.map(p => <ProviderCard key={p.id} provider={p}/>)}</div>
            {providers.length < total && (
              <button onClick={() => doSearch(false)} disabled={loadingMore} className="w-full mt-4 py-3.5 border-2 border-brand-600 text-brand-600 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2">
                {loadingMore ? <Loader2 size={16} className="animate-spin"/> : `عرض المزيد (${total - providers.length})`}
              </button>
            )}
          </>
        )}
      </div>
      <CitizenNav />
    </div>
  )
}

export default function SearchPage() { return <Suspense><SearchContent/></Suspense> }
