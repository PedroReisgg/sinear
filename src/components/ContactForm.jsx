import { useState } from 'react'
import { wa } from '../data.js'
import { WhatsApp } from './Icons.jsx'

/** Monta a mensagem e abre o WhatsApp; nada é enviado a servidor. */
export function ContactForm({ greeting, typeLabel, options, submitLabel }) {
  const [form, setForm] = useState({ nome: '', whats: '', tipo: options[0], msg: '' })
  const [touched, setTouched] = useState({})
  const [fallback, setFallback] = useState('')
  const errors = {
    nome: form.nome.trim().length < 2 ? 'Informe seu nome.' : '',
    whats: form.whats.replace(/\D/g, '').length < 10 ? 'Informe um WhatsApp com DDD.' : '',
  }
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }))
  const maskPhone = (e) => {
    const d = e.target.value.replace(/\D/g, '').slice(0, 11)
    const v = d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d
    setForm((f) => ({ ...f, whats: v }))
  }
  const submit = (e) => {
    e.preventDefault()
    setTouched({ nome: true, whats: true })
    if (errors.nome || errors.whats) return
    const text = [
      greeting,
      '',
      `Nome: ${form.nome.trim()}`,
      `WhatsApp: ${form.whats}`,
      `${typeLabel}: ${form.tipo}`,
      form.msg.trim() ? `Mensagem: ${form.msg.trim()}` : null,
    ].filter((l) => l !== null).join('\n')
    // Se o navegador bloquear a nova aba, mostra um link direto para o WhatsApp.
    const w = window.open(wa(text), '_blank')
    if (w) {
      w.opener = null
      setFallback('')
    } else setFallback(wa(text))
  }
  const err = (k) => touched[k] && errors[k]
  return (
    <form className="form" onSubmit={submit} noValidate data-reveal>
      <div className="field">
        <label htmlFor="f-nome">Nome</label>
        <input id="f-nome" autoComplete="name" value={form.nome} onChange={set('nome')} onBlur={blur('nome')} aria-invalid={!!err('nome')} aria-describedby={err('nome') ? 'e-nome' : undefined} />
        {err('nome') && <span className="field-error" id="e-nome">{errors.nome}</span>}
      </div>
      <div className="field">
        <label htmlFor="f-whats">WhatsApp</label>
        <input id="f-whats" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(11) 90000-0000" value={form.whats} onChange={maskPhone} onBlur={blur('whats')} aria-invalid={!!err('whats')} aria-describedby={err('whats') ? 'e-whats' : undefined} />
        {err('whats') && <span className="field-error" id="e-whats">{errors.whats}</span>}
      </div>
      <div className="field field--full">
        <label htmlFor="f-tipo">{typeLabel}</label>
        <select id="f-tipo" value={form.tipo} onChange={set('tipo')}>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="field field--full">
        <label htmlFor="f-msg">Mensagem (opcional)</label>
        <textarea id="f-msg" value={form.msg} onChange={set('msg')} />
      </div>
      <button className="btn btn--whats" type="submit"><WhatsApp /> {submitLabel}</button>
      {fallback && (
        <p className="form-fallback" role="status">
          Mensagem pronta. <a href={fallback} target="_blank" rel="noreferrer">Toque aqui para abrir o WhatsApp</a>.
        </p>
      )}
      <p className="form-note">Ao enviar, o WhatsApp abre com a mensagem pronta para você revisar. Nenhum dado fica salvo no site.</p>
    </form>
  )
}
