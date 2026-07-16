import { Link } from '@tanstack/react-router'
import './SiteHeader.css'

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link to="/" className="site-header-brand" aria-label="Tashikani home">
        <img className="site-header-mascot" src="/favicon.svg" alt="Tashikani mascot" />
        <span className="site-header-wordmark">Tashikani</span>
      </Link>
    </header>
  )
}
