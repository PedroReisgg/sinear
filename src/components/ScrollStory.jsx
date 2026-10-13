import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ScrollTrigger, prefersReducedMotion } from '../lib/gsap.js'
import { Scroll } from './Icons.jsx'

const loaders = {
  house: () => import('../three/HouseScene.js').then((m) => m.HouseScene),
  chiller: () => import('../three/ChillerScene.js').then((m) => m.ChillerScene),
}

function useIsMobile() {
  const q = '(max-width: 900px)'
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return m
}

/**
 * Pinned, scroll-scrubbed 3D story. Scroll progress drives the scene's timeline and the
 * active step on the side; steps[i].at is the progress where step i starts.
 */
export function ScrollStory({ id, scene, theme = 'dark', eyebrow, title, steps, length = 500, variant = 'list', poster, posterAlt, footer, shift = [0.16, 0], mobileShift = [0, -0.17] }) {
  const sectionRef = useRef(null)
  const pinRef = useRef(null)
  const canvasRef = useRef(null)
  const barRef = useRef(null)
  const sceneRef = useRef(null)
  const progressRef = useRef(0)
  const [active, setActive] = useState(0)
  const [reduce] = useState(prefersReducedMotion)
  const mobile = useIsMobile()

  // build the WebGL scene lazily, once the section approaches the viewport
  useEffect(() => {
    if (reduce) return
    let disposed = false
    let io
    const el = sectionRef.current
    const boot = async () => {
      const Cls = await loaders[scene]()
      if (disposed || sceneRef.current) return
      try {
        const sc = new Cls(canvasRef.current)
        sceneRef.current = sc
        sc.setShift(...(window.matchMedia('(max-width: 900px)').matches ? mobileShift : shift))
        sc.setProgress(progressRef.current, true)
        sc.renderOnce()
        io = new IntersectionObserver(([en]) => (en.isIntersecting ? sc.start() : sc.stop()), { rootMargin: '10% 0px' })
        io.observe(el)
      } catch (err) {
        console.warn('WebGL indisponível, exibindo imagem estática.', err)
        el.classList.add('story--fallback')
      }
    }
    const pre = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) {
        pre.disconnect()
        boot()
      }
    }, { rootMargin: '120% 0px' })
    pre.observe(el)
    return () => {
      disposed = true
      pre.disconnect()
      io?.disconnect()
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [scene, reduce]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    sceneRef.current?.setShift(...(mobile ? mobileShift : shift))
  }, [mobile]) // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (reduce) return
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      pin: pinRef.current,
      start: 'top top',
      end: () => `+=${(window.innerHeight * length) / 100}`,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress
        progressRef.current = p
        sceneRef.current?.setProgress(p)
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
        let idx = 0
        steps.forEach((s, i) => { if (p >= s.at) idx = i })
        setActive((cur) => (cur === idx ? cur : idx))
      },
    })
    return () => st.kill()
  }, [length, reduce]) // eslint-disable-line react-hooks/exhaustive-deps

  const step = steps[active]

  if (reduce) {
    return (
      <section id={id} className={`section story-static story--${theme}`}>
        <div className="container">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="h2">{title}</h2>
          {poster && <img src={poster} alt={posterAlt} style={{ borderRadius: 10, margin: '32px 0' }} />}
          <ol className="story-static-list">
            {steps.map((s, i) => (
              <li key={i}><b>{s.title}</b> {s.text}</li>
            ))}
          </ol>
          {footer}
        </div>
      </section>
    )
  }

  return (
    <section id={id} ref={sectionRef} className={`story story--${theme}`} aria-label={title}>
      <div className="story-pin" ref={pinRef}>
        <div className="story-canvas">
          <canvas ref={canvasRef} aria-hidden="true" />
          {poster && <img className="story-poster" src={poster} alt="" aria-hidden="true" />}
        </div>
        <div className="story-ui">
          <div className="container">
            <div className={`story-panel ${variant === 'card' ? 'story-panel--card' : ''}`}>
              <div className="story-head">
                <p className="eyebrow">{eyebrow}</p>
                <h2 className="h2">{title}</h2>
              </div>
              {variant === 'list' && (
                <ol className="story-list">
                  {steps.map((s, i) => (
                    <li key={i} className={i === active ? 'is-active' : i < active ? 'is-done' : ''}>
                      <span>{String(i + 1).padStart(2, '0')}</span>
                      {s.label}
                    </li>
                  ))}
                </ol>
              )}
              <div className="story-caption" aria-live="polite">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={active}
                    className="story-caption-inner"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] } }}
                    exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                  >
                    {step.tag && <span className="story-tag">{step.tag}</span>}
                    <b>{step.title}</b>
                    <p>{step.text}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              {variant === 'card' && (
                <div className="story-steps-mini" aria-hidden="true">
                  {steps.map((_, i) => (
                    <i key={i}><b style={{ transform: `scaleX(${i <= active ? 1 : 0})` }} /></i>
                  ))}
                </div>
              )}
              {footer && <div className="story-cta">{footer}</div>}
            </div>
          </div>
        </div>
        <p className="story-hint" aria-hidden="true"><Scroll /> Role para avançar</p>
        <div className="story-progress" aria-hidden="true"><i ref={barRef} /></div>
      </div>
    </section>
  )
}
