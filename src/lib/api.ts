import { createClient } from './supabase/client'
import type { SearchFilters, Provider, Booking, Review, ProviderSetupForm } from '@/types'

// ============================================
// Categories
// ============================================
export async function getCategories() {
  const supabase = createClient()
  const { data } = await supabase.from('categories').select('*').order('id')
  return data || []
}

// ============================================
// Search & Providers
// ============================================
export async function searchProviders(filters: SearchFilters) {
  const supabase = createClient()
  const { query, category_slug, village, is_available, min_rating, sort_by = 'rating', page = 1 } = filters
  const per_page = 12
  const from = (page - 1) * per_page
  const to = from + per_page - 1

  let q = supabase
    .from('providers')
    .select(`*, category:categories(*), profile:profiles(full_name, avatar_url)`, { count: 'exact' })
    .range(from, to)

  if (category_slug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', category_slug).single()
    if (cat) q = q.eq('category_id', cat.id)
  }
  if (village) q = q.eq('village', village)
  if (is_available !== undefined) q = q.eq('is_available', is_available)
  if (min_rating) q = q.gte('rating', min_rating)
  if (query) q = q.ilike('business_name', `%${query}%`)

  // Subscription boosts - pro first, then basic, then free
  if (sort_by === 'rating') {
    q = q.order('subscription_plan', { ascending: false }).order('rating', { ascending: false })
  } else if (sort_by === 'reviews') {
    q = q.order('reviews_count', { ascending: false })
  } else {
    q = q.order('created_at', { ascending: false })
  }

  const { data, error, count } = await q
  if (error) throw error
  return { providers: (data as Provider[]) || [], total: count || 0, page, per_page }
}

export async function getProviderById(id: string): Promise<Provider> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('providers')
    .select(`*, category:categories(*), profile:profiles(full_name, avatar_url, phone)`)
    .eq('id', id)
    .single()
  if (error) throw error

  // Increment views (fire and forget)
  supabase
    .from('providers')
    .update({ views_count: (data.views_count || 0) + 1 })
    .eq('id', id)
    .then(() => {})

  return data as Provider
}

export async function getProviderByUserId(userId: string): Promise<Provider | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('providers')
    .select(`*, category:categories(*)`)
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data as Provider
}

export async function createProvider(data: ProviderSetupForm & { user_id: string }) {
  const supabase = createClient()
  const { data: result, error } = await supabase
    .from('providers')
    .insert({
      ...data,
      images: [],
      is_available: true,
      is_verified: false,
      subscription_plan: 'free',
    })
    .select()
    .single()
  if (error) throw error
  return result as Provider
}

export async function updateProvider(id: string, updates: Partial<Provider>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('providers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Provider
}

export async function toggleAvailability(id: string, is_available: boolean) {
  const supabase = createClient()
  const { error } = await supabase
    .from('providers')
    .update({ is_available })
    .eq('id', id)
  if (error) throw error
}

// ============================================
// Bookings
// ============================================
export async function createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'status'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings')
    .insert({ ...booking, status: 'pending' })
    .select()
    .single()
  if (error) throw error
  return data as Booking
}

export async function getProviderBookings(providerId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('provider_id', providerId)
    .order('booking_date', { ascending: true })
    .order('booking_time', { ascending: true })
  if (error) throw error
  return (data as Booking[]) || []
}

export async function getCitizenBookings(citizenId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select(`*, provider:providers(id, business_name, category:categories(name_ar, icon, color))`)
    .eq('citizen_id', citizenId)
    .order('booking_date', { ascending: false })
  if (error) throw error
  return (data as Booking[]) || []
}

export async function updateBookingStatus(bookingId: string, status: Booking['status']) {
  const supabase = createClient()
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
  if (error) throw error
}

// ============================================
// Reviews
// ============================================
export async function getProviderReviews(providerId: string): Promise<Review[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return (data as Review[]) || []
}

export async function addReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reviews')
    .upsert(review, { onConflict: 'provider_id,citizen_id' })
    .select()
    .single()
  if (error) throw error
  return data as Review
}

// ============================================
// Notifications
// ============================================
export async function getNotifications(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  return data || []
}

export async function markNotificationsRead(userId: string) {
  const supabase = createClient()
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
}

// ============================================
// Profile
// ============================================
export async function updateProfile(userId: string, updates: { full_name?: string; phone?: string; village?: string }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}
