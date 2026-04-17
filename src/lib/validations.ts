import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صحيح'),
  password: z.string().min(8, 'كلمة المرور 8 أحرف على الأقل'),
})

export const registerSchema = z
  .object({
    name: z.string().min(4, 'الاسم يجب أن يكون رباعياً على الأقل'),
    email: z.string().email('بريد إلكتروني غير صحيح'),
    password: z.string().min(8, 'كلمة المرور 8 أحرف على الأقل'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  })

export const profileSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  phone: z
    .string()
    .regex(/^01[0-9]{9}$/, 'رقم الموبايل غير صحيح (01xxxxxxxxx)')
    .optional()
    .or(z.literal('')),
  avatar_url: z.string().url('رابط الصورة غير صحيح').optional().or(z.literal('')),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProfileInput = z.infer<typeof profileSchema>
