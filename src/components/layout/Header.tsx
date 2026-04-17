import Link from 'next/link'

import { MapPin } from 'lucide-react'

interface HeaderProps {
  title?: string
  showBack?: boolean
}

export function Header({ title = 'فاقوس سيتي', showBack = false }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 max-w-lg mx-auto">
        {showBack ? (
          <Link href="/" className="text-gray-500 text-sm font-medium flex items-center gap-1">
            <span className="rtl-flip">←</span> رجوع
          </Link>
        ) : (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
              <MapPin size={16} className="text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-gray-900 text-sm">{title}</span>
          </Link>
        )}
      </div>
    </header>
  )
}
