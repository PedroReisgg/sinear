import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export const clamp01 = (v) => Math.min(1, Math.max(0, v))
export const seg = (p, a, b) => clamp01((p - a) / (b - a))
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOut = (t) => 1 - Math.pow(1 - t, 3)
export const easeOutBack = (t) => {
  const c1 = 1.4
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
export const lerp = (a, b, t) => a + (b - a) * t

/**
 * Base class for scroll-scrubbed scenes. Subclasses build their content in `build()`
 * and react to `this.progress` in `update(dt)`. Rendering is on-demand: a frame is drawn
 * when progress changes, the canvas resizes, or the subclass reports `animating`.
 */
export class ScrubScene {
  constructor(canvas, { transparent = true, pixelRatio, preserve = false } = {}) {
    this.canvas = canvas
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: transparent,
      preserveDrawingBuffer: preserve,
      powerPreference: 'high-performance',
    })
    const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches
    this.renderer.setPixelRatio(pixelRatio ?? Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap
    this.renderer.localClippingEnabled = true
    this.renderer.setClearColor(0x000000, 0)

    this.scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()

    this.camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 400)
    this.progress = 0
    this.target = 0
    this.dirty = true
    this.running = false
    this.clock = new THREE.Timer()
    this.animating = false
    this.smoothing = 0.12

    this.build()
    this.resize()
    this._ro = new ResizeObserver(() => this.resize())
    this._ro.observe(canvas.parentElement || canvas)
    this._loop = this._loop.bind(this)
  }

  build() {}
  update() {}

  setProgress(p, immediate = false) {
    this.target = clamp01(p)
    if (immediate) this.progress = this.target
    this.dirty = true
  }

  resize() {
    const el = this.canvas.parentElement || this.canvas
    const w = Math.max(1, el.clientWidth)
    const h = Math.max(1, el.clientHeight)
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.size = [w, h]
    this.applyShift()
    this.dirty = true
    if (!this.running) this.renderOnce()
  }

  /** Shift the projection centre (fractions of the viewport) so content clears overlaid copy. */
  setShift(x = 0, y = 0) {
    this.shift = [x, y]
    this.applyShift()
    this.dirty = true
  }

  applyShift() {
    const [w, h] = this.size || [1, 1]
    const [sx, sy] = this.shift || [0, 0]
    if (sx || sy) this.camera.setViewOffset(w, h, -w * sx, -h * sy, w, h)
    else this.camera.clearViewOffset()
    this.camera.updateProjectionMatrix()
  }

  renderOnce() {
    this.update(0)
    this.renderer.render(this.scene, this.camera)
  }

  start() {
    if (this.running) return
    this.running = true
    this.clock.update()
    requestAnimationFrame(this._loop)
  }

  stop() {
    this.running = false
  }

  _loop() {
    if (!this.running) return
    this.clock.update()
    const dt = Math.min(this.clock.getDelta(), 0.05)
    const diff = this.target - this.progress
    if (Math.abs(diff) > 0.0004) {
      this.progress += diff * (1 - Math.pow(1 - this.smoothing, dt * 60))
      this.dirty = true
    } else if (this.progress !== this.target) {
      this.progress = this.target
      this.dirty = true
    }
    if (this.dirty || this.animating) {
      this.update(dt)
      this.renderer.render(this.scene, this.camera)
      this.dirty = false
    }
    requestAnimationFrame(this._loop)
  }

  dispose() {
    this.stop()
    this._ro.disconnect()
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose()
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
      mats.forEach((m) => {
        Object.values(m).forEach((v) => v && v.isTexture && v.dispose())
        m.dispose()
      })
    })
    this.renderer.dispose()
  }
}

/** Flat ribbon along a polyline on the XZ plane; drawRange reveals it progressively. */
export function ribbonGeometry(points, width) {
  const pos = []
  const idx = []
  const hw = width / 2
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    const a = points[Math.max(0, i - 1)]
    const b = points[Math.min(points.length - 1, i + 1)]
    let dx = b[0] - a[0]
    let dz = b[1] - a[1]
    const len = Math.hypot(dx, dz) || 1
    dx /= len
    dz /= len
    pos.push(p[0] - dz * hw, 0, p[1] + dx * hw, p[0] + dz * hw, 0, p[1] - dx * hw)
  }
  for (let i = 0; i < points.length - 1; i++) {
    const k = i * 2
    idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  g.userData.segments = points.length - 1
  return g
}

export function subdivide(a, b, step = 0.12) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1])
  const n = Math.max(1, Math.ceil(len / step))
  const pts = []
  for (let i = 0; i <= n; i++) pts.push([a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n])
  return pts
}

export function setRibbonProgress(mesh, t) {
  const n = mesh.geometry.userData.segments
  const count = Math.round(clamp01(t) * n) * 6
  mesh.geometry.setDrawRange(0, count)
  mesh.visible = count > 0
}

export function textTexture(text, { color = '#a9cbe0', font = '700 italic 78px "Exo 2 Variable", "Exo 2", sans-serif', w = 512, h = 128 } = {}) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, w / 2, h / 2)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

export function canvasTexture(w, h, draw, repeat = [1, 1]) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(...repeat)
  t.anisotropy = 8
  return t
}
