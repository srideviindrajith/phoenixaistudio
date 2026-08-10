'use client'

import { useMemo, useState } from 'react'

import { cn } from '@/lib/utils'
import { useSettings } from '@/components/public/settings-context'

type BrandLogoSize = 'small' | 'medium' | 'large'

interface BrandLogoProps {
  src?: string | null
  alt?: string
  size?: BrandLogoSize
  glow?: boolean
  showTextFallback?: boolean
  className?: string
  imageClassName?: string
}

const sizeClasses: Record<BrandLogoSize, string> = {
  small: 'h-[42px]',
  medium: 'h-12',
  large: 'h-16',
}

const fallbackTextSize: Record<BrandLogoSize, string> = {
  small: 'text-xs',
  medium: 'text-sm',
  large: 'text-base',
}

function normalizeLogoSrc(value?: string | null) {
  const source = (value || '').trim()

  if (!source) return '/uploads/logo/logo.png'
  if (source.startsWith('http') || source.startsWith('data:') || source.startsWith('/')) {
    return source
  }

  return `/${source.replace(/^public\//, '')}`
}

export function BrandLogo({
  src,
  alt = 'PhoenixAI Studio',
  size = 'medium',
  glow = false,
  showTextFallback = true,
  className,
  imageClassName,
}: BrandLogoProps) {
  const { settings } = useSettings()
  const resolvedSrc = useMemo(
    () => normalizeLogoSrc(src ?? settings?.logo_url),
    [settings?.logo_url, src]
  )
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = failedSrc !== resolvedSrc

  return (
    <span
      className={cn(
        'inline-flex max-w-full shrink-0 items-center justify-center overflow-hidden rounded-[14px]',
        sizeClasses[size],
        glow && 'drop-shadow-[0_0_18px_rgba(255,106,0,0.45)]',
        className
      )}
    >
      {showImage && (
        <img
          src={resolvedSrc}
          alt={alt}
          className={cn(
            'h-full max-w-full object-contain transition-all duration-300',
            glow && 'drop-shadow-[0_0_18px_rgba(255,106,0,0.45)]',
            imageClassName
          )}
          onError={() => setFailedSrc(resolvedSrc)}
        />
      )}

      {!showImage && showTextFallback && (
        <span
          aria-label={alt}
          role="img"
          className={cn(
            'inline-flex h-full items-center rounded-[14px] border border-[#FF6A00]/30 bg-[linear-gradient(135deg,rgba(255,106,0,0.22),rgba(204,79,0,0.08))] px-4 font-heading font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
            fallbackTextSize[size],
            glow && 'shadow-[0_0_28px_rgba(255,106,0,0.22),inset_0_1px_0_rgba(255,255,255,0.06)]'
          )}
        >
          PhoenixAI Studio
        </span>
      )}
    </span>
  )
}
