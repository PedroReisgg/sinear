import { useLayoutEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap.js'

const floors = [0, 1, 2]
const indoor = [168, 252, 336, 420]

/** Corte de prédio de 3 andares: condensadora no topo e dois tubos de cobre por andar (AR-02). */
export function VRFBuilding() {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return
      const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top 75%', end: 'bottom 55%', scrub: 0.6 } })
      tl.from('.vrf-floor', { opacity: 0, x: -12, stagger: 0.1, duration: 0.4 })
        .from('.vrf-unit', { y: -20, opacity: 0, duration: 0.4 }, 0.2)
        .from('.vrf-riser', { drawSVG: '0%', duration: 0.8, ease: 'none' }, 0.5)
        .from('.vrf-branch', { drawSVG: '0%', duration: 0.5, stagger: 0.12, ease: 'none' }, 1.0)
        .from('.vrf-indoor', { opacity: 0, scale: 0.7, transformOrigin: '50% 50%', stagger: 0.06, duration: 0.3 }, 1.2)
      gsap.to('.vrf-flow', { strokeDashoffset: -40, duration: 1.4, ease: 'none', repeat: -1 })
      gsap.to('.vrf-fan', { rotation: 360, transformOrigin: '50% 50%', duration: 2.2, ease: 'none', repeat: -1 })
    }, ref)
    return () => ctx.revert()
  }, [])
  const floorY = (i) => 150 + i * 96
  return (
    <div className="case-figure" ref={ref}>
      <svg viewBox="0 0 560 470" role="img" aria-label="Corte de um prédio de três andares com a unidade externa na cobertura e dois tubos de cobre descendo para cada andar">
        <defs>
          <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <path d="M0 0v8" stroke="#2f5266" strokeWidth="2" />
          </pattern>
        </defs>
        {/* cobertura + condensadora */}
        <g className="vrf-unit">
          <rect x="206" y="62" width="148" height="72" rx="4" fill="#e3e9ed" />
          <rect x="206" y="62" width="148" height="12" rx="3" fill="#bcd7e7" />
          {[244, 316].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="104" r="22" fill="#244051" />
              <g className="vrf-fan">
                <path d={`M${cx} 104l0-18M${cx} 104l15.6 9M${cx} 104l-15.6 9`} stroke="#8fbcd6" strokeWidth="5" strokeLinecap="round" />
              </g>
              <circle cx={cx} cy="104" r="4" fill="#e3e9ed" />
            </g>
          ))}
          <text x="280" y="52" textAnchor="middle" fill="#8fbcd6" fontSize="13" fontWeight="600">VRF Gree 100 HP</text>
        </g>
        <rect x="96" y="134" width="368" height="8" fill="#5f7a8b" />
        {floors.map((i) => (
          <g key={i} className="vrf-floor">
            <rect x="104" y={floorY(i) - 8} width="352" height="88" fill="#1f3a4b" stroke="#2f5266" />
            <rect x="96" y={floorY(i) + 80} width="368" height="8" fill="url(#hatch)" stroke="#2f5266" />
            <text x="118" y={floorY(i) + 64} fill="#8fbcd6" fontSize="13" fontWeight="600">{3 - i}º andar</text>
          </g>
        ))}
        {/* shaft */}
        <rect x="268" y="134" width="24" height="300" fill="#183041" />
        {/* risers (2 tubos) */}
        {[274, 286].map((x, k) => (
          <g key={x}>
            <path className="vrf-riser" d={`M${x} 134V${floorY(2) + 12}`} stroke="#c8794a" strokeWidth="4" fill="none" />
            <path className="vrf-flow" d={`M${x} 134V${floorY(2) + 12}`} stroke={k ? '#ffd2b0' : '#bfe3f5'} strokeWidth="1.6" strokeDasharray="4 16" fill="none" opacity="0.9" />
          </g>
        ))}
        {floors.map((i) => (
          <g key={i}>
            {[0, 1].map((k) => [128, 432].map((end) => (
              <path key={`${k}-${end}`} className="vrf-branch" d={`M${274 + k * 12} ${floorY(i) + 4 + k * 6}H${end}`} stroke={k ? '#d99a6c' : '#c8794a'} strokeWidth="2.6" fill="none" />
            )))}
            {indoor.map((x) => (
              <g key={x} className="vrf-indoor">
                <rect x={x - 26} y={floorY(i) + 14} width="52" height="14" rx="3" fill="#e3e9ed" />
                <path d={`M${x - 16} ${floorY(i) + 36}q16 8 32 0`} stroke="#8fbcd6" strokeWidth="2" fill="none" />
              </g>
            ))}
          </g>
        ))}
        <g fontSize="12" fill="#c9dbe6">
          <circle cx="112" cy="458" r="5" fill="#c8794a" /><text x="124" y="462">2 tubos de cobre por andar</text>
          <rect x="318" y="452" width="20" height="10" rx="2" fill="#e3e9ed" /><text x="346" y="462">evaporadoras</text>
        </g>
      </svg>
    </div>
  )
}
