import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/gsap.js'

/** Vídeo curto em loop, mudo; pausa fora da tela e respeita redução de movimento. */
export function HeroVideo({ src, poster, label }) {
  const ref = useRef(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (prefersReducedMotion()) {
      v.removeAttribute('autoplay')
      v.pause()
      return
    }
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) v.play().catch(() => {})
      else v.pause()
    })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return (
    <video ref={ref} src={src} poster={poster} muted loop playsInline autoPlay preload="metadata" aria-label={label} />
  )
}
