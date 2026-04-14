import Link from 'next/link'
import { Star, ChevronLeft, BadgeCheck } from 'lucide-react'
import type { Provider } from '@/types'

interface ProviderCardProps {
  provider: Provider
  compact?: boolean
}

export function ProviderCard({ provider, compact = false }: ProviderCardProps) {
  const color = provider.category?.color || '#0d9262'

  return (
    <Link href={`/citizen/provider/${provider.id}`}>
      <div
        className="card-p flex items-center gap-3 hover:shadow-md hover:border-gray-200 transition-all active:scale-[0.99]"
        style={{ borderRight: `3px solid ${color}` }}
      >
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: color + '18' }}
        >
          {provider.category?.icon || '🏪'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-gray-900 text-sm truncate">{provider.business_name}</p>
            {provider.is_verified && (
              <BadgeCheck size={14} className="text-blue-500 flex-shrink-0" />
            )}
            {provider.subscription_plan === 'pro' && (
              <span className="badge-pro text-[10px] px-1.5 py-0.5 flex-shrink-0">PRO</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {provider.category?.name_ar} · {provider.village}
          </p>
          {!compact && (
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-semibold text-gray-700">{provider.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({provider.reviews_count})</span>
              </div>
              {provider.price_info && (
                <span className="text-xs text-gray-400">· {provider.price_info}</span>
              )}
            </div>
          )}
        </div>

        {/* Status + Arrow */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className={provider.is_available ? 'badge-available' : 'badge-busy'}>
            {provider.is_available ? 'متاح' : 'مشغول'}
          </span>
          <ChevronLeft size={14} className="text-gray-300" />
        </div>
      </div>
    </Link>
  )
}
