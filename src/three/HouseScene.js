import * as THREE from 'three'
import {
  ScrubScene, seg, easeInOut, easeOut, easeOutBack, lerp, clamp01,
  ribbonGeometry, subdivide, setRibbonProgress, textTexture, canvasTexture,
} from './core.js'
import { WALLS, ROOMS } from '../lib/plan.js'

/*
 * "Da planta baixa à casa pronta" — one fixed-camera story driven by scroll progress (0..1).
 *   0.00–0.20  planta baixa (linhas desenham na grade)
 *   0.20–0.40  fundação (sapatas, baldrame, laje) + câmera inclina para 3/4
 *   0.40–0.60  estrutura (pilares e vigas)
 *   0.60–0.80  alvenaria e cobertura (tijolos sobem, tesouras e telhas)
 *   0.80–1.00  acabamento e entrega (pintura, esquadrias, jardim, luz quente)
 */

const NAVY = new THREE.Color('#132733')
const LINE = new THREE.Color('#8fc0dc')
const AMBER = '#e2ad55'

const Y0 = 0.3 // topo da laje
const WALL_TOP = 2.85
const BEAM_TOP = 3.1
const RIDGE = 4.9

const COLUMNS = [
  [-6, 4.5], [-2.5, 4.5], [1, 4.5], [6, 4.5],
  [-6, -0.5], [-1, -0.5], [1, -0.5], [3.5, -0.5], [6, -0.5],
  [-6, -4.5], [-1, -4.5], [3.5, -4.5], [6, -4.5],
]

/** Scale a box's UVs to its real dimensions so a 1 m texture tiles at true scale. */
function boxWorldUV(geo, sx, sy, sz) {
  const uv = geo.attributes.uv
  // BoxGeometry face order: +x, -x, +y, -y, +z, -z (4 verts each)
  const dims = [[sz, sy], [sz, sy], [sx, sz], [sx, sz], [sx, sy], [sx, sy]]
  for (let f = 0; f < 6; f++) {
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v
      uv.setXY(i, uv.getX(i) * dims[f][0], uv.getY(i) * dims[f][1])
    }
  }
  uv.needsUpdate = true
  return geo
}

function wallFrame(w) {
  const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1])
  const dir = [(w.b[0] - w.a[0]) / len, (w.b[1] - w.a[1]) / len]
  return { len, dir, angle: Math.atan2(-dir[1], dir[0]), thick: w.ext ? 0.2 : 0.14 }
}

export class HouseScene extends ScrubScene {
  build() {
    const s = this.scene
    this.camera.fov = 34
    this.scene.environmentIntensity = 0.45
    this.renderer.toneMappingExposure = 0.95

    // ---------- materials ----------
    const brickTex = canvasTexture(512, 512, (c, W, H) => {
      c.fillStyle = '#d9d2cb'
      c.fillRect(0, 0, W, H)
      const rows = 12
      const rh = H / rows
      for (let r = 0; r < rows; r++) {
        const off = r % 2 ? W / 8 : 0
        for (let k = -1; k < 4; k++) {
          const x = k * (W / 4) + off
          const shade = 150 + Math.random() * 30
          c.fillStyle = `rgb(${shade + 22},${shade * 0.62},${shade * 0.48})`
          c.fillRect(x + 3, r * rh + 3, W / 4 - 6, rh - 6)
        }
      }
    })
    const tileTex = canvasTexture(256, 256, (c, W, H) => {
      c.fillStyle = '#4c5961'
      c.fillRect(0, 0, W, H)
      for (let r = 0; r < 8; r++) {
        const g = c.createLinearGradient(0, r * 32, 0, r * 32 + 32)
        g.addColorStop(0, '#6c7a83')
        g.addColorStop(1, '#4a565e')
        c.fillStyle = g
        for (let k = 0; k < 8; k++) c.fillRect(k * 32 + (r % 2) * 16 + 1, r * 32 + 1, 30, 29)
      }
    })
    const plasterTex = canvasTexture(256, 256, (c, W, H) => {
      c.fillStyle = '#f1f2f1'
      c.fillRect(0, 0, W, H)
      for (let i = 0; i < 2600; i++) {
        c.fillStyle = `rgba(120,130,135,${Math.random() * 0.05})`
        c.fillRect(Math.random() * W, Math.random() * H, 2, 2)
      }
    })

    this.clipBrick = new THREE.Plane(new THREE.Vector3(0, -1, 0), Y0)
    this.clipPlaster = new THREE.Plane(new THREE.Vector3(0, -1, 0), Y0)

    const M = {
      concrete: new THREE.MeshStandardMaterial({ color: '#b7c0c6', roughness: 0.92 }),
      structure: new THREE.MeshStandardMaterial({ color: '#cfd5d8', roughness: 0.85 }),
      brick: new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.95, clippingPlanes: [this.clipBrick], clipShadows: true }),
      plaster: new THREE.MeshStandardMaterial({ map: plasterTex, roughness: 0.9, clippingPlanes: [this.clipPlaster], clipShadows: true }),
      tile: new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.75, transparent: true }),
      wood: new THREE.MeshStandardMaterial({ color: '#a47a52', roughness: 0.8 }),
      door: new THREE.MeshStandardMaterial({ color: '#7c5236', roughness: 0.6 }),
      frame: new THREE.MeshStandardMaterial({ color: '#2b3a44', roughness: 0.5, metalness: 0.3 }),
      glass: new THREE.MeshStandardMaterial({ color: '#7fa8c0', roughness: 0.08, metalness: 0.6, emissive: new THREE.Color('#ffb36b'), emissiveIntensity: 0 }),
      leaf: new THREE.MeshStandardMaterial({ color: '#56795a', roughness: 0.9, flatShading: true }),
      leaf2: new THREE.MeshStandardMaterial({ color: '#6a8c62', roughness: 0.9, flatShading: true }),
      trunk: new THREE.MeshStandardMaterial({ color: '#6b4f3a', roughness: 0.9 }),
      stone: new THREE.MeshStandardMaterial({ color: '#c9c4bb', roughness: 0.9 }),
      line: new THREE.MeshBasicMaterial({ color: LINE, transparent: true, depthWrite: false, side: THREE.DoubleSide }),
      lineDim: new THREE.MeshBasicMaterial({ color: LINE, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide }),
      amber: new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, depthWrite: false, side: THREE.DoubleSide }),
    }
    this.M = M

    // ---------- lights ----------
    this.hemi = new THREE.HemisphereLight('#cfe3f1', '#1d3240', 0.5)
    s.add(this.hemi)
    this.sun = new THREE.DirectionalLight('#ffffff', 2.2)
    this.sun.castShadow = true
    this.sun.shadow.mapSize.set(2048, 2048)
    const sc = this.sun.shadow.camera
    sc.left = -17; sc.right = 17; sc.top = 17; sc.bottom = -17; sc.near = 1; sc.far = 80
    this.sun.shadow.bias = -0.0004
    this.sun.shadow.normalBias = 0.03
    s.add(this.sun, this.sun.target)

    // ---------- ground (blueprint grid → gramado) ----------
    this.groundUniforms = { uLawn: { value: 0 }, uGrid: { value: 1 } }
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(140, 140).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: '#0a141b', roughness: 1, transparent: true }),
    )
    ground.receiveShadow = true
    ground.material.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, this.groundUniforms)
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vXZ;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvXZ = (modelMatrix * vec4(position,1.0)).xz;')
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', `#include <common>
          varying vec2 vXZ; uniform float uLawn; uniform float uGrid;
          float gridLine(vec2 p, float s, float w){ vec2 q = p / s; vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q); return 1.0 - min(min(g.x, g.y) / w, 1.0); }`)
        .replace('#include <color_fragment>', `#include <color_fragment>
          float dist = length(vXZ);
          vec2 box = abs(vXZ) - vec2(6.6, 5.1);
          float boxD = length(max(box, 0.0)) + min(max(box.x, box.y), 0.0);
          float lawnMask = (1.0 - smoothstep(uLawn * 15.0 - 1.5 - uLawn * 5.0, uLawn * 15.0, boxD)) * step(0.001, uLawn);
          vec3 lawn = mix(vec3(0.055,0.10,0.05), vec3(0.075,0.13,0.06), smoothstep(-1.0,1.0,sin(vXZ.x*1.7)*sin(vXZ.y*1.3)));
          float path = (1.0 - step(0.75, abs(vXZ.x + 1.8))) * step(4.6, vXZ.y) * step(vXZ.y, 12.0) * step(0.05, fract(vXZ.y * 0.9));
          lawn = mix(lawn, vec3(0.36,0.34,0.31), path * smoothstep(0.55, 0.8, uLawn));
          diffuseColor.rgb = mix(diffuseColor.rgb, lawn, lawnMask);`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          float gfade = (1.0 - smoothstep(10.0, 34.0, dist)) * uGrid * (1.0 - lawnMask);
          float g = max(gridLine(vXZ, 1.0, 1.0) * 0.22, gridLine(vXZ, 5.0, 1.4) * 0.5);
          totalEmissiveRadiance += vec3(0.25,0.45,0.62) * g * gfade * 0.6 + vec3(0.0055,0.018,0.03) * (1.0 - lawnMask);`)
        .replace('#include <dithering_fragment>', `#include <dithering_fragment>
          gl_FragColor.a *= 1.0 - smoothstep(22.0, 46.0, dist);`)
    }
    s.add(ground)

    // ---------- 01 planta baixa ----------
    this.planLines = []
    this.planGroup = new THREE.Group()
    this.planGroup.position.y = 0.012
    s.add(this.planGroup)
    const addLine = (pts, width, mat, order) => {
      const m = new THREE.Mesh(ribbonGeometry(pts, width), mat)
      m.renderOrder = 2
      m.userData.order = order
      this.planGroup.add(m)
      this.planLines.push(m)
      return m
    }
    WALLS.forEach((w, wi) => {
      const { len, dir, thick } = wallFrame(w)
      const n = [-dir[1], dir[0]]
      const at = (t, off) => [w.a[0] + dir[0] * t + n[0] * off, w.a[1] + dir[1] * t + n[1] * off]
      // fill
      const fillPts = subdivide(at(0, 0), at(len, 0), len)
      addLine(fillPts, thick, M.lineDim, wi * 0.02)
      // solid stretches as double lines
      const opens = [...w.open].sort((x, y) => x.t - y.t)
      let cur = 0
      const stretches = []
      opens.forEach((o) => {
        stretches.push([cur, o.t - o.w / 2])
        cur = o.t + o.w / 2
      })
      stretches.push([cur, len])
      stretches.forEach(([t0, t1]) => {
        if (t1 - t0 < 0.01) return
        ;[-thick / 2, thick / 2].forEach((off) => addLine(subdivide(at(t0, off), at(t1, off)), 0.045, M.line, wi * 0.06 + t0 / 40))
        ;[t0, t1].forEach((tt) => addLine([at(tt, -thick / 2), at(tt, thick / 2)], 0.04, M.line, wi * 0.06 + tt / 40))
      })
      opens.forEach((o) => {
        const order = 0.55 + wi * 0.03
        if (o.kind === 'window') {
          ;[-0.03, 0.03].forEach((off) => addLine(subdivide(at(o.t - o.w / 2, off), at(o.t + o.w / 2, off)), 0.025, M.line, order))
        } else if (o.kind === 'door') {
          const hinge = at(o.t - o.w / 2, 0)
          const sw = o.swing
          const arc = []
          for (let i = 0; i <= 24; i++) {
            const th = (i / 24) * (Math.PI / 2)
            arc.push([hinge[0] + o.w * (Math.cos(th) * dir[0] + Math.sin(th) * n[0] * sw), hinge[1] + o.w * (Math.cos(th) * dir[1] + Math.sin(th) * n[1] * sw)])
          }
          addLine(arc, 0.03, M.amber, order + 0.1)
          addLine(subdivide(hinge, [hinge[0] + n[0] * sw * o.w, hinge[1] + n[1] * sw * o.w], 0.1), 0.035, M.amber, order + 0.1)
        }
      })
    })
    // cotas
    const dimMat = new THREE.MeshBasicMaterial({ color: LINE, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide })
    addLine(subdivide([-6, 5.7], [6, 5.7]), 0.025, dimMat, 0.85)
    addLine(subdivide([7.2, 4.5], [7.2, -4.5]), 0.025, dimMat, 0.88)
    ;[[-6, 5.45, -6, 5.95], [6, 5.45, 6, 5.95], [6.95, 4.5, 7.45, 4.5], [6.95, -4.5, 7.45, -4.5]].forEach((d) =>
      addLine([[d[0], d[1]], [d[2], d[3]]], 0.025, dimMat, 0.9))
    const maxOrder = Math.max(...this.planLines.map((m) => m.userData.order))
    this.planLines.forEach((m) => (m.userData.order /= maxOrder))

    this.labels = []
    const addLabel = (text, x, z, w = 2.3, rotZ = 0, color) => {
      const tex = textTexture(text, color ? { color } : undefined)
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, w / 4).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false }),
      )
      m.rotation.y = rotZ
      m.position.set(x, 0.02, z)
      m.renderOrder = 3
      s.add(m)
      this.labels.push(m)
      return m
    }
    ROOMS.forEach(([t, x, z]) => addLabel(t, x, z, t === 'Banheiro' ? 2.4 : 2.9))
    this.dimLabels = [
      addLabel('12,00 m', 0, 6.25, 2.2, 0, '#8fc0dc'),
      addLabel('9,00 m', 7.85, 0, 2.2, Math.PI / 2, '#8fc0dc'),
    ]
    // fonts load asynchronously; redraw labels once ready
    if (document.fonts?.load) {
      document.fonts.load('600 italic 72px "Exo 2 Variable"').then(() => {
        const all = [...ROOMS.map((r) => r[0]), '12,00 m', '9,00 m']
        this.labels.forEach((m, i) => {
          m.material.map.dispose()
          m.material.map = textTexture(all[i])
          m.material.needsUpdate = true
        })
        this.dirty = true
      }).catch(() => {})
    }

    // ---------- 02 fundação ----------
    this.footings = COLUMNS.map(([x, z]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.36, 0.9).translate(0, 0.18, 0), M.concrete)
      m.position.set(x, 0, z)
      m.castShadow = m.receiveShadow = true
      s.add(m)
      return m
    })
    this.groundBeams = WALLS.filter((w) => w.ext || true).map((w) => {
      const { len, angle } = wallFrame(w)
      const m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.22, 0.3).translate(len / 2, 0.11, 0), M.concrete)
      m.position.set(w.a[0], 0, w.a[1])
      m.rotation.y = angle
      m.castShadow = m.receiveShadow = true
      s.add(m)
      return m
    })
    this.slab = new THREE.Mesh(new THREE.BoxGeometry(12.5, Y0, 9.5).translate(0, Y0 / 2, 0), M.concrete)
    this.slab.castShadow = this.slab.receiveShadow = true
    s.add(this.slab)

    // ---------- 03 estrutura ----------
    this.columns = COLUMNS.map(([x, z], i) => {
      const h = BEAM_TOP - Y0
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.26, h, 0.26).translate(0, h / 2, 0), M.structure)
      m.position.set(x, Y0, z)
      m.castShadow = m.receiveShadow = true
      m.userData.delay = (i / COLUMNS.length) * 0.5
      s.add(m)
      return m
    })
    this.beams = WALLS.map((w, i) => {
      const { len, angle } = wallFrame(w)
      const m = new THREE.Mesh(new THREE.BoxGeometry(len + 0.26, BEAM_TOP - WALL_TOP, 0.24).translate(len / 2, (BEAM_TOP - WALL_TOP) / 2, 0), M.structure)
      m.position.set(w.a[0] - Math.cos(angle) * 0.13, WALL_TOP, w.a[1] + Math.sin(angle) * 0.13)
      m.rotation.y = angle
      m.castShadow = m.receiveShadow = true
      m.userData.delay = (i / WALLS.length) * 0.5
      s.add(m)
      return m
    })

    // ---------- 04 alvenaria ----------
    this.brickGroup = new THREE.Group()
    this.plasterGroup = new THREE.Group()
    this.openings = new THREE.Group()
    s.add(this.brickGroup, this.plasterGroup, this.openings)
    const H = WALL_TOP - Y0
    WALLS.forEach((w) => {
      const { len, dir, angle, thick } = wallFrame(w)
      const pieces = []
      const opens = [...w.open].sort((x, y) => x.t - y.t)
      let cur = 0
      opens.forEach((o) => {
        pieces.push([cur, o.t - o.w / 2, 0, H])
        if (o.y[0] > 0) pieces.push([o.t - o.w / 2, o.t + o.w / 2, 0, o.y[0]])
        pieces.push([o.t - o.w / 2, o.t + o.w / 2, o.y[1], H])
        cur = o.t + o.w / 2
      })
      pieces.push([cur, len, 0, H])
      pieces.forEach(([t0, t1, y0, y1]) => {
        const L = t1 - t0
        if (L < 0.01 || y1 - y0 < 0.01) return
        const mk = (mat, extra) => {
          const g = boxWorldUV(new THREE.BoxGeometry(L, y1 - y0, thick + extra), L, y1 - y0, thick + extra)
          const m = new THREE.Mesh(g, mat)
          const cx = t0 + L / 2
          m.position.set(w.a[0] + dir[0] * cx, Y0 + (y0 + y1) / 2, w.a[1] + dir[1] * cx)
          m.rotation.y = angle
          m.castShadow = m.receiveShadow = true
          return m
        }
        this.brickGroup.add(mk(M.brick, 0))
        this.plasterGroup.add(mk(M.plaster, 0.03))
      })
      // esquadrias
      opens.forEach((o) => {
        if (o.kind === 'pass') return
        const g = new THREE.Group()
        const cx = o.t
        g.position.set(w.a[0] + dir[0] * cx, Y0, w.a[1] + dir[1] * cx)
        g.rotation.y = angle
        const oh = o.y[1] - o.y[0]
        if (o.kind === 'window') {
          const glass = new THREE.Mesh(new THREE.BoxGeometry(o.w - 0.08, oh - 0.08, 0.03), M.glass)
          glass.position.y = o.y[0] + oh / 2
          g.add(glass)
          ;[[o.w, 0.06, 0, o.y[0] + 0.03], [o.w, 0.06, 0, o.y[1] - 0.03], [0.06, oh, -o.w / 2 + 0.03, o.y[0] + oh / 2], [0.06, oh, o.w / 2 - 0.03, o.y[0] + oh / 2], [0.04, oh, 0, o.y[0] + oh / 2]].forEach(([fw, fh, fx, fy]) => {
            const f = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, thick + 0.06), M.frame)
            f.position.set(fx, fy, 0)
            g.add(f)
          })
        } else {
          const d = new THREE.Mesh(new THREE.BoxGeometry(o.w - 0.04, oh - 0.02, 0.05), w.ext ? M.door : M.wood)
          d.position.y = oh / 2
          d.castShadow = true
          g.add(d)
        }
        g.userData.delay = Math.random() * 0.5
        this.openings.add(g)
      })
    })
    // oitões
    const gable = new THREE.Shape([new THREE.Vector2(-4.6, WALL_TOP), new THREE.Vector2(4.6, WALL_TOP), new THREE.Vector2(0, RIDGE - 0.08)])
    ;[-6, 6].forEach((x) => {
      ;[[M.brick, 0.2], [M.plaster, 0.23]].forEach(([mat, d]) => {
        const g = new THREE.ExtrudeGeometry(gable, { depth: d, bevelEnabled: false }).translate(0, 0, -d / 2).rotateY(Math.PI / 2)
        const uv = g.attributes.uv
        for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i), uv.getY(i))
        const m = new THREE.Mesh(g, mat)
        m.position.x = x
        m.castShadow = m.receiveShadow = true
        ;(mat === M.brick ? this.brickGroup : this.plasterGroup).add(m)
      })
    })

    // ---------- cobertura ----------
    const run = 5.1
    const rise = RIDGE - BEAM_TOP + (0.6 * (RIDGE - BEAM_TOP)) / 4.5
    const pitch = Math.atan2(RIDGE - BEAM_TOP, 4.5)
    const slope = run / Math.cos(pitch)
    const eaveY = RIDGE - Math.tan(pitch) * run
    this.rafters = []
    for (let x = -6.5; x <= 6.51; x += 1.3) {
      ;[-1, 1].forEach((side) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, slope).translate(0, 0, side * slope / 2), M.wood)
        m.position.set(x, RIDGE - 0.12, 0)
        m.rotation.x = side * pitch
        m.castShadow = true
        m.userData.delay = ((x + 6.5) / 13) * 0.6
        s.add(m)
        this.rafters.push(m)
      })
    }
    const ridgeBeam = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.16, 0.12), M.wood)
    ridgeBeam.position.set(0, RIDGE - 0.1, 0)
    this.rafters.push(ridgeBeam)
    s.add(ridgeBeam)
    ridgeBeam.userData.delay = 0
    void rise; void eaveY

    this.tiles = []
    const strips = 8
    const stripW = 13.4 / strips
    for (let i = 0; i < strips; i++) {
      ;[-1, 1].forEach((side) => {
        const g = boxWorldUV(new THREE.BoxGeometry(stripW + 0.01, 0.07, slope + 0.1), stripW, 0.07, slope)
        g.translate(0, 0, side * (slope + 0.1) / 2)
        const m = new THREE.Mesh(g, M.tile)
        m.position.set(-6.7 + stripW * (i + 0.5), RIDGE, 0)
        m.rotation.x = side * pitch
        m.castShadow = m.receiveShadow = true
        m.userData.delay = (i / strips) * 0.65 + (side > 0 ? 0.08 : 0)
        m.userData.baseY = RIDGE
        s.add(m)
        this.tiles.push(m)
      })
    }
    const cap = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.14, 0.34), new THREE.MeshStandardMaterial({ color: '#3d4950', roughness: 0.7 }))
    cap.position.set(0, RIDGE + 0.04, 0)
    cap.castShadow = true
    this.ridgeCap = cap
    s.add(cap)

    // ---------- 05 jardim ----------
    this.plants = []
    const bush = (x, z, r, mat) => {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mat)
      m.position.set(x, r * 0.7, z)
      m.castShadow = true
      m.userData.delay = Math.random() * 0.6
      s.add(m)
      this.plants.push(m)
    }
    ;[[-5.2, 5.5, 0.5], [-4.1, 5.6, 0.38], [-3.0, 5.45, 0.45], [0.2, 5.5, 0.45], [1.4, 5.55, 0.36], [3.0, 5.5, 0.5], [4.6, 5.55, 0.42], [5.6, 5.4, 0.35],
      [6.9, 3.2, 0.45], [6.9, 1.6, 0.36], [-6.9, -2, 0.42]].forEach(([x, z, r], i) => bush(x, z, r, i % 2 ? M.leaf2 : M.leaf))
    const tree = (x, z, h) => {
      const g = new THREE.Group()
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, h, 8).translate(0, h / 2, 0), M.trunk)
      const c1 = new THREE.Mesh(new THREE.IcosahedronGeometry(h * 0.42, 1), M.leaf)
      c1.position.y = h + 0.3
      const c2 = new THREE.Mesh(new THREE.IcosahedronGeometry(h * 0.3, 1), M.leaf2)
      c2.position.set(0.5, h - 0.1, 0.3)
      ;[t, c1, c2].forEach((m) => (m.castShadow = true))
      g.add(t, c1, c2)
      g.position.set(x, 0, z)
      g.userData.delay = Math.random() * 0.4
      s.add(g)
      this.plants.push(g)
    }
    tree(-9, 7, 2.6)
    tree(9.2, -6, 3.0)
    tree(-9.5, -5.5, 2.2)

    this.sunA = new THREE.Vector3(9, 18, 11)
    this.sunB = new THREE.Vector3(-14, 7.5, 13)
    this.sunColA = new THREE.Color('#ffffff')
    this.sunColB = new THREE.Color('#ffc58c')
    this.tmpC = new THREE.Color()
    this.camTarget = new THREE.Vector3()
  }

  update() {
    const p = this.progress
    const M = this.M

    // planta
    const draw = seg(p, 0.0, 0.11)
    this.planLines.forEach((m) => {
      const o = m.userData.order * 0.65
      setRibbonProgress(m, (draw - o) / 0.35)
    })
    const labelIn = seg(p, 0.06, 0.12) * (1 - seg(p, 0.2, 0.27))
    this.labels.forEach((m) => (m.material.opacity = labelIn * 0.95))
    M.line.opacity = 1 - seg(p, 0.32, 0.4) * 0.8
    M.amber.opacity = M.line.opacity
    this.planGroup.visible = p < 0.42

    // fundação
    const ft = seg(p, 0.19, 0.27)
    this.footings.forEach((m, i) => {
      const t = easeOutBack(clamp01(ft * 1.6 - (i / this.footings.length) * 0.6))
      m.scale.set(Math.max(t, 0.0001), Math.max(t, 0.0001), Math.max(t, 0.0001))
      m.visible = t > 0.001
    })
    const gb = seg(p, 0.24, 0.31)
    this.groundBeams.forEach((m, i) => {
      const t = easeOut(clamp01(gb * 1.5 - (i / this.groundBeams.length) * 0.5))
      m.scale.x = Math.max(t, 0.0001)
      m.visible = t > 0.001
    })
    const sl = easeInOut(seg(p, 0.29, 0.38))
    this.slab.scale.y = Math.max(sl, 0.0001)
    this.slab.visible = sl > 0.001
    this.slab.scale.x = this.slab.scale.z = lerp(0.96, 1, sl)

    // estrutura
    const col = seg(p, 0.4, 0.51)
    this.columns.forEach((m) => {
      const t = easeOut(clamp01((col - m.userData.delay) / 0.5))
      m.scale.y = Math.max(t, 0.0001)
      m.visible = t > 0.001
    })
    const bm = seg(p, 0.49, 0.6)
    this.beams.forEach((m) => {
      const t = easeInOut(clamp01((bm - m.userData.delay) / 0.5))
      m.scale.x = Math.max(t, 0.0001)
      m.visible = t > 0.001
    })

    // alvenaria + cobertura
    const brickH = lerp(Y0, RIDGE + 0.1, easeInOut(seg(p, 0.6, 0.71)))
    this.clipBrick.constant = brickH
    this.brickGroup.visible = p > 0.6
    const rf = seg(p, 0.69, 0.75)
    this.rafters.forEach((m) => {
      const t = easeOut(clamp01((rf - m.userData.delay) / 0.4))
      m.scale.set(1, 1, Math.max(t, 0.0001))
      m.visible = t > 0.001
    })
    const tl = seg(p, 0.73, 0.83)
    this.tiles.forEach((m) => {
      const t = easeOut(clamp01((tl - m.userData.delay) / 0.27))
      m.position.y = m.userData.baseY + (1 - t) * 3.5
      m.visible = t > 0.001
    })
    M.tile.opacity = 1
    const capT = easeOut(seg(p, 0.82, 0.85))
    this.ridgeCap.visible = capT > 0.001
    this.ridgeCap.scale.x = Math.max(capT, 0.0001)

    // acabamento
    const plasterH = lerp(Y0, RIDGE + 0.1, easeInOut(seg(p, 0.8, 0.88)))
    this.clipPlaster.constant = plasterH
    this.plasterGroup.visible = p > 0.8
    const op = seg(p, 0.84, 0.91)
    this.openings.children.forEach((g) => {
      const t = easeOutBack(clamp01((op - g.userData.delay) / 0.5))
      g.scale.setScalar(Math.max(t, 0.0001))
      g.visible = t > 0.001
    })
    const lawn = easeInOut(seg(p, 0.86, 0.98))
    this.groundUniforms.uLawn.value = lawn
    const pl = seg(p, 0.88, 1)
    this.plants.forEach((m) => {
      const t = easeOutBack(clamp01((pl - m.userData.delay) / 0.4))
      m.scale.setScalar(Math.max(t, 0.0001))
      m.visible = t > 0.001
    })

    // luz: dia neutro → fim de tarde quente
    const warm = easeInOut(seg(p, 0.82, 1))
    this.sun.position.lerpVectors(this.sunA, this.sunB, warm)
    this.sun.color.lerpColors(this.sunColA, this.sunColB, warm)
    this.sun.intensity = lerp(2.1, 2.6, warm)
    this.hemi.intensity = lerp(0.5, 0.32, warm)
    M.glass.emissiveIntensity = warm * 0.9

    // câmera
    const fit = Math.pow(Math.max(1, 1.5 / this.camera.aspect), 0.72)
    const tilt = easeInOut(seg(p, 0.13, 0.38))
    const orbit = easeInOut(seg(p, 0.36, 1))
    const phi = lerp(0.015, 0.98, tilt) + orbit * 0.12
    const theta = lerp(0, 0.95, tilt) - orbit * 0.45
    const r = lerp(25.5, 32, tilt) * fit - orbit * 1.5 * fit
    this.camTarget.set(lerp(0.4, 0, tilt), lerp(0, 1.9, tilt), lerp(0.55, 0, tilt))
    this.camera.position.set(
      this.camTarget.x + r * Math.sin(phi) * Math.sin(theta),
      this.camTarget.y + r * Math.cos(phi),
      this.camTarget.z + r * Math.sin(phi) * Math.cos(theta),
    )
    if (this.orbitOffset) {
      const off = this.camera.position.clone().sub(this.camTarget).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.orbitOffset)
      this.camera.position.copy(this.camTarget).add(off)
    }
    this.camera.lookAt(this.camTarget)
  }
}
