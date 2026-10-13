import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageAnimations } from '../lib/useAnimations.js'
import { scrollToTarget } from '../lib/lenis.js'
import { reasons, wa, MSG } from '../data.js'
import { Doors } from '../components/Doors.jsx'
import { Marquee } from '../components/Marquee.jsx'
import { ArrowRight, WhatsApp } from '../components/Icons.jsx'
import { HeroVideo } from '../components/HeroVideo.jsx'

export function Grupo() {
  const ref = useRef(null)
  const navigate = useNavigate()
  usePageAnimations(ref)
  return (
    <div ref={ref}>
      <section id="inicio" className="hero hero--dark">
        <div className="blueprint-bg" aria-hidden="true" />
        <div className="container hero-grid" style={{ position: 'relative' }}>
          <div className="hero-copy on-dark">
            <p className="eyebrow" data-hero-item>Grupo Sinear · Projetos e Manutenção</p>
            <h1 className="display" data-split="hero">Do ar&#8209;condicionado à obra completa.</h1>
            <p className="lead" data-hero-item>
              O Grupo Sinear reúne climatização e engenharia civil em um só time: projeto, execução e manutenção, com mais de 15 anos de mercado.
            </p>
            <div className="btn-row" data-hero-item>
              <button type="button" className="btn btn--light" onClick={() => scrollToTarget('#frentes')}>
                Conhecer as duas frentes <ArrowRight />
              </button>
              <a className="btn btn--ghost-dark" href={wa(MSG.grupo)} target="_blank" rel="noreferrer">
                <WhatsApp /> Falar no WhatsApp
              </a>
            </div>
          </div>
          <div className="hero-media" data-hero-item>
            <HeroVideo src="media/house-loop.mp4" poster="media/house-loop.jpg" label="Casa térrea concluída ao entardecer, com jardim" />
            <div className="hero-inset">
              <HeroVideo src="media/chiller-loop.mp4" poster="media/chiller-loop.jpg" label="Chiller industrial com ventiladores em funcionamento" />
            </div>
            <div className="hero-badge"><b>2</b> frentes, 1 só time</div>
          </div>
        </div>
      </section>

      <section id="frentes" className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow" data-reveal>Nossas frentes</p>
              <h2 className="h2" data-split="scroll">Escolha por onde começar.</h2>
              <p className="lead" data-reveal>Duas empresas do grupo, o mesmo padrão de atendimento. Cada uma tem a sua página e as duas se conversam.</p>
            </div>
          </div>
          <Doors />
        </div>
      </section>

      <section id="quem-somos" className="section section--tint">
        <div className="container about">
          <div className="about-media" data-clip>
            <img src="assets/tecnico-sinear-equipe.png" alt="Técnico da Sinear com uniforme e equipamento de segurança em campo" data-parallax="14" loading="lazy" />
            <p className="about-tag">Equipe própria, uniformizada e com EPI em todos os atendimentos.</p>
          </div>
          <div>
            <p className="eyebrow" data-reveal>Quem somos</p>
            <h2 className="h2" data-split="scroll">Mais de 15 anos resolvendo, não complicando.</h2>
            <p className="lead" data-reveal>
              Uma equipe de profissionais qualificados e flexíveis, com foco na solução, e soluções e custos na medida da necessidade e da capacidade de investimento de cada cliente.
            </p>
            <div className="stats" data-reveal>
              <div className="stat"><b data-counter="15" data-suffix="+">15+</b><span>anos de mercado</span></div>
              <div className="stat"><b data-counter="12">12</b><span>marcas que instalamos e mantemos</span></div>
              <div className="stat"><b>24/7</b><span>suporte para contratos de manutenção</span></div>
            </div>
            <a className="link-arrow" href="#/galeria" onClick={(e) => { e.preventDefault(); navigate('/galeria') }} data-reveal>
              Ver obras e atendimentos <ArrowRight />
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="h2" data-split="scroll">Por que escolher o Grupo Sinear.</h2>
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

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <h2 className="h2" data-split="scroll">Um destaque de cada frente.</h2>
          </div>
          <div className="highlights">
            <a className="highlight" href="#/ar-condicionados" data-cursor="Ver case" onClick={(e) => { e.preventDefault(); navigate('/ar-condicionados', { state: { scrollTo: '#case' } }) }} data-reveal>
              <div className="highlight-media"><img src="assets/galeria-legado/legado-067.jpg" alt="Condensadoras e tubulação de cobre organizadas na cobertura" data-parallax="12" loading="lazy" /></div>
              <p className="highlight-tag">Ar-condicionados · Case</p>
              <h3 className="h3">VRF Gree 100 HP: 1 milhão de BTU/h em 3 andares</h3>
              <span className="link-arrow">Ver o case completo <ArrowRight /></span>
            </a>
            <a className="highlight" href="#/engenharia" data-cursor="Ver obra" onClick={(e) => { e.preventDefault(); navigate('/engenharia', { state: { scrollTo: '#como-construimos' } }) }} data-reveal>
              <div className="highlight-media"><img src="media/grp-06.jpg" alt="Casa térrea concluída ao entardecer, com jardim recém-entregue" data-parallax="12" loading="lazy" /></div>
              <p className="highlight-tag">Engenharia · Obra</p>
              <h3 className="h3">Casa térrea: da planta baixa à entrega das chaves</h3>
              <span className="link-arrow">Ver a obra completa <ArrowRight /></span>
            </a>
          </div>
        </div>
      </section>

      <Marquee />

      <section id="contato" className="section">
        <div className="container">
          <div className="cta-band" data-reveal>
            <div className="blueprint-bg" aria-hidden="true" />
            <div>
              <h2 className="h2" style={{ color: '#fff' }}>Vamos conversar sobre o seu projeto?</h2>
              <p className="lead">Conte o que você precisa. Dizemos qual frente do grupo atende melhor e retornamos pelo WhatsApp.</p>
            </div>
            <div className="cta-actions">
              <a className="btn btn--whats" href={wa(MSG.grupo)} target="_blank" rel="noreferrer"><span className="btn-label"><WhatsApp /> Chamar no WhatsApp: 11 98541-3047</span> <ArrowRight /></a>
              <a className="btn btn--ghost-dark" href={wa('Olá, Grupo Sinear! Preciso de ar-condicionado.')} target="_blank" rel="noreferrer">Preciso de ar-condicionado <ArrowRight /></a>
              <a className="btn btn--ghost-dark" href={wa('Olá, Grupo Sinear! Preciso de engenharia civil.')} target="_blank" rel="noreferrer">Preciso de engenharia <ArrowRight /></a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
