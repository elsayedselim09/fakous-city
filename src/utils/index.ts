import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function openWhatsapp(phone: string, name: string) {
  const num = phone.replace(/\D/g, '')
  const prefix = num.startsWith('2') ? '' : '2'
  const msg = encodeURIComponent(`أهلاً، رأيتك على فاقوس سيتي وأريد الاستفسار عن ${name}`)
  window.open(`https://wa.me/${prefix}${num}?text=${msg}`, '_blank')
}

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatTime(t: string) {
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'م' : 'ص'}`
}

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24)
  if (d > 0) return `منذ ${d} يوم`
  if (h > 0) return `منذ ${h} ساعة`
  if (m > 0) return `منذ ${m} دقيقة`
  return 'الآن'
}

export const VILLAGES = [
  'فاقوس','الحسينية','كفر صقر','أولاد صقر','الصالحية الجديدة',
  'بلبيس','الزقازيق','منيا القمح','ههيا','ديرب نجم',
  'أبو حماد','القنايات','منشية أبو عمر','قرية أخرى',
]

export const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending:   { label: 'انتظار',  className: 'badge-pending' },
  confirmed: { label: 'مؤكد',    className: 'badge-confirmed' },
  completed: { label: 'مكتمل',   className: 'badge-completed' },
  cancelled: { label: 'ملغي',    className: 'badge-cancelled' },
}
