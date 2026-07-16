import { Link } from '@tanstack/react-router'
import './SiteHeader.css'

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link to="/" className="site-header-brand" aria-label="Tashikame home">
        <img className="site-header-mascot" src="/favicon.svg" alt="Tashikame mascot" />
        <span className="site-header-wordmark">Tashikame</span>
      </Link>
    </header>
  )
}
