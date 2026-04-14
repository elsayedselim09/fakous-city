// ============================================
// فاقوس — أنواع البيانات
// ============================================

export type Role = 'citizen' | 'provider' | 'admin'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type SubscriptionPlan = 'free' | 'basic' | 'pro'
export type NotificationType = 'booking' | 'review' | 'system'

export interface Profile {
  id: string
  full_name: string
  phone?: string
  avatar_url?: string
  role: Role
  village?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name_ar: string
  name_en: string
  icon: string
  color: string
  action_button: string
  slug: string
}

export interface Provider {
  id: string
  user_id: string
  category_id: number
  business_name: string
  description?: string
  address?: string
  village: string
  phone?: string
  whatsapp?: string
  price_info?: string
  working_hours?: string
  is_available: boolean
  is_verified: boolean
  subscription_plan: SubscriptionPlan
  subscription_ends_at?: string
  rating: number
  reviews_count: number
  views_count: number
  tags?: string[]
  images?: string[]
  lat?: number
  lng?: number
  created_at: string
  updated_at: string
  // Joined fields
  category?: Category
  profile?: Pick<Profile, 'full_name' | 'avatar_url' | 'phone'>
}

export interface Booking {
  id: string
  provider_id: string
  citizen_id?: string
  citizen_name: string
  citizen_phone: string
  booking_date: string
  booking_time: string
  notes?: string
  status: BookingStatus
  created_at: string
  // Joined
  provider?: Pick<Provider, 'id' | 'business_name' | 'category'>
}

export interface Review {
  id: string
  provider_id: string
  citizen_id?: string
  citizen_name: string
  rating: number
  comment?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  type: NotificationType
  is_read: boolean
  data?: Record<string, unknown>
  created_at: string
}

export interface SearchFilters {
  query?: string
  category_slug?: string
  village?: string
  is_available?: boolean
  min_rating?: number
  sort_by?: 'rating' | 'reviews' | 'newest'
  page?: number
}

export interface SearchResult {
  providers: Provider[]
  total: number
  page: number
  per_page: number
}

// Form schemas
export interface RegisterForm {
  full_name: string
  email: string
  phone: string
  password: string
  village: string
  role: Role
}

export interface BookingForm {
  citizen_name: string
  citizen_phone: string
  booking_date: string
  booking_time: string
  notes?: string
}

export interface ProviderSetupForm {
  category_id: number
  business_name: string
  village: string
  phone: string
  whatsapp?: string
  address?: string
  description?: string
  price_info?: string
  working_hours?: string
  tags: string[]
}
