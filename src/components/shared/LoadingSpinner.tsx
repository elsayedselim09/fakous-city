import { Loader2 } from 'lucide-react'

export function LoadingSpinner({ text = 'جاري التحميل...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-gray-400">
      <Loader2 size={32} className="animate-spin text-brand-600" />
      <p className="text-sm">{text}</p>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card-p animate-pulse">
      <div className="flex items-center gap-3">
        <div className="skeleton w-14 h-14 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="skeleton h-3 w-1/3 rounded" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="skeleton h-20 rounded-2xl" />
      ))}
    </div>
  )
}
