import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FRONTS, NAV, CTA, PHONE_DISPLAY, wa, MSG } from '../data.js'
import { scrollToTarget, stopLenis } from '../lib/lenis.js'
import { ArrowUpRight, WhatsApp } from './Icons.jsx'

export function frontFromPath(pathname) {
  if (pathname.startsWith('/ar-condicionados')) return 'ar'
  if (pathname.startsWith('/engenharia')) return 'eng'
  if (pathname.startsWith('/galeria')) return 'galeria'
  return 'grupo'
}

/** Anchor that scrolls smoothly to a section id, or routes when given a path. */
export function NavLink({ to, children, onNavigate, className, ...rest }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  if (to.startsWith('#')) {
    return (
      <a
        href={`#${pathname}`}
        className={className}
        onClick={(e) => {
          e.preventDefault()
          onNavigate?.()
          if (to === '#inicio') scrollToTarget(0)
          else scrollToTarget(to)
        }}
        {...rest}
      >
        {children}
      </a>
    )
  }
  return (
    <Link to={to} className={className} onClick={() => onNavigate?.()} {...rest}>
      {children}
    </Link>
  )
}

/** Seção atual pela posição de rolagem; volta a null quando nenhuma seção cobre a linha de leitura. */
function useActiveSection(ids) {
  const [active, setActive] = useState(null)
  useEffect(() => {
    const update = () => {
      const line = window.innerHeight * 0.4
      let current = null
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (r.top <= line && r.bottom > line) current = id
      }
      setActive(current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [ids.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps
  return active
}

export function Header() {
  const { pathname } = useLocation()
  const front = frontFromPath(pathname)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const nav = NAV[front]
  const [ctaLabel, ctaMsg] = CTA[front]
  const active = useActiveSection(nav.filter(([, to]) => to.startsWith('#')).map(([, to]) => to.slice(1)))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    stopLenis(open)
    document.documentElement.style.overflow = open ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => setOpen(false), [pathname])

  const activeFront = front === 'galeria' ? 'grupo' : front
  const logo = 'assets/logo-grupo-sinear.png'

  return (
    <>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="topbar">
          <div className="container">
            <nav className="fronts" aria-label="Empresas do grupo">
              {FRONTS.map((f) => (
                <Link key={f.key} to={f.to} className={activeFront === f.key ? 'is-active' : ''} aria-current={activeFront === f.key ? 'page' : undefined}>
                  <span className="lbl-long">{f.label}</span><span className="lbl-short">{f.short}</span>
                </Link>
              ))}
            </nav>
            <a className="topbar-phone" href={wa(MSG[activeFront] || MSG.grupo)} target="_blank" rel="noreferrer">
              <WhatsApp /> <span>WhatsApp</span> {PHONE_DISPLAY}
            </a>
          </div>
        </div>
        <div className="navbar">
          <div className="navbar-shell">
            <div className="navbar-row">
              <Link to="/" className="brand" aria-label="Grupo Sinear, página inicial">
                <img src={logo} alt="Grupo Sinear Projetos e Manutenção" width="146" height="49" />
              </Link>
              <nav className="nav" aria-label="Navegação da página">
                {nav.map(([label, to]) => (
                  <NavLink key={label} to={to} className={active && to === `#${active}` ? 'is-active' : ''}>
                    {label}
                  </NavLink>
                ))}
              </nav>
              <div className="header-actions">
                <a className="btn btn--sm header-cta" href={wa(ctaMsg)} target="_blank" rel="noreferrer">
                  <span>{ctaLabel}</span> <ArrowUpRight />
                </a>
                <button
                  type="button"
                  className={`menu-toggle ${open ? 'is-open' : ''}`}
                  aria-expanded={open}
                  aria-controls="menu-mobile"
                  aria-label={open ? 'Fechar menu' : 'Abrir menu'}
                  onClick={() => setOpen((v) => !v)}
                >
                  <span />
                  <span />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div id="menu-mobile" className={`mobile-menu ${open ? 'is-open' : ''}`} aria-hidden={!open} inert={open ? undefined : ''}>
        <nav aria-label="Menu">
          {nav.map(([label, to], i) => (
            <NavLink key={label} to={to} onNavigate={() => setOpen(false)} style={{ '--d': `${80 + i * 55}ms` }}>
              <span>0{i + 1}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mobile-fronts">
          {FRONTS.map((f) => (
            <Link key={f.key} to={f.to} className={activeFront === f.key ? 'is-active' : ''}>
              {f.label}
            </Link>
          ))}
        </div>
        <a className="btn btn--whats" href={wa(ctaMsg)} target="_blank" rel="noreferrer">
          <WhatsApp /> {ctaLabel} pelo WhatsApp
        </a>
      </div>
    </>
  )
}
