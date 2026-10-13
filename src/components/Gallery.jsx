import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, LayoutGroup } from 'motion/react'
import { stopLenis } from '../lib/lenis.js'
import { ChevronLeft, ChevronRight, Close } from './Icons.jsx'

/** Obras com filtro: itens reposicionam com layout animation e entram com clip-path. */
export function WorksGrid({ items, filters }) {
  const [f, setF] = useState(filters[0])
  const shown = items.filter((it) => f === filters[0] || it.cat === f)
  return (
    <>
      <div className="section-head">
        <h2 className="h2" data-split="scroll">Obras entregues.</h2>
        <div className="filters" role="group" aria-label="Filtrar obras">
          {filters.map((x) => (
            <button key={x} type="button" className="filter-btn" aria-pressed={f === x} onClick={() => setF(x)}>{x}</button>
          ))}
        </div>
      </div>
      <LayoutGroup>
        <motion.div layout className="works">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((it) => (
              <motion.figure
                layout
                key={it.img}
                className="work"
                style={{ margin: 0 }}
                initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
                animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="work-media">
                  <img src={it.img} alt={it.title} loading="lazy" />
                  <span className="work-note">Imagem ilustrativa</span>
                </div>
                <figcaption>
                  <h3>{it.title}</h3>
                  <span>{it.cat}</span>
                </figcaption>
              </motion.figure>
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </>
  )
}

export function PhotoGallery({ items, pageSize = 24 }) {
  const [limit, setLimit] = useState(pageSize)
  const [open, setOpen] = useState(-1)
  const lastFocus = useRef(null)
  const closeBtn = useRef(null)
  const close = useCallback(() => setOpen(-1), [])
  const go = useCallback((d) => setOpen((i) => (i + d + items.length) % items.length), [items.length])

  useEffect(() => {
    if (open < 0) return
    stopLenis(true)
    document.documentElement.style.overflow = 'hidden'
    closeBtn.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'Tab') {
        const nodes = [...document.querySelectorAll('.lightbox button')]
        const i = nodes.indexOf(document.activeElement)
        if (e.shiftKey && i <= 0) { e.preventDefault(); nodes[nodes.length - 1].focus() }
        else if (!e.shiftKey && i === nodes.length - 1) { e.preventDefault(); nodes[0].focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      stopLenis(false)
      document.documentElement.style.overflow = ''
      lastFocus.current?.focus()
    }
  }, [open >= 0, close, go]) // eslint-disable-line react-hooks/exhaustive-deps

  const item = items[open]
  return (
    <>
      <div className="photo-grid">
        {items.slice(0, limit).map((it, i) => (
          <figure key={it.src} style={{ margin: 0 }}>
            <button type="button" className="photo" onClick={(e) => { lastFocus.current = e.currentTarget; setOpen(i) }} aria-label={`Ampliar foto: ${it.caption}`}>
              <img src={it.src} alt={it.caption} loading="lazy" width="400" height="300" />
              <figcaption>{it.caption}</figcaption>
            </button>
          </figure>
        ))}
      </div>
      {limit < items.length && (
        <div className="load-more">
          <button type="button" className="btn btn--ghost" onClick={() => setLimit((l) => l + pageSize)}>
            Carregar mais fotos ({items.length - limit})
          </button>
        </div>
      )}
      {/* Portal: o lightbox sai da seção, senão transform dos pais quebra o position: fixed. */}
      {createPortal(
      <AnimatePresence>
        {item && (
          <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label="Foto ampliada" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && close()}>
            <div className="lightbox-top">
              <span>{String(open + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
              <button ref={closeBtn} type="button" className="icon-btn" onClick={close} aria-label="Fechar"><Close /></button>
            </div>
            <figure className="lightbox-figure" onClick={(e) => e.target === e.currentTarget && close()}>
              <AnimatePresence mode="wait">
                <motion.img key={item.src} src={item.src} alt={item.caption} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />
              </AnimatePresence>
            </figure>
            <p className="lightbox-caption">{item.caption}</p>
            <button type="button" className="icon-btn lightbox-nav lightbox-nav--prev" onClick={() => go(-1)} aria-label="Foto anterior"><ChevronLeft /></button>
            <button type="button" className="icon-btn lightbox-nav lightbox-nav--next" onClick={() => go(1)} aria-label="Próxima foto"><ChevronRight /></button>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </>
  )
}
