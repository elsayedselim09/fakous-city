# فاقوس — منصة الخدمات المحلية

> كل خدمات مدينتك في مكان واحد

## 🚀 تشغيل المشروع (5 خطوات)

### 1. إنشاء مشروع Supabase
1. اذهب إلى [supabase.com](https://supabase.com) وأنشئ حساب مجاني
2. انقر **New Project**
3. اختار:
   - **Name:** fakous
   - **Region:** West EU (Frankfurt) — الأقرب لمصر
   - **Password:** اختار كلمة مرور قوية

### 2. إعداد قاعدة البيانات
1. في Supabase Dashboard → **SQL Editor**
2. افتح ملف `supabase_schema.sql`
3. انسخ المحتوى كله والصقه في SQL Editor
4. اضغط **Run**

### 3. إعداد Storage
في Supabase Dashboard → **Storage** → **New Bucket**:
- Bucket 1: `provider-images` ✅ Public
- Bucket 2: `avatars` ✅ Public

### 4. الحصول على المفاتيح
في Supabase Dashboard → **Settings** → **API**:
- انسخ **Project URL**
- انسخ **anon public key**

### 5. تشغيل المشروع

```bash
# انسخ ملف البيئة
cp .env.local.example .env.local

# ضع مفاتيح Supabase
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# ثبّت المكتبات
npm install

# شغّل المشروع
npm run dev

# افتح
# http://localhost:3000
```

## 📦 النشر على Vercel

```bash
# ثبّت Vercel CLI
npm i -g vercel

# سجّل دخولك
vercel login

# انشر
vercel

# ضع environment variables في لوحة Vercel:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 🏗️ هيكل المشروع

```
src/
├── app/
│   ├── page.tsx                    ← الصفحة الرئيسية
│   ├── auth/
│   │   ├── login/                  ← تسجيل الدخول
│   │   └── register/               ← إنشاء حساب
│   ├── citizen/
│   │   ├── page.tsx               ← رئيسية المواطن
│   │   ├── search/                ← البحث
│   │   ├── provider/[id]/         ← صفحة مزود الخدمة
│   │   ├── bookings/              ← حجوزاتي
│   │   ├── profile/               ← حسابي
│   │   └── notifications/         ← الإشعارات
│   └── provider/
│       ├── dashboard/             ← لوحة التحكم
│       ├── setup/                 ← إعداد الصفحة
│       ├── edit/                  ← تعديل البيانات
│       └── subscribe/             ← الاشتراكات
├── components/
│   ├── shared/                    ← مكونات مشتركة
│   └── citizen/                   ← مكونات المواطن
├── lib/
│   ├── api.ts                     ← دوال API
│   └── supabase/                  ← إعداد Supabase
├── types/index.ts                 ← أنواع البيانات
└── utils/index.ts                 ← دوال مساعدة
```

## 🔐 الأمان المُطبَّق

- ✅ Row Level Security على كل الجداول
- ✅ كل مستخدم يشوف بياناته بس
- ✅ Route protection بالـ middleware
- ✅ Input validation
- ✅ Supabase Auth مع JWT

## 💳 باقات الاشتراك

| الباقة | السعر | المميزات |
|--------|-------|----------|
| مجاني | 0 ج | صفحة أساسية + بحث + واتساب |
| أساسي | 49 ج/شهر | أول النتائج + حجز + إشعارات |
| احترافي | 99 ج/شهر | شارة موثّق + أولوية قصوى + دعم |

## 🗺️ الخطوات القادمة

- [ ] إضافة بوابة Fawry / PayMob
- [ ] إشعارات Push (Supabase Realtime)
- [ ] لوحة أدمن
- [ ] خريطة Google Maps لكل مزود
- [ ] تطبيق Android/iOS عبر Capacitor
- [ ] نظام دردشة مباشرة
