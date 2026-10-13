import { useLayoutEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap.js'
import { partners } from '../data.js'

export function Marquee({ title = 'Marcas com as quais trabalhamos' }) {
  const track = useRef(null)
  useLayoutEffect(() => {
    const el = track.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const tween = gsap.to(el, { xPercent: -50, duration: 42, ease: 'none', repeat: -1 })
      const slow = () => gsap.to(tween, { timeScale: 0.25, duration: 0.6 })
      const fast = () => gsap.to(tween, { timeScale: 1, duration: 0.6 })
      el.addEventListener('mouseenter', slow)
      el.addEventListener('mouseleave', fast)
      return () => {
        el.removeEventListener('mouseenter', slow)
        el.removeEventListener('mouseleave', fast)
      }
    })
    return () => ctx.revert()
  }, [])
  const items = [...partners, ...partners]
  return (
    <section className="marquee-wrap" aria-label={title}>
      <p className="marquee-title">{title}</p>
      <div className="marquee">
        <div className="marquee-track" ref={track}>
          {items.map(([name, file], i) => (
            <div className="brand-tile" key={i} aria-hidden={i >= partners.length ? true : undefined}>
              <img src={`assets/${file}`} alt={i < partners.length ? name : ''} loading="lazy" width="120" height="44" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
