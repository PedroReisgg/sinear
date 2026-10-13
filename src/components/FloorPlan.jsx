import { useLayoutEffect, useMemo, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap.js'
import { WALLS, ROOMS } from '../lib/plan.js'

const S = 44
const OX = 60
const OY = 44
const px = (x) => OX + (x + 6) * S
const py = (z) => OY + (z + 4.5) * S

/** Planta baixa em SVG cujas linhas se desenham no carregamento (ENG-01). */
export function FloorPlan() {
  const ref = useRef(null)
  const { walls, windows, doors } = useMemo(() => {
    const walls = []
    const windows = []
    const doors = []
    WALLS.forEach((w) => {
      const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1])
      const d = [(w.b[0] - w.a[0]) / len, (w.b[1] - w.a[1]) / len]
      const n = [-d[1], d[0]]
      const at = (t) => [w.a[0] + d[0] * t, w.a[1] + d[1] * t]
      const opens = [...w.open].sort((a, b) => a.t - b.t)
      let cur = 0
      const stretch = (t0, t1) => {
        if (t1 - t0 < 0.01) return
        const [x0, z0] = at(t0)
        const [x1, z1] = at(t1)
        walls.push({ d: `M${px(x0)} ${py(z0)}L${px(x1)} ${py(z1)}`, ext: w.ext })
      }
      opens.forEach((o) => {
        stretch(cur, o.t - o.w / 2)
        cur = o.t + o.w / 2
        const [x0, z0] = at(o.t - o.w / 2)
        const [x1, z1] = at(o.t + o.w / 2)
        if (o.kind === 'window') windows.push(`M${px(x0)} ${py(z0)}L${px(x1)} ${py(z1)}`)
        if (o.kind === 'door') {
          const r = o.w * S
          const hx = px(x0)
          const hy = py(z0)
          const ex = hx + n[0] * o.swing * r
          const ey = hy + n[1] * o.swing * r
          doors.push(`M${hx} ${hy}L${ex} ${ey}A${r} ${r} 0 0 ${o.swing > 0 ? 0 : 1} ${px(x1)} ${py(z1)}`)
        }
      })
      stretch(cur, len)
    })
    return { walls, windows, doors }
  }, [])

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 })
      tl.from('.fp-wall', { drawSVG: '0%', duration: 1.1, stagger: 0.035, ease: 'power2.inOut' })
        .from('.fp-window', { drawSVG: '50% 50%', duration: 0.6, stagger: 0.04 }, '-=0.5')
        .from('.fp-door', { drawSVG: '0%', duration: 0.8, stagger: 0.08, ease: 'power2.out' }, '-=0.4')
        .from('.fp-dim', { drawSVG: '50% 50%', opacity: 0, duration: 0.7 }, '-=0.6')
        .from('.fp-label', { opacity: 0, y: 6, duration: 0.6, stagger: 0.06 }, '-=0.5')
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <div className="plan-figure" ref={ref}>
      <div className="bp-grid" aria-hidden="true" />
      <svg viewBox="0 0 650 500" role="img" aria-label="Planta baixa de uma casa térrea com sala, cozinha, dois quartos e banheiro">
        <g fill="none" strokeLinecap="square">
          {walls.map((w, i) => (
            <path key={i} className="fp-wall" d={w.d} stroke="#8fc0dc" strokeWidth={w.ext ? 7 : 4.5} />
          ))}
          {windows.map((d, i) => (
            <path key={i} className="fp-window" d={d} stroke="#bcd7e7" strokeWidth="2" />
          ))}
          {doors.map((d, i) => (
            <path key={i} className="fp-door" d={d} stroke="#e2ad55" strokeWidth="2" strokeLinecap="round" />
          ))}
          <path className="fp-dim" d={`M${px(-6)} ${py(4.5) + 30}H${px(6)}M${px(-6)} ${py(4.5) + 22}v16M${px(6)} ${py(4.5) + 22}v16`} stroke="#5492b4" strokeWidth="1.5" />
          <path className="fp-dim" d={`M${px(6) + 30} ${py(-4.5)}V${py(4.5)}M${px(6) + 22} ${py(-4.5)}h16M${px(6) + 22} ${py(4.5)}h16`} stroke="#5492b4" strokeWidth="1.5" />
        </g>
        <g fontFamily="'Exo 2 Variable', sans-serif" fontStyle="italic" fontWeight="700" fill="#cfe3ef" textAnchor="middle">
          {ROOMS.map(([t, x, z]) => (
            <text key={t} className="fp-label" x={px(x)} y={py(z) + 6} fontSize="17">{t}</text>
          ))}
          <text className="fp-label" x={px(0)} y={py(4.5) + 52} fontSize="14" fill="#8fbcd6">12,00 m</text>
          <text className="fp-label" x={px(6) + 48} y={py(0)} fontSize="14" fill="#8fbcd6" transform={`rotate(90 ${px(6) + 48} ${py(0)})`}>9,00 m</text>
        </g>
      </svg>
    </div>
  )
}
