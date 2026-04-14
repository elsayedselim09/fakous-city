import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function openWhatsapp(phone: string, providerName: string) {
  const num = phone.replace(/\D/g, '')
  const prefix = num.startsWith('2') ? '' : '2'
  const msg = encodeURIComponent(`أهلاً، رأيتك على تطبيق فاقوس وأريد الاستفسار عن ${providerName}`)
  window.open(`https://wa.me/${prefix}${num}?text=${msg}`, '_blank')
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

export function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'م' : 'ص'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `منذ ${days} يوم`
  if (hours > 0) return `منذ ${hours} ساعة`
  if (minutes > 0) return `منذ ${minutes} دقيقة`
  return 'الآن'
}

export const VILLAGES = [
  'فاقوس', 'الحسينية', 'كفر صقر', 'أولاد صقر', 'الصالحية الجديدة',
  'بلبيس', 'الزقازيق', 'منيا القمح', 'ههيا', 'ديرب نجم',
  'أبو حماد', 'القنايات', 'منشية أبو عمر', 'قرية أخرى',
]

export const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending:   { label: 'انتظار',  className: 'badge-pending' },
  confirmed: { label: 'مؤكد',    className: 'badge-confirmed' },
  completed: { label: 'مكتمل',   className: 'badge-completed' },
  cancelled: { label: 'ملغي',    className: 'badge-cancelled' },
}
