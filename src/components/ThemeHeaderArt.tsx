export type ThemeHeaderArtKind = 'itinerary' | 'budget' | 'shopping' | 'prep' | 'companions' | 'settings'

export function ThemeHeaderArt({ kind }: { kind: ThemeHeaderArtKind }) {
  return (
    <div className={`theme-header-art theme-header-art--${kind}`} aria-hidden="true">
      <span className="theme-art-sun" />
      <span className="theme-art-cloud theme-art-cloud-a" />
      <span className="theme-art-cloud theme-art-cloud-b" />
      <span className="theme-art-tree theme-art-tree-a" />
      <span className="theme-art-tree theme-art-tree-b" />
      <span className="theme-art-object theme-art-object-a" />
      <span className="theme-art-object theme-art-object-b" />
      <span className="theme-art-accent theme-art-accent-a" />
      <span className="theme-art-accent theme-art-accent-b" />
    </div>
  )
}
