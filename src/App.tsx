import './App.css'

const navigation = [
  { label: '行程', icon: '⌂' },
  { label: '記帳', icon: '₩' },
  { label: '購物', icon: '□' },
  { label: '準備', icon: '✓' },
  { label: '設置', icon: '⚙' },
]

function App() {
  return (
    <main className="app-shell">
      <section className="app-placeholder" aria-label="旅遊 App">
        <p className="eyebrow">KOREA TRAVEL</p>
        <h1>準備好出發了嗎？</h1>
        <p>你的旅程、預算與行李清單都會在這裡。</p>
      </section>
      <nav className="bottom-nav" aria-label="主要功能">
        {navigation.map((item, index) => (
          <button className={index === 0 ? 'nav-item is-active' : 'nav-item'} key={item.label} type="button">
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </main>
  )
}

export default App
