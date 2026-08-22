import { RotateCcw, Shuffle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getIllustration, illustrationCatalog, type IllustrationCategory, type IllustrationOption } from '../assets/illustrations'

interface IllustrationPickerProps {
  value: string
  onChange: (id: string) => void
  categories?: IllustrationCategory[]
}

export function IllustrationPicker({ value, onChange, categories }: IllustrationPickerProps) {
  const [category, setCategory] = useState<'全部' | IllustrationCategory>('全部')
  const allowed = categories ?? ['人物', '服裝', '配件', '旅遊']
  const options = useMemo(() => illustrationCatalog.filter((item) => category === '全部' || item.category === category), [category])
  const selected = getIllustration(value)
  const randomize = () => onChange(options[Math.floor(Math.random() * options.length)]?.id ?? selected.id)

  return (
    <section className="illustration-picker" aria-label="選擇圖案">
      <div className="picker-preview" style={{ '--illustration-accent': selected.accent } as React.CSSProperties}>
        <span className="picker-emoji" aria-hidden="true">{selected.emoji}</span>
        <div><strong>{selected.label}</strong><span>目前選擇</span></div>
      </div>
      <div className="picker-tabs" role="tablist" aria-label="圖案分類">
        {['全部', ...allowed].map((item) => (
          <button className={category === item ? 'picker-tab is-active' : 'picker-tab'} key={item} type="button" role="tab" aria-selected={category === item} onClick={() => setCategory(item as '全部' | IllustrationCategory)}>{item}</button>
        ))}
      </div>
      <div className="illustration-grid">
        {options.map((option: IllustrationOption) => (
          <button className={value === option.id ? 'illustration-option is-selected' : 'illustration-option'} key={option.id} type="button" aria-label={option.label} onClick={() => onChange(option.id)}>
            <span className="illustration-art" style={{ '--illustration-accent': option.accent } as React.CSSProperties}>{option.emoji}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
      <div className="picker-actions">
        <button type="button" onClick={() => onChange('hanbok-woman')}><RotateCcw size={16} />重設</button>
        <button type="button" onClick={randomize}><Shuffle size={16} />隨機選擇</button>
      </div>
    </section>
  )
}
