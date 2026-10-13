import { useLayoutEffect } from 'react'
import { gsap, ScrollTrigger, SplitText, prefersReducedMotion } from './gsap.js'

/**
 * Declarative scroll animations for a page. Markup opts in with data attributes:
 *   data-split="hero" | "scroll"   title split by line, rising behind a mask
 *   data-reveal[="fade"]           fade/slide in when entering the viewport (batched, staggered)
 *   data-clip                      image revealed with clip-path
 *   data-parallax="12"             inner image drifts yPercent while scrolling
 *   data-counter="15" data-suffix="+" data-prefix=""   number counts up
 *   data-steps                     container whose .step-track i lines draw in sequence
 */
export function usePageAnimations(scopeRef, deps = []) {
  useLayoutEffect(() => {
    const scope = scopeRef.current
    if (!scope) return
    const reduce = prefersReducedMotion()
    const ctx = gsap.context(() => {
      // titles
      scope.querySelectorAll('[data-split]').forEach((el) => {
        if (reduce) return
        const isHero = el.dataset.split === 'hero'
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'split-line',
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.lines, {
              yPercent: 110,
              duration: isHero ? 1.15 : 1,
              stagger: 0.09,
              ease: 'power4.out',
              delay: isHero ? 0.25 : 0,
              scrollTrigger: isHero ? undefined : { trigger: el, start: 'top 86%', once: true },
            })
          },
        })
      })

      // hero support copy
      const heroItems = scope.querySelectorAll('[data-hero-item]')
      if (heroItems.length && !reduce) {
        gsap.from(heroItems, { y: 22, opacity: 0, duration: 0.9, stagger: 0.1, delay: 0.65 })
      }

      // generic reveals
      const reveals = gsap.utils.toArray(scope.querySelectorAll('[data-reveal]'))
      if (reduce) gsap.set(reveals, { opacity: 1, y: 0 })
      else {
        ScrollTrigger.batch(reveals, {
          start: 'top 88%',
          once: true,
          onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, stagger: 0.09, overwrite: true }),
        })
      }

      // clip reveals
      scope.querySelectorAll('[data-clip]').forEach((el) => {
        if (reduce) return gsap.set(el, { clipPath: 'none' })
        gsap.to(el, {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.25,
          ease: 'power4.inOut',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
      })

      // parallax
      if (!reduce) {
        scope.querySelectorAll('[data-parallax]').forEach((el) => {
          const amt = parseFloat(el.dataset.parallax || '10')
          gsap.fromTo(el, { yPercent: -amt / 2 }, {
            yPercent: amt / 2,
            ease: 'none',
            scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
          })
        })
      }

      // counters
      scope.querySelectorAll('[data-counter]').forEach((el) => {
        const end = parseFloat(el.dataset.counter)
        const prefix = el.dataset.prefix || ''
        const suffix = el.dataset.suffix || ''
        const fmt = (v) => prefix + Math.round(v).toLocaleString('pt-BR') + suffix
        if (reduce) {
          el.textContent = fmt(end)
          return
        }
        const obj = { v: 0 }
        el.textContent = fmt(0)
        gsap.to(obj, {
          v: end,
          duration: parseFloat(el.dataset.duration || '1.8'),
          ease: 'power2.out',
          onUpdate: () => (el.textContent = fmt(obj.v)),
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        })
      })

      // step lines
      scope.querySelectorAll('[data-steps]').forEach((wrap) => {
        const lines = wrap.querySelectorAll('.step-track i')
        const items = wrap.querySelectorAll('.step')
        if (reduce) {
          gsap.set(lines, { scaleX: 1 })
          return
        }
        const tl = gsap.timeline({ scrollTrigger: { trigger: wrap, start: 'top 80%', once: true } })
        items.forEach((item, i) => {
          tl.from(item.querySelectorAll('small, .h3, p'), { y: 16, opacity: 0, duration: 0.6, stagger: 0.06 }, i * 0.22)
          tl.to(lines[i], { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, i * 0.22)
        })
      })
    }, scope)

    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    const t = setTimeout(refresh, 400)
    return () => {
      clearTimeout(t)
      window.removeEventListener('load', refresh)
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
