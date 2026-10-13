import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageAnimations } from '../lib/useAnimations.js'
import { scrollToTarget } from '../lib/lenis.js'
import { arServices, arSteps, chillerStory, reasons, gallery, wa, MSG, PHONE_DISPLAY } from '../data.js'
import { ScrollStory } from '../components/ScrollStory.jsx'
import { VRFBuilding } from '../components/VRFBuilding.jsx'
import { Marquee } from '../components/Marquee.jsx'
import { Bridge } from '../components/Bridge.jsx'
import { ContactForm } from '../components/ContactForm.jsx'
import { PhotoGallery } from '../components/Gallery.jsx'
import { HeroVideo } from '../components/HeroVideo.jsx'
import { ArrowRight, WhatsApp } from '../components/Icons.jsx'

const storyAt = [0, 0.1, 0.26, 0.4, 0.55, 0.74]

export function Ar() {
  const ref = useRef(null)
  const navigate = useNavigate()
  usePageAnimations(ref)
  return (
    <div ref={ref}>
      <section id="inicio" className="hero hero--tint">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow" data-hero-item>Sinear Ar-condicionados</p>
            <h1 className="h1" data-split="hero">Instalação, vendas, manutenção e assessoria.</h1>
            <p className="lead" data-hero-item>
              Ar-condicionado e refrigeração com equipe qualificada, transparência no orçamento e a solução na medida do seu investimento. Do split residencial ao chiller de 1 milhão de BTU/h.
            </p>
            <div className="btn-row" data-hero-item>
              <a className="btn" href={wa(MSG.ar)} target="_blank" rel="noreferrer">Pedir orçamento <ArrowRight /></a>
              <button type="button" className="btn btn--ghost" onClick={() => scrollToTarget('#servicos')}>Ver serviços</button>
            </div>
            <div className="hero-facts" data-hero-item>
              <div><b>15+</b><span>anos de mercado</span></div>
              <div><b>12</b><span>marcas atendidas</span></div>
              <div><b>PMOC</b><span>e qualidade do ar</span></div>
            </div>
          </div>
          <div className="hero-media hero-media--tall" data-hero-item style={{ background: '#eef4f8' }}>
            <HeroVideo src="media/chiller-loop.mp4" poster="media/chiller-loop.jpg" label="Chiller industrial a ar com ventiladores girando" />
            <div className="hero-badge"><b>1.000.000</b> BTU/h · role e veja por dentro</div>
          </div>
        </div>
      </section>

      <ScrollStory
        id="por-dentro"
        scene="chiller"
        theme="light"
        variant="card"
        eyebrow="Por dentro de um chiller"
        title="Como funciona um sistema de grande porte."
        steps={chillerStory.map((s, i) => ({ ...s, at: storyAt[i] }))}
        length={620}
        poster="media/ar-explode.jpg"
        posterAlt="Chiller industrial em vista explodida"
        shift={[0.17, 0]}
        mobileShift={[0, -0.25]}
        footer={<a className="btn btn--sm" href={wa('Olá, Sinear! Quero um plano de manutenção para o meu sistema de climatização.')} target="_blank" rel="noreferrer">Quero manutenção para o meu sistema <ArrowRight /></a>}
      />

      <section id="servicos" className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow" data-reveal>Serviços</p>
              <h2 className="h2" data-split="scroll">Quatro frentes, um só atendimento.</h2>
            </div>
            <p className="lead" style={{ maxWidth: '42ch' }} data-reveal>Projetos, instalação, manutenção e PMOC para residências, comércio, hospitais, indústrias e edifícios corporativos.</p>
          </div>
          <div className="cards" style={{ '--cols': 4 }}>
            {arServices.map(([t, d], i) => (
              <article className="card" key={t} data-reveal>
                <span className="card-line" />
                <span className="card-num">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="h3">{t}</h3>
                <p>{d}</p>
                <a className="link-arrow" href={wa(`Olá, Sinear! Quero saber mais sobre ${t.toLowerCase()} de ar-condicionado.`)} target="_blank" rel="noreferrer">Saiba mais <ArrowRight /></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section-head">
            <h2 className="h2" data-split="scroll">Como trabalhamos.</h2>
          </div>
          <div className="steps" style={{ '--cols': 4 }} data-steps>
            {arSteps.map(([t, d], i) => (
              <div className="step" key={t}>
                <span className="step-track"><i /></span>
                <small>Passo {i + 1}</small>
                <h3 className="h3">{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="case" className="section section--dark">
        <div className="container case">
          <div>
            <p className="eyebrow" data-reveal>Estudo de caso</p>
            <h2 className="h2" data-split="scroll">VRF Gree 100 HP.</h2>
            <p className="case-number"><span data-counter="1000000" data-duration="2.4">1.000.000</span><small>BTU/h</small></p>
            <p className="lead" data-reveal>Sistema em operação há 2 anos sem ocorrências técnicas, climatizando 3 andares administrativos com apenas dois tubos de cobre por andar.</p>
            <ul className="case-list" data-reveal>
              <li>Equipamento <b>VRF Gree 100 HP</b></li>
              <li>Capacidade <b>1.000.000 BTU/h</b></li>
              <li>Área atendida <b>3 andares administrativos</b></li>
              <li>Distribuição <b>2 tubos de cobre por andar</b></li>
            </ul>
            <div className="btn-row" data-reveal>
              <a className="btn btn--light" href={wa('Olá, Sinear! Vi o case VRF Gree 100 HP e quero uma solução assim.')} target="_blank" rel="noreferrer">Quero uma solução assim <ArrowRight /></a>
            </div>
          </div>
          <VRFBuilding />
        </div>
      </section>

      <section id="por-que" className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="h2" data-split="scroll">Por que escolher a Sinear.</h2>
              <p className="lead" data-reveal>Motivos para ter a nossa assessoria.</p>
            </div>
          </div>
          <div className="cards" style={{ '--cols': 3 }}>
            {reasons.map(([t, d], i) => (
              <article className="card" key={t} data-reveal>
                <span className="card-line" />
                <span className="card-num">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="h3">{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow" data-reveal>Obras realizadas</p>
              <h2 className="h2" data-split="scroll">Fotos reais dos nossos atendimentos.</h2>
            </div>
            <a className="link-arrow" href="#/galeria" onClick={(e) => { e.preventDefault(); navigate('/galeria') }} data-reveal>Ver galeria completa <ArrowRight /></a>
          </div>
          <div data-reveal>
            <PhotoGallery items={gallery.slice(0, 8)} pageSize={8} />
          </div>
        </div>
      </section>

      <Marquee />

      <div style={{ paddingTop: 'var(--section)' }} />
      <Bridge title="Vai construir ou reformar? Fale com a Sinear Engenharia." cta="Conhecer a Sinear Engenharia" to="/engenharia" img="media/ar-03.jpg" alt="Casa em construção com paredes de tijolo e estrutura do telhado" />

      <section id="contato" className="section section--tint">
        <div className="container contact">
          <div>
            <p className="eyebrow" data-reveal>Contato</p>
            <h2 className="h2" data-split="scroll">Peça seu orçamento.</h2>
            <p className="lead" data-reveal>Conte o que você precisa e retornamos pelo WhatsApp.</p>
            <div className="contact-direct" data-reveal>
              <a className="contact-line" href={wa(MSG.ar)} target="_blank" rel="noreferrer"><WhatsApp /><span>WhatsApp {PHONE_DISPLAY}<small>Atendimento comercial e técnico</small></span></a>
            </div>
          </div>
          <ContactForm
            greeting="Olá, Sinear Ar-condicionados! Gostaria de um orçamento."
            typeLabel="Serviço"
            options={['Instalação', 'Compra de equipamento', 'Manutenção preventiva', 'Manutenção corretiva', 'PMOC', 'Assessoria técnica']}
            submitLabel="Enviar pedido de orçamento"
          />
        </div>
      </section>
    </div>
  )
}
