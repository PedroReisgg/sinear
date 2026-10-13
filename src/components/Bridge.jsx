import { useNavigate } from 'react-router-dom'
import { ArrowRight } from './Icons.jsx'

export function Bridge({ eyebrow = 'Também no Grupo Sinear', title, cta, to, img, alt }) {
  const navigate = useNavigate()
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="bridge" data-reveal>
          <div className="bridge-copy">
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="h2">{title}</h2>
            <div className="btn-row">
              <a className="btn btn--light" href={`#${to}`} onClick={(e) => { e.preventDefault(); navigate(to) }}>
                {cta} <ArrowRight />
              </a>
            </div>
          </div>
          <div className="bridge-media">
            <img src={img} alt={alt} loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  )
}
