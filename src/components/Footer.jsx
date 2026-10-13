import { Link } from 'react-router-dom'
import { NavLink } from './Header.jsx'
import { PHONE_DISPLAY, SOCIAL, wa, MSG } from '../data.js'

const cols = {
  grupo: [
    ['Grupo', [['Início', '#inicio'], ['Quem somos', '#quem-somos'], ['Galeria', '/galeria'], ['Contato', '#contato']]],
    ['Ar-condicionados', [['Instalação', '/ar-condicionados'], ['Vendas', '/ar-condicionados'], ['Manutenção', '/ar-condicionados'], ['Assessoria', '/ar-condicionados']]],
    ['Engenharia', [['Construção de casas', '/engenharia'], ['Reformas e ampliações', '/engenharia'], ['Projeto e execução', '/engenharia']]],
  ],
  ar: [
    ['Grupo', [['Grupo Sinear', '/'], ['Sinear Engenharia', '/engenharia'], ['Galeria', '/galeria']]],
    ['Ar-condicionados', [['Por dentro de um chiller', '#por-dentro'], ['Serviços', '#servicos'], ['Case VRF', '#case'], ['Orçamento', '#contato']]],
  ],
  eng: [
    ['Grupo', [['Grupo Sinear', '/'], ['Sinear Ar-condicionados', '/ar-condicionados'], ['Galeria', '/galeria']]],
    ['Engenharia', [['Como construímos', '#como-construimos'], ['Serviços', '#servicos'], ['Obras', '#obras'], ['Solicitar projeto', '#contato']]],
  ],
}

export function Footer({ front = 'grupo' }) {
  const groups = cols[front] || cols.grupo
  const msg = MSG[front] || MSG.grupo
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid" style={{ gridTemplateColumns: undefined }}>
          <div className="footer-brand">
            <Link to="/" aria-label="Grupo Sinear, página inicial">
              <img src="assets/logo-grupo-sinear-branco.png" alt="Grupo Sinear Projetos e Manutenção" width="220" height="74" loading="lazy" />
            </Link>
            <p>Projetos e manutenção em climatização e engenharia civil. Mais de 15 anos de mercado em São Paulo.</p>
          </div>
          {groups.map(([title, links]) => (
            <div key={title}>
              <h4>{title}</h4>
              <ul>
                {links.map(([label, to]) => (
                  <li key={label}><NavLink to={to}>{label}</NavLink></li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4>Contato</h4>
            <ul>
              <li><a href={wa(msg)} target="_blank" rel="noreferrer">WhatsApp {PHONE_DISPLAY}</a></li>
              <li><a href={`tel:+55${PHONE_DISPLAY.replace(/\D/g, '')}`}>Ligar (11) 98541-3047</a></li>
              {SOCIAL.youtube && <li><a href={SOCIAL.youtube} target="_blank" rel="noreferrer">YouTube</a></li>}
              {SOCIAL.facebook && <li><a href={SOCIAL.facebook} target="_blank" rel="noreferrer">Facebook</a></li>}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Grupo Sinear. Todos os direitos reservados.</span>
          <span>Sinear Projetos e Manutenção · São Paulo, SP</span>
        </div>
      </div>
    </footer>
  )
}
