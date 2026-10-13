const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

export const ArrowRight = (p) => (
  <svg viewBox="0 0 24 24" className="ico ico--arrow" {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)
export const ArrowUpRight = (p) => (
  <svg viewBox="0 0 24 24" className="ico ico--arrow" {...base} {...p}><path d="M7 17 17 7M8 7h9v9" /></svg>
)
export const ChevronLeft = (p) => (
  <svg viewBox="0 0 24 24" className="ico" {...base} {...p}><path d="m15 18-6-6 6-6" /></svg>
)
export const ChevronRight = (p) => (
  <svg viewBox="0 0 24 24" className="ico" {...base} {...p}><path d="m9 18 6-6-6-6" /></svg>
)
export const Close = (p) => (
  <svg viewBox="0 0 24 24" className="ico" {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
)
export const Scroll = (p) => (
  <svg viewBox="0 0 24 24" className="ico" {...base} width="16" height="16" {...p}><rect x="7" y="3" width="10" height="18" rx="5" /><path d="M12 7v4" /></svg>
)
export const WhatsApp = (p) => (
  <svg viewBox="0 0 32 32" className="ico" aria-hidden="true" {...p}>
    <path fill="currentColor" d="M16.02 3C8.84 3 3 8.83 3 16c0 2.3.6 4.53 1.75 6.5L3 29l6.68-1.74A13 13 0 0 0 16.02 29C23.2 29 29 23.17 29 16S23.2 3 16.02 3Zm0 23.73c-2 0-3.95-.54-5.65-1.56l-.4-.24-3.97 1.03 1.06-3.86-.26-.4A10.7 10.7 0 0 1 5.27 16c0-5.93 4.83-10.75 10.75-10.75S26.75 10.07 26.75 16 21.94 26.73 16.02 26.73Zm5.9-8.04c-.32-.16-1.91-.94-2.2-1.05-.3-.1-.51-.16-.73.16-.21.32-.83 1.05-1.02 1.27-.19.21-.37.24-.7.08-.32-.16-1.36-.5-2.59-1.6-.96-.85-1.6-1.9-1.79-2.22-.19-.32-.02-.5.14-.66.15-.14.32-.37.48-.56.16-.19.21-.32.32-.54.1-.21.05-.4-.03-.56-.08-.16-.72-1.74-.99-2.38-.26-.62-.53-.54-.72-.55h-.62c-.21 0-.56.08-.85.4-.3.32-1.12 1.1-1.12 2.67s1.15 3.1 1.31 3.31c.16.21 2.26 3.45 5.47 4.84.77.33 1.36.53 1.83.68.77.24 1.47.21 2.02.13.62-.09 1.91-.78 2.18-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z" />
  </svg>
)
