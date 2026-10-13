import { useRef } from 'react'
import { usePageAnimations } from '../lib/useAnimations.js'
import { gallery, wa, MSG } from '../data.js'
import { PhotoGallery } from '../components/Gallery.jsx'
import { ArrowRight, WhatsApp } from '../components/Icons.jsx'

export function Galeria() {
  const ref = useRef(null)
  usePageAnimations(ref)
  return (
    <div ref={ref}>
      <section id="inicio" className="hero hero--dark" style={{ paddingBottom: 'clamp(56px, 7vw, 88px)' }}>
        <div className="blueprint-bg" aria-hidden="true" />
        <div className="container on-dark" style={{ position: 'relative' }}>
          <p className="eyebrow" data-hero-item>Galeria</p>
          <h1 className="h1" data-split="hero">Obras e atendimentos.</h1>
          <p className="lead" data-hero-item>{gallery.length} fotos reais de instalações, manutenções e equipamentos atendidos pela equipe Sinear.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <PhotoGallery items={gallery} />
        </div>
      </section>
      <section id="contato" className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band" data-reveal>
            <div className="blueprint-bg" aria-hidden="true" />
            <div>
              <h2 className="h2" style={{ color: '#fff' }}>Quer um resultado assim no seu projeto?</h2>
              <p className="lead">Fale com a gente e receba uma avaliação técnica.</p>
            </div>
            <div className="cta-actions">
              <a className="btn btn--whats" href={wa(MSG.grupo)} target="_blank" rel="noreferrer"><span className="btn-label"><WhatsApp /> Chamar no WhatsApp</span> <ArrowRight /></a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
