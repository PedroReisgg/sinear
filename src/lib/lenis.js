import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap.js'

let lenis = null

export function initLenis() {
  if (lenis || prefersReducedMotion()) return lenis
  lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 0.95 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export const getLenis = () => lenis

/** Scroll to an element or y position, honouring the fixed header. */
export function scrollToTarget(target, { immediate = false } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  const offset = -96
  if (lenis) {
    lenis.scrollTo(el ?? target, { offset, immediate, duration: 1.2 })
  } else if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY + offset
    window.scrollTo({ top: y, behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' })
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target })
  }
}

export function stopLenis(stop) {
  if (!lenis) return
  if (stop) lenis.stop()
  else lenis.start()
}
