'use client'

/**
 * Renders an image that may be either:
 *  - a local blob/data-URL (created via URL.createObjectURL or FileReader) — uses <img>
 *  - a remote https URL (Supabase storage) — uses <img> with loading="lazy"
 *
 * We intentionally use <img> here because:
 * 1. Blob URLs cannot be used with next/image at all.
 * 2. These images are user-upload previews rendered once inside a form — optimising
 *    with next/image provides no meaningful benefit and adds complexity.
 */

interface PreviewImageProps {
  src: string
  alt: string
  className?: string
}

// eslint-disable-next-line @next/next/no-img-element
export function PreviewImage({ src, alt, className }: PreviewImageProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} loading="lazy" />
}
