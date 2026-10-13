import { useLocation } from 'react-router-dom'
import { wa, MSG } from '../data.js'
import { frontFromPath } from './Header.jsx'
import { WhatsApp } from './Icons.jsx'

export function WhatsAppFloat() {
  const front = frontFromPath(useLocation().pathname)
  return (
    <a className="whats-float" href={wa(MSG[front] || MSG.grupo)} target="_blank" rel="noreferrer" aria-label="Conversar no WhatsApp">
      <WhatsApp />
      <span className="whats-float-label">Fale no WhatsApp</span>
    </a>
  )
}
