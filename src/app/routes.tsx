export function PagePreview({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="page-preview">
      <p className="eyebrow">KOREA TRAVEL</p>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <div className="preview-card">
        <span className="preview-sparkle" aria-hidden="true">✦</span>
        <strong>功能正在準備中</strong>
        <span>你的資料會安全地儲存在這台裝置。</span>
      </div>
    </section>
  )
}
