import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode
  footer?: React.ReactNode
  padding?: boolean
}

export function Card({ header, footer, padding = true, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden', className)}
      {...props}
    >
      {header && (
        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-800">
          {header}
        </div>
      )}
      <div className={padding ? 'p-4' : undefined}>{children}</div>
      {footer && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">{footer}</div>
      )}
    </div>
  )
}
