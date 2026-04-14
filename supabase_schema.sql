-- ============================================
-- فاقوس - قاعدة البيانات الكاملة
-- Fakous Platform — Full Database Schema
-- Version: 2.0 | Production Ready
-- ============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- للبحث السريع

-- ============================================
-- 1. PROFILES
-- ============================================
CREATE TABLE public.profiles (
  id           UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name    TEXT NOT NULL,
  phone        TEXT UNIQUE,
  avatar_url   TEXT,
  role         TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'provider', 'admin')),
  village      TEXT,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CATEGORIES
-- ============================================
CREATE TABLE public.categories (
  id            SERIAL PRIMARY KEY,
  name_ar       TEXT NOT NULL,
  name_en       TEXT NOT NULL,
  icon          TEXT NOT NULL,
  color         TEXT NOT NULL,
  action_button TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  sort_order    INT DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.categories (name_ar, name_en, icon, color, action_button, slug, sort_order) VALUES
  ('طبيب بشري',   'Doctor',      '🩺', '#1D9E75', 'احجز الآن',      'doctor',      1),
  ('طبيب أسنان',  'Dentist',     '🦷', '#185FA5', 'احجز الآن',      'dentist',     2),
  ('صيدلية',      'Pharmacy',    '💊', '#0F6E56', 'اطلب الآن',      'pharmacy',    3),
  ('مدرس',        'Tutor',       '📚', '#BA7517', 'احجز درساً',     'tutor',       4),
  ('محامي',       'Lawyer',      '⚖️', '#534AB7', 'استشر الآن',     'lawyer',      5),
  ('مستشفى',      'Hospital',    '🏥', '#E24B4A', 'احجز الآن',      'hospital',    6),
  ('كافيه',       'Cafe',        '☕', '#3B6D11', 'احجز طاولة',     'cafe',        7),
  ('ملابس',       'Clothes',     '👕', '#D85A30', 'تسوق الآن',      'clothes',     8),
  ('موبايلات',    'Mobiles',     '📱', '#BA7517', 'اسأل عن السعر',  'mobiles',     9),
  ('سوبرماركت',  'Supermarket', '🛒', '#185FA5', 'اطلب توصيل',    'supermarket', 10),
  ('محلات عامة', 'General',     '🏪', '#5F5E5A', 'تواصل الآن',    'general',     11),
  ('أخرى',        'Other',       '✨', '#888780', 'تواصل الآن',    'other',       12);

-- ============================================
-- 3. PROVIDERS
-- ============================================
CREATE TABLE public.providers (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id             UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  category_id         INT REFERENCES public.categories(id) NOT NULL,
  business_name       TEXT NOT NULL,
  description         TEXT,
  address             TEXT,
  village             TEXT NOT NULL,
  phone               TEXT,
  whatsapp            TEXT,
  price_info          TEXT,
  working_hours       TEXT,
  is_available        BOOLEAN DEFAULT TRUE,
  is_verified         BOOLEAN DEFAULT FALSE,
  is_active           BOOLEAN DEFAULT TRUE,
  subscription_plan   TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'pro')),
  subscription_ends_at TIMESTAMPTZ,
  rating              NUMERIC(3,2) DEFAULT 0,
  reviews_count       INT DEFAULT 0,
  views_count         INT DEFAULT 0,
  bookings_count      INT DEFAULT 0,
  tags                TEXT[],
  images              TEXT[],
  lat                 NUMERIC(10,8),
  lng                 NUMERIC(11,8),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. BOOKINGS
-- ============================================
CREATE TABLE public.bookings (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id    UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  citizen_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  citizen_name   TEXT NOT NULL,
  citizen_phone  TEXT NOT NULL,
  booking_date   DATE NOT NULL,
  booking_time   TIME NOT NULL,
  notes          TEXT,
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. REVIEWS
-- ============================================
CREATE TABLE public.reviews (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id   UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  citizen_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  citizen_name  TEXT NOT NULL,
  rating        INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  is_visible    BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (provider_id, citizen_id)
);

-- ============================================
-- 6. NOTIFICATIONS
-- ============================================
CREATE TABLE public.notifications (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('booking', 'review', 'system')),
  is_read    BOOLEAN DEFAULT FALSE,
  data       JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. SUBSCRIPTIONS
-- ============================================
CREATE TABLE public.subscriptions (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id    UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  plan           TEXT NOT NULL CHECK (plan IN ('basic', 'pro')),
  amount         NUMERIC(10,2) NOT NULL,
  starts_at      TIMESTAMPTZ NOT NULL,
  ends_at        TIMESTAMPTZ NOT NULL,
  payment_method TEXT,
  payment_ref    TEXT,
  status         TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_own"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own"   ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories: public read
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (TRUE);

-- Providers: public read, owner write
CREATE POLICY "providers_public_read"  ON public.providers FOR SELECT USING (is_active = TRUE);
CREATE POLICY "providers_owner_all"    ON public.providers FOR ALL USING (auth.uid() = user_id);

-- Bookings: provider sees own, citizen sees own
CREATE POLICY "bookings_provider_read" ON public.bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_id AND user_id = auth.uid())
  OR citizen_id = auth.uid()
);
CREATE POLICY "bookings_anyone_insert" ON public.bookings FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "bookings_provider_update" ON public.bookings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_id AND user_id = auth.uid())
);

-- Reviews: public read, owner write/delete
CREATE POLICY "reviews_public_read"    ON public.reviews FOR SELECT USING (is_visible = TRUE);
CREATE POLICY "reviews_citizen_insert" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "reviews_owner_delete"   ON public.reviews FOR DELETE USING (auth.uid() = citizen_id);

-- Notifications: own only
CREATE POLICY "notifs_own" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Subscriptions: provider sees own
CREATE POLICY "subs_own" ON public.subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_id AND user_id = auth.uid())
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at  BEFORE UPDATE ON public.profiles  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER providers_updated_at BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER bookings_updated_at  BEFORE UPDATE ON public.bookings  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update provider rating when review added/deleted
CREATE OR REPLACE FUNCTION sync_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.providers
  SET
    rating        = COALESCE((SELECT AVG(rating) FROM public.reviews WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id) AND is_visible = TRUE), 0),
    reviews_count = (SELECT COUNT(*) FROM public.reviews WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id) AND is_visible = TRUE)
  WHERE id = COALESCE(NEW.provider_id, OLD.provider_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_sync_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION sync_provider_rating();

-- Auto-update bookings_count
CREATE OR REPLACE FUNCTION sync_bookings_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.providers
  SET bookings_count = (SELECT COUNT(*) FROM public.bookings WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id))
  WHERE id = COALESCE(NEW.provider_id, OLD.provider_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_sync_count
  AFTER INSERT OR DELETE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION sync_bookings_count();

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role, village)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen'),
    NEW.raw_user_meta_data->>'village'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Send notification when booking received
CREATE OR REPLACE FUNCTION notify_provider_on_booking()
RETURNS TRIGGER AS $$
DECLARE
  v_provider_user_id UUID;
  v_business_name TEXT;
BEGIN
  SELECT user_id, business_name INTO v_provider_user_id, v_business_name
  FROM public.providers WHERE id = NEW.provider_id;

  INSERT INTO public.notifications (user_id, title, body, type, data)
  VALUES (
    v_provider_user_id,
    'حجز جديد! 📅',
    NEW.citizen_name || ' حجز موعد في ' || to_char(NEW.booking_date, 'DD/MM/YYYY') || ' الساعة ' || to_char(NEW.booking_time, 'HH12:MI AM'),
    'booking',
    jsonb_build_object('booking_id', NEW.id, 'citizen_name', NEW.citizen_name)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER booking_notify_provider
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION notify_provider_on_booking();

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_providers_category    ON public.providers(category_id);
CREATE INDEX idx_providers_village     ON public.providers(village);
CREATE INDEX idx_providers_available   ON public.providers(is_available) WHERE is_available = TRUE;
CREATE INDEX idx_providers_rating      ON public.providers(rating DESC);
CREATE INDEX idx_providers_plan        ON public.providers(subscription_plan);
CREATE INDEX idx_providers_active      ON public.providers(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_bookings_provider     ON public.bookings(provider_id);
CREATE INDEX idx_bookings_date         ON public.bookings(booking_date);
CREATE INDEX idx_bookings_citizen      ON public.bookings(citizen_id);
CREATE INDEX idx_bookings_status       ON public.bookings(status);
CREATE INDEX idx_reviews_provider      ON public.reviews(provider_id);
CREATE INDEX idx_notifs_user_unread    ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

-- Full-text search (Arabic + trigram)
CREATE INDEX idx_providers_name_trgm ON public.providers
  USING GIN (business_name gin_trgm_ops);
CREATE INDEX idx_providers_fulltext ON public.providers
  USING GIN (to_tsvector('simple', business_name || ' ' || COALESCE(description, '')));

-- ============================================
-- STORAGE BUCKETS (run separately in Supabase Dashboard)
-- ============================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('provider-images', 'provider-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies (run after creating buckets):
-- CREATE POLICY "provider images public read" ON storage.objects FOR SELECT USING (bucket_id = 'provider-images');
-- CREATE POLICY "provider upload own images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'provider-images' AND auth.uid()::text = (storage.foldername(name))[1]);
