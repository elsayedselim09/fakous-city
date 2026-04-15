import { createClient } from './supabase/client'
import type { SearchFilters, Provider, Booking, Review } from '@/types'

export async function getCategories() {
  const sb = createClient()
  const { data } = await sb.from('categories').select('*').order('sort_order')
  return data || []
}

export async function searchProviders(filters: SearchFilters) {
  const sb = createClient()
  const { query, category_slug, village, is_available, min_rating, sort_by = 'rating', page = 1 } = filters
  const per_page = 12
  const from = (page - 1) * per_page

  let q = sb
    .from('providers')
    .select('*, category:categories(*), profile:profiles(full_name, avatar_url)', { count: 'exact' })
    .eq('is_active', true)
    .range(from, from + per_page - 1)

  if (category_slug) {
    const { data: cat } = await sb.from('categories').select('id').eq('slug', category_slug).single()
    if (cat) q = q.eq('category_id', cat.id)
  }
  if (village) q = q.eq('village', village)
  if (is_available !== undefined) q = q.eq('is_available', is_available)
  if (min_rating) q = q.gte('rating', min_rating)
  if (query) q = q.ilike('business_name', `%${query}%`)

  if (sort_by === 'rating') q = q.order('subscription_plan', { ascending: false }).order('rating', { ascending: false })
  else if (sort_by === 'reviews') q = q.order('reviews_count', { ascending: false })
  else q = q.order('created_at', { ascending: false })

  const { data, error, count } = await q
  if (error) throw error
  return { providers: (data as Provider[]) || [], total: count || 0, page, per_page }
}

export async function getProviderById(id: string): Promise<Provider> {
  const sb = createClient()
  const { data, error } = await sb
    .from('providers')
    .select('*, category:categories(*), profile:profiles(full_name, avatar_url, phone)')
    .eq('id', id).single()
  if (error) throw error
  sb.from('providers').update({ views_count: (data.views_count || 0) + 1 }).eq('id', id).then(() => {})
  return data as Provider
}

export async function getProviderByUserId(userId: string): Promise<Provider | null> {
  const sb = createClient()
  const { data } = await sb.from('providers').select('*, category:categories(*)').eq('user_id', userId).single()
  return data as Provider | null
}

export async function createProvider(data: Omit<Provider, 'id'|'created_at'|'updated_at'|'rating'|'reviews_count'|'views_count'>) {
  const sb = createClient()
  const { data: result, error } = await sb.from('providers').insert({ ...data, images: [], is_available: true, is_verified: false, subscription_plan: 'free' }).select().single()
  if (error) throw error
  return result as Provider
}

export async function updateProvider(id: string, updates: Partial<Provider>) {
  const sb = createClient()
  const { data, error } = await sb.from('providers').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data as Provider
}

export async function toggleAvailability(id: string, is_available: boolean) {
  const sb = createClient()
  await sb.from('providers').update({ is_available }).eq('id', id)
}

export async function createBooking(booking: Omit<Booking, 'id'|'created_at'|'status'>) {
  const sb = createClient()
  const { data, error } = await sb.from('bookings').insert({ ...booking, status: 'pending' }).select().single()
  if (error) throw error
  return data as Booking
}

export async function getProviderBookings(providerId: string) {
  const sb = createClient()
  const { data } = await sb.from('bookings').select('*').eq('provider_id', providerId).order('booking_date').order('booking_time')
  return (data as Booking[]) || []
}

export async function getCitizenBookings(citizenId: string) {
  const sb = createClient()
  const { data } = await sb.from('bookings').select('*, provider:providers(id,business_name,category:categories(name_ar,icon,color))').eq('citizen_id', citizenId).order('booking_date', { ascending: false })
  return (data as Booking[]) || []
}

export async function updateBookingStatus(id: string, status: Booking['status']) {
  const sb = createClient()
  await sb.from('bookings').update({ status }).eq('id', id)
}

export async function getProviderReviews(providerId: string): Promise<Review[]> {
  const sb = createClient()
  const { data } = await sb.from('reviews').select('*').eq('provider_id', providerId).eq('is_visible', true).order('created_at', { ascending: false }).limit(20)
  return (data as Review[]) || []
}
