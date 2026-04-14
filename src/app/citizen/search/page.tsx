'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { searchProviders, getCategories } from '@/lib/api'
import type { Provider, Category, SearchFilters } from '@/types'
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react'
import { CitizenNav } from '@/components/shared/BottomNav'
import { ProviderCard } from '@/components/citizen/ProviderCard'
import { SkeletonCard } from '@/components/shared/LoadingSpinner'
import { VILLAGES } from '@/utils'

function SearchContent() {
  const searchParams = useSearchParams()

  const [query, setQuery]           = useState(searchParams.get('q') || '')
  const [categorySlug, setCat]      = useState(searchParams.get('category') || '')
  const [village, setVillage]       = useState('')
  const [sortBy, setSortBy]         = useState<'rating' | 'reviews' | 'newest'>('rating')
  const [showFilters, setFilters]   = useState(false)

  const [providers, setProviders]   = useState<Provider[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [loading, setLoading]       = useState(false)
  const [loadingMore, setMore]      = useState(false)
  const PER_PAGE = 12

  useEffect(() => { getCategories().then(setCategories) }, [])

  const doSearch = useCallback(async (reset = true) => {
    if (reset) { setLoading(true); setPage(1) }
    else setMore(true)

    const filters: SearchFilters = {
      query: query || undefined,
      category_slug: categorySlug || undefined,
      village: village || undefined,
      sort_by: sortBy,
      page: reset ? 1 : page + 1,
    }

    try {
      const res = await searchProviders(filters)
      if (reset) setProviders(res.providers)
      else { setProviders(prev => [...prev, ...res.providers]); setPage(p => p + 1) }
      setTotal(res.total)
    } finally {
      setLoading(false)
      setMore(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, categorySlug, village, sortBy, page])

  useEffect(() => { doSearch(true) }, [categorySlug, village, sortBy])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    doSearch(true)
  }

  function clearFilters() {
    setVillage('')
    setCat('')
    setSortBy('rating')
  }

  const hasFilters = !!(village || categorySlug)
  const selectedCat = categories.find(c => c.slug === categorySlug)

  return (
    <div className="min-h-screen bg-[var(--surface)] pb-nav">

      {/* Sticky Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm">
        <div className="px-4 pt-12 pb-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full border border-gray-200 rounded-xl py-2.5 pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-right bg-gray-50"
                placeholder="ابحث..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => setFilters(!showFilters)}
              className={`relative p-2.5 rounded-xl border transition-all ${
                showFilters || hasFilters
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'border-gray-200 text-gray-600 bg-gray-50'
              }`}
            >
              <SlidersHorizontal size={18} />
              {hasFilters && !showFilters && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full" />
              )}
            </button>
          </form>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          <button onClick={() => setCat('')}
            className={`badge whitespace-nowrap px-4 py-1.5 flex-shrink-0 font-semibold transition-all ${
              !categorySlug ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            الكل
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setCat(cat.slug)}
              className={`badge whitespace-nowrap px-3 py-1.5 flex-shrink-0 gap-1 transition-all ${
                categorySlug === cat.slug
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {cat.icon} {cat.name_ar}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-100 px-4 py-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm">تصفية النتائج</h3>
            <button onClick={clearFilters} className="text-xs text-red-500 flex items-center gap-1 font-medium">
              <X size={12} /> مسح الكل
            </button>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2 font-medium">الترتيب</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'rating',  label: '⭐ الأعلى تقييماً' },
                { value: 'reviews', label: '💬 الأكثر تقييماً' },
                { value: 'newest',  label: '🆕 الأحدث' },
              ].map(opt => (
                <button key={opt.value} onClick={() => setSortBy(opt.value as typeof sortBy)}
                  className={`badge px-3 py-1.5 text-xs font-medium transition-all ${
                    sortBy === opt.value
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2 font-medium">المنطقة</label>
            <select className="input text-sm py-2" value={village} onChange={e => setVillage(e.target.value)}>
              <option value="">كل المناطق</option>
              {VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="px-4 py-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500">
            {loading ? 'جاري البحث...' : (
              <>
                <span className="font-semibold text-gray-900">{total}</span> نتيجة
                {selectedCat && <span className="text-brand-600"> في {selectedCat.name_ar}</span>}
              </>
            )}
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-3">🔍</p>
            <p className="font-bold text-gray-700 mb-1">مفيش نتائج</p>
            <p className="text-gray-400 text-sm">جرب كلمة بحث تانية أو غيّر الفلاتر</p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-4 text-brand-600 text-sm font-medium">
                مسح الفلاتر
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {providers.map(p => <ProviderCard key={p.id} provider={p} />)}
            </div>

            {providers.length < total && (
              <button
                onClick={() => doSearch(false)}
                disabled={loadingMore}
                className="w-full mt-4 py-3.5 border-2 border-brand-600 text-brand-600 rounded-2xl text-sm font-semibold hover:bg-brand-50 flex items-center justify-center gap-2 transition-all"
              >
                {loadingMore ? <Loader2 size={16} className="animate-spin" /> : `عرض المزيد (${total - providers.length} متبقي)`}
              </button>
            )}
          </>
        )}
      </div>

      <CitizenNav />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  )
}
