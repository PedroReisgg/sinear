import { useRef } from 'react'
import { usePageAnimations } from '../lib/useAnimations.js'
import { scrollToTarget } from '../lib/lenis.js'
import { engStory, engServices, engSteps, engWorks, wa, MSG, PHONE_DISPLAY } from '../data.js'
import { ScrollStory } from '../components/ScrollStory.jsx'
import { FloorPlan } from '../components/FloorPlan.jsx'
import { WorksGrid } from '../components/Gallery.jsx'
import { Bridge } from '../components/Bridge.jsx'
import { ContactForm } from '../components/ContactForm.jsx'
import { ArrowRight, WhatsApp } from '../components/Icons.jsx'

export function Engenharia() {
  const ref = useRef(null)
  usePageAnimations(ref)
  const steps = engStory.map(([label, text], i) => ({ label, title: label, text, at: i * 0.2, tag: `Etapa ${i + 1} de 5` }))
  return (
    <div ref={ref}>
      <section id="inicio" className="hero hero--dark">
        <div className="blueprint-bg" aria-hidden="true" />
        <div className="container hero-grid" style={{ position: 'relative' }}>
          <div className="hero-copy on-dark">
            <p className="eyebrow" data-hero-item>Sinear Engenharia</p>
            <h1 className="h1" data-split="hero">Engenharia civil: da planta baixa à casa pronta.</h1>
            <p className="lead" data-hero-item>Construímos casas, reformas e ampliações com projeto, execução e acompanhamento técnico em cada etapa.</p>
            <div className="btn-row" data-hero-item>
              <a className="btn btn--light" href={wa(MSG.eng)} target="_blank" rel="noreferrer">Solicitar projeto <ArrowRight /></a>
              <button type="button" className="btn btn--ghost-dark" onClick={() => scrollToTarget('#como-construimos')}>Ver como construímos</button>
            </div>
          </div>
          <div data-hero-item><FloorPlan /></div>
        </div>
      </section>

      <ScrollStory
        id="como-construimos"
        scene="house"
        theme="dark"
        variant="list"
        eyebrow="Como construímos"
        title="Role e veja a planta virar casa."
        steps={steps}
        length={600}
        poster="media/grp-06.jpg"
        posterAlt="Casa térrea concluída"
        shift={[0.15, 0]}
        mobileShift={[0, -0.2]}
      />

      <section id="servicos" className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow" data-reveal>Serviços</p>
              <h2 className="h2" data-split="scroll">O que a Sinear Engenharia faz.</h2>
            </div>
          </div>
          <div className="cards" style={{ '--cols': 4 }}>
            {engServices.map(([t, d], i) => (
              <article className="card" key={t} data-reveal>
                <span className="card-line" />
                <span className="card-num">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="h3">{t}</h3>
                <p>{d}</p>
                <a className="link-arrow" href={wa(`Olá, Sinear Engenharia! Quero saber mais sobre ${t.toLowerCase()}.`)} target="_blank" rel="noreferrer">Saiba mais <ArrowRight /></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section-head">
            <h2 className="h2" data-split="scroll">Da conversa à chave na mão.</h2>
          </div>
          <div className="steps" style={{ '--cols': 5 }} data-steps>
            {engSteps.map(([t, d], i) => (
              <div className="step" key={t}>
                <span className="step-track"><i /></span>
                <small>Etapa {i + 1}</small>
                <h3 className="h3">{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="obras" className="section">
        <div className="container">
          <WorksGrid items={engWorks} filters={['Todas', 'Casas', 'Reformas', 'Ampliações']} />
        </div>
      </section>

      <section className="section section--dark" style={{ paddingBlock: 'clamp(64px, 8vw, 104px)' }}>
        <div className="blueprint-bg" aria-hidden="true" />
        <div className="container" style={{ position: 'relative' }}>
          <div className="stats stats--dark" style={{ margin: 0 }} data-reveal>
            <div className="stat"><b data-counter="15" data-suffix="+">15+</b><span>anos de mercado no Grupo</span></div>
            <div className="stat"><b data-counter="5">5</b><span>etapas acompanhadas por engenheiro</span></div>
            <div className="stat"><b data-counter="1">1</b><span>só time do projeto à entrega</span></div>
          </div>
        </div>
      </section>

      <div style={{ paddingTop: 'var(--section)' }} />
      <Bridge title="Obra pronta pede conforto. Fale com a Sinear Ar-condicionados." cta="Conhecer a Sinear Ar-condicionados" to="/ar-condicionados" img="assets/galeria-legado/legado-033.jpg" alt="Sala de estar ampla e clara em residência climatizada" />

      <section id="contato" className="section section--tint">
        <div className="container contact">
          <div>
            <p className="eyebrow" data-reveal>Contato</p>
            <h2 className="h2" data-split="scroll">Vamos tirar sua obra do papel.</h2>
            <p className="lead" data-reveal>Conte o que você quer construir e retornamos pelo WhatsApp.</p>
            <div className="contact-direct" data-reveal>
              <a className="contact-line" href={wa(MSG.eng)} target="_blank" rel="noreferrer"><WhatsApp /><span>WhatsApp {PHONE_DISPLAY}<small>Fale direto com a engenharia</small></span></a>
            </div>
          </div>
          <ContactForm
            greeting="Olá, Sinear Engenharia! Gostaria de solicitar um projeto."
            typeLabel="Tipo de obra"
            options={['Construção de casa', 'Reforma', 'Ampliação', 'Projeto técnico', 'Acompanhamento de obra']}
            submitLabel="Enviar pedido de projeto"
          />
        </div>
      </section>
    </div>
  )
}
