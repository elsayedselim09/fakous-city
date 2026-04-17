import { usePathname } from 'next/navigation'
import Link from 'next/link'

import { Home, Search, CalendarDays, User } from 'lucide-react'

const NAV = [
  { href: '/citizen', label: 'الرئيسية', Icon: Home },
  { href: '/citizen/search', label: 'بحث', Icon: Search },
  { href: '/citizen/bookings', label: 'حجوزاتي', Icon: CalendarDays },
  { href: '/citizen/profile', label: 'حسابي', Icon: User },
]

export function CitizenNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex safe-area-bottom z-40">
      {NAV.map(({ href, label, Icon }) => {
        const active = path === href || (href !== '/citizen' && path.startsWith(href))
        return (
          <Link key={href} href={href} className={`flex-1 flex flex-col items-center pt-3 pb-2 gap-1 transition-colors ${active ? 'text-brand-600' : 'text-gray-400'}`}>
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
