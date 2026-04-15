import { createClient } from './supabase/client'

export async function uploadFile(
  bucket: 'avatars' | 'id-cards' | 'intro-videos' | 'provider-images',
  userId: string,
  file: File,
  folder?: string
): Promise<string> {
  const sb = createClient()
  const ext = file.name.split('.').pop()
  const path = folder
    ? `${userId}/${folder}/${Date.now()}.${ext}`
    : `${userId}/${Date.now()}.${ext}`

  const { error } = await sb.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) throw error

  const { data } = sb.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadAvatar(userId: string, file: File) {
  return uploadFile('avatars', userId, file)
}

export async function uploadIdCard(userId: string, file: File, side: 'front' | 'back') {
  return uploadFile('id-cards', userId, file, side)
}

export async function uploadIntroVideo(userId: string, file: File) {
  return uploadFile('intro-videos', userId, file)
}

export async function uploadProviderImage(userId: string, file: File) {
  return uploadFile('provider-images', userId, file)
}
