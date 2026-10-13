import '@fontsource-variable/exo-2/wght-italic.css'
import { HouseScene } from './three/HouseScene.js'
import { ChillerScene } from './three/ChillerScene.js'
const q = new URLSearchParams(location.search)
const Cls = q.get('scene') === 'chiller' ? ChillerScene : HouseScene
const BG = q.get('bg')
if (BG) document.body.style.background = BG
const canvas = document.getElementById('c')
await document.fonts.load('600 italic 72px "Exo 2 Variable"').catch(() => {})
const sc = new Cls(canvas, { preserve: true, pixelRatio: 1 })
window.__scene = sc
if (BG) sc.renderer.setClearColor(BG, 1)
window.__setP = (p, t = 0, orbit = 0, zoom = 1) => { sc.setProgress(p, true); sc.time = t; sc.orbitOffset = orbit; sc.zoom = zoom; sc.renderOnce(); return true }
window.__setP(parseFloat(q.get('p') || '0'))
window.__ready = true
