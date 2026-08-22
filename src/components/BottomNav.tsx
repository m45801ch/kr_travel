import { CalendarDays, ListChecks, Settings, ShoppingBag, WalletCards } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { label: '行程', path: '/itinerary', Icon: CalendarDays },
  { label: '記帳', path: '/expenses', Icon: WalletCards },
  { label: '購物', path: '/shopping', Icon: ShoppingBag },
  { label: '準備', path: '/prep', Icon: ListChecks },
  { label: '設置', path: '/settings', Icon: Settings },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="主要功能">
      {items.map(({ label, path, Icon }) => (
        <NavLink className={({ isActive }) => isActive ? 'nav-item is-active' : 'nav-item'} key={path} to={path}>
          <Icon aria-hidden="true" size={21} strokeWidth={2.2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
