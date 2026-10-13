import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { gsap, ScrollTrigger, prefersReducedMotion } from './lib/gsap.js'
import { initLenis, getLenis, scrollToTarget } from './lib/lenis.js'
import { Header, frontFromPath } from './components/Header.jsx'
import { Footer } from './components/Footer.jsx'
import { WhatsAppFloat } from './components/WhatsAppFloat.jsx'
import { CaseCursor } from './components/CaseCursor.jsx'
import { Grupo } from './pages/Grupo.jsx'
import { Ar } from './pages/Ar.jsx'
import { Engenharia } from './pages/Engenharia.jsx'
import { Galeria } from './pages/Galeria.jsx'

const titles = {
  grupo: 'Grupo Sinear | Ar-condicionado e engenharia civil',
  ar: 'Sinear Ar-condicionados | Instalação, vendas, manutenção e PMOC',
  eng: 'Sinear Engenharia | Construção de casas, reformas e ampliações',
  galeria: 'Galeria | Grupo Sinear',
}

export default function App() {
  const location = useLocation()
  const [shown, setShown] = useState(location)
  const curtain = useRef(null)
  const first = useRef(true)

  useEffect(() => { initLenis() }, [])

  // cortina azul entre páginas: cobre, troca a rota no topo e revela
  useEffect(() => {
    if (location.pathname === shown.pathname) {
      if (location.key !== shown.key) setShown(location)
      return
    }
    if (prefersReducedMotion()) {
      setShown(location)
      return
    }
    const el = curtain.current
    gsap.timeline()
      .set(el, { transformOrigin: 'bottom' })
      .to(el, { scaleY: 1, duration: 0.55, ease: 'power4.inOut' })
      .to(el.querySelector('img'), { opacity: 1, duration: 0.25 }, '-=0.2')
      .add(() => setShown(location))
  }, [location]) // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const front = frontFromPath(shown.pathname)
    document.title = titles[front]
    getLenis()?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo(0, 0)
    const target = shown.state?.scrollTo
    ScrollTrigger.refresh()
    if (first.current) {
      first.current = false
      return
    }
    const el = curtain.current
    gsap.timeline({ delay: 0.05 })
      .to(el.querySelector('img'), { opacity: 0, duration: 0.2 })
      .set(el, { transformOrigin: 'top' })
      .to(el, { scaleY: 0, duration: 0.6, ease: 'power4.inOut' })
      .add(() => target && setTimeout(() => scrollToTarget(target), 120))
  }, [shown])

  const front = frontFromPath(shown.pathname)
  return (
    <>
      <a className="skip-link" href="#conteudo" onClick={(e) => { e.preventDefault(); document.getElementById('conteudo')?.focus() }}>Pular para o conteúdo</a>
      <Header />
      <main id="conteudo" tabIndex={-1} style={{ outline: 'none' }}>
        <Routes location={shown}>
          <Route path="/" element={<Grupo />} />
          <Route path="/ar-condicionados" element={<Ar />} />
          <Route path="/engenharia" element={<Engenharia />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer front={front === 'galeria' ? 'grupo' : front} key={front} />
      <WhatsAppFloat />
      <CaseCursor />
      <div className="curtain" ref={curtain} aria-hidden="true"><img src="assets/logo-grupo-sinear-branco.png" alt="" /></div>
    </>
  )
}
