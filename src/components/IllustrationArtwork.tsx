import type { IllustrationOption } from '../assets/illustrations'

export function IllustrationArtwork({ illustration, className, alt = '', decorative = false }: {
  illustration: IllustrationOption
  className?: string
  alt?: string
  decorative?: boolean
}) {
  if (illustration.imageUrl) {
    return <img className={className} src={illustration.imageUrl} alt={decorative ? '' : alt} aria-hidden={decorative || undefined} />
  }
  return <span className={className} aria-hidden={decorative || undefined}>{illustration.emoji}</span>
}
