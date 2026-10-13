import { useState } from 'react'
import { wa } from '../data.js'
import { WhatsApp } from './Icons.jsx'

const MAX_MSG = 500

/** Monta a mensagem e abre o WhatsApp; nada é enviado a servidor. */
export function ContactForm({ greeting, typeLabel, options, submitLabel }) {
  const [form, setForm] = useState({ nome: '', whats: '', tipo: options[0], msg: '' })
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [fallback, setFallback] = useState('')
  const digits = form.whats.replace(/\D/g, '').length
  const errors = {
    nome: form.nome.trim().length < 2 ? 'Escreva seu nome para a gente te chamar.' : '',
    whats: digits < 10 ? 'Use o DDD + número, ex.: (11) 90000-0000.' : '',
  }
  const show = (k) => (touched[k] || submitted) && errors[k]
  const ok = (k) => (touched[k] || submitted) && !errors[k]

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }))
  const pick = (o) => setForm((f) => ({ ...f, tipo: o }))
  const maskPhone = (e) => {
    const d = e.target.value.replace(/\D/g, '').slice(0, 11)
    const v = d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d
    setForm((f) => ({ ...f, whats: v }))
  }

  const nome = form.nome.trim()
  const detalhe = form.msg.trim()
  // Texto em frases curtas, para o dono da Sinear ler sem precisar decifrar.
  const text = [
    greeting,
    '',
    `Meu nome é ${nome || '[seu nome]'} e tenho interesse em: ${form.tipo}.`,
    `Para retorno, meu WhatsApp é ${form.whats || '[seu número]'}.`,
    detalhe ? `\nDetalhes: ${detalhe}` : null,
  ].filter((l) => l !== null).join('\n')

  const submit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    if (errors.nome || errors.whats) return
    // Se o navegador bloquear a nova aba, mostra um link direto para o WhatsApp.
    const w = window.open(wa(text), '_blank')
    if (w) {
      w.opener = null
      setFallback('')
    } else setFallback(wa(text))
  }

  const ready = !errors.nome && !errors.whats
  const filled = (!errors.nome ? 1 : 0) + (!errors.whats ? 1 : 0)

  return (
    <form className="form" onSubmit={submit} noValidate data-reveal>
      <div className="form-progress" aria-hidden="true">
        <span style={{ width: `${(filled / 2) * 100}%` }} />
      </div>
      <p className="form-step">{ready ? 'Tudo certo, pode enviar.' : 'Falta preencher seus dados de contato.'}</p>

      <div className="field">
        <label htmlFor="f-nome">Seu nome</label>
        <input
          id="f-nome"
          autoComplete="name"
          placeholder="Como podemos te chamar?"
          value={form.nome}
          onChange={set('nome')}
          onBlur={blur('nome')}
          aria-invalid={!!show('nome')}
          aria-describedby={show('nome') ? 'e-nome' : undefined}
          data-valid={ok('nome') || undefined}
        />
        {show('nome') && <span className="field-error" id="e-nome">{errors.nome}</span>}
      </div>

      <div className="field">
        <label htmlFor="f-whats">WhatsApp com DDD</label>
        <input
          id="f-whats"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="(11) 90000-0000"
          value={form.whats}
          onChange={maskPhone}
          onBlur={blur('whats')}
          aria-invalid={!!show('whats')}
          aria-describedby={show('whats') ? 'e-whats' : undefined}
          data-valid={ok('whats') || undefined}
        />
        {show('whats') && <span className="field-error" id="e-whats">{errors.whats}</span>}
      </div>

      <fieldset className="field field--full chips">
        <legend>{typeLabel}</legend>
        <div className="chip-group">
          {options.map((o) => (
            <button
              key={o}
              type="button"
              className="chip"
              aria-pressed={form.tipo === o}
              onClick={() => pick(o)}
            >
              {o}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="field field--full">
        <label htmlFor="f-msg">Conte mais (opcional)</label>
        <textarea
          id="f-msg"
          maxLength={MAX_MSG}
          placeholder="Ex.: tipo de imóvel, metragem, quantos aparelhos, prazo desejado"
          value={form.msg}
          onChange={set('msg')}
        />
        <span className="field-count">{form.msg.length}/{MAX_MSG}</span>
      </div>

      <div className="field field--full preview">
        <span className="preview-label">Sua mensagem no WhatsApp</span>
        <p>{text}</p>
      </div>

      <button className="btn btn--whats field--full" type="submit">
        <WhatsApp /> {submitLabel}
      </button>
      {fallback && (
        <p className="form-fallback field--full" role="status">
          Mensagem pronta. <a href={fallback} target="_blank" rel="noreferrer">Toque aqui para abrir o WhatsApp</a>.
        </p>
      )}
      <p className="form-note field--full">Ao enviar, o WhatsApp abre com essa mensagem pronta para você revisar. Nenhum dado fica salvo no site.</p>
    </form>
  )
}
