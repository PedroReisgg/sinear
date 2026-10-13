import { useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from './Icons.jsx'

const doors = [
  {
    tag: 'Frente 01', title: 'Sinear Ar-condicionados', to: '/ar-condicionados', img: 'assets/galeria-legado/legado-047.jpg',
    alt: 'Condensadoras de um sistema de grande porte instaladas na cobertura',
    text: 'Instalação, vendas, manutenção e assessoria em ar-condicionado e refrigeração.',
    chips: ['Instalação', 'Vendas', 'Manutenção', 'Assessoria'], cta: 'Entrar em Ar-condicionados',
  },
  {
    tag: 'Frente 02', title: 'Sinear Engenharia', to: '/engenharia', img: 'media/grp-03.jpg',
    alt: 'Estrutura de uma casa em construção sobre a laje, com pilares e vigas',
    text: 'Engenharia civil para construir casas, reformar e ampliar, do projeto à entrega das chaves.',
    chips: ['Construção de casas', 'Reformas', 'Projeto e execução'], cta: 'Entrar em Engenharia',
  },
]

export function Doors() {
  const [hover, setHover] = useState(null)
  const navigate = useNavigate()
  const wide = typeof window !== 'undefined' && window.matchMedia('(min-width: 901px)').matches
  return (
    <div className="doors">
      {doors.map((d, i) => (
        <motion.article
          key={d.to}
          className="door"
          data-reveal
          onHoverStart={() => setHover(i)}
          onHoverEnd={() => setHover(null)}
          animate={wide ? { scale: hover === null ? 1 : hover === i ? 1.015 : 0.975, opacity: hover === null || hover === i ? 1 : 0.72 } : undefined}
          transition={{ type: 'spring', stiffness: 170, damping: 26 }}
        >
          <div className="door-media">
            <img src={d.img} alt={d.alt} loading="lazy" />
          </div>
          <div className="door-body">
            <span className="door-tag">{d.tag}</span>
            <h3 className="h3">{d.title}</h3>
            <p>{d.text}</p>
            <ul className="chips">{d.chips.map((c) => <li key={c}>{c}</li>)}</ul>
            <a className="btn" href={`#${d.to}`} onClick={(e) => { e.preventDefault(); navigate(d.to) }}>
              {d.cta} <ArrowRight />
            </a>
          </div>
        </motion.article>
      ))}
    </div>
  )
}
