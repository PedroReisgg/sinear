import * as THREE from 'three'
import { ScrubScene, seg, easeInOut, easeOut, lerp, clamp01, canvasTexture } from './core.js'

/*
 * Chiller industrial a ar (~1.000.000 BTU/h) em vista explodida, controlada pelo scroll.
 *   0.00–0.10  unidade fechada
 *   0.10–0.26  gabinete: painéis laterais e frontais se afastam
 *   0.26–0.40  ventiladores axiais e tampa sobem
 *   0.40–0.55  serpentinas condensadoras se abrem em V
 *   0.55–0.74  compressor parafuso abre: rotores helicoidais e engrenagens à mostra
 *   0.74–0.90  evaporador e quadro de comando
 *   0.90–1.00  vista geral explodida
 */

const L = 5.2 // comprimento do gabinete (x)
const X0 = -2.6
const X1 = 2.6
const ZW = 1.1 // meia largura (z)
const LOWER = 1.05
const TOP = 2.36

function gearShape(teeth, rp) {
  const m = (2 * rp) / teeth
  const ro = rp + m
  const rr = rp - 1.25 * m
  const s = new THREE.Shape()
  const step = (Math.PI * 2) / teeth
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    const pts = [
      [rr, a - step * 0.5], [rr, a - step * 0.28], [ro, a - step * 0.14], [ro, a + step * 0.14], [rr, a + step * 0.28],
    ]
    pts.forEach(([r, t], k) => {
      const x = Math.cos(t) * r
      const y = Math.sin(t) * r
      if (i === 0 && k === 0) s.moveTo(x, y)
      else s.lineTo(x, y)
    })
  }
  s.closePath()
  const hole = new THREE.Path()
  hole.absarc(0, 0, rp * 0.28, 0, Math.PI * 2, true)
  s.holes.push(hole)
  return s
}

function gearGeometry(teeth, rp, depth) {
  const g = new THREE.ExtrudeGeometry(gearShape(teeth, rp), { depth, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 1, curveSegments: 6 })
  g.translate(0, 0, -depth / 2)
  g.rotateY(Math.PI / 2) // eixo ao longo de x
  return g
}

/** Helical screw rotor along x. Male rotors have convex lobes, female rotors concave flutes. */
function rotorGeometry({ lobes, R, r0, length, twist, female }) {
  const S = 56
  const A = lobes * 20
  const pos = []
  const idx = []
  for (let i = 0; i <= S; i++) {
    const x = -length / 2 + (length * i) / S
    const tw = twist * (i / S - 0.5)
    for (let j = 0; j <= A; j++) {
      const th = (j / A) * Math.PI * 2
      const c = 0.5 + 0.5 * Math.cos(lobes * th)
      const r = female ? R - (R - r0) * Math.pow(c, 2.2) : r0 + (R - r0) * Math.pow(c, 0.55)
      const a = th + tw
      pos.push(x, r * Math.cos(a), r * Math.sin(a))
    }
  }
  const row = A + 1
  for (let i = 0; i < S; i++) {
    for (let j = 0; j < A; j++) {
      const a = i * row + j
      const b = a + row
      idx.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

function roundedRectHalf(w, h, r, upper) {
  // half of a rounded rectangle centred at origin, split at y = 0
  const s = new THREE.Shape()
  const hw = w / 2
  const hh = h / 2
  const sg = upper ? 1 : -1
  s.moveTo(-hw, 0)
  s.lineTo(-hw, sg * (hh - r))
  s.quadraticCurveTo(-hw, sg * hh, -hw + r, sg * hh)
  s.lineTo(hw - r, sg * hh)
  s.quadraticCurveTo(hw, sg * hh, hw, sg * (hh - r))
  s.lineTo(hw, 0)
  s.lineTo(-hw, 0)
  return s
}

export class ChillerScene extends ScrubScene {
  build() {
    const s = this.scene
    this.camera.fov = 30
    this.scene.environmentIntensity = 0.85
    this.renderer.toneMappingExposure = 1.0
    this.time = 0
    this.animating = true

    // ---------- textures ----------
    const louverTex = canvasTexture(64, 256, (c, W, H) => {
      c.fillStyle = '#c9d2d8'
      c.fillRect(0, 0, W, H)
      for (let y = 0; y < H; y += 16) {
        const g = c.createLinearGradient(0, y, 0, y + 16)
        g.addColorStop(0, '#f4f6f7')
        g.addColorStop(0.7, '#dfe5e9')
        g.addColorStop(1, '#8f9ca5')
        c.fillStyle = g
        c.fillRect(0, y, W, 14)
      }
    })
    const finTex = canvasTexture(256, 64, (c, W, H) => {
      c.fillStyle = '#9aa6ad'
      c.fillRect(0, 0, W, H)
      for (let x = 0; x < W; x += 3) {
        c.fillStyle = x % 6 ? '#c7d0d5' : '#b3bdc3'
        c.fillRect(x, 0, 2, H)
      }
      c.fillStyle = 'rgba(184,110,64,0.55)'
      for (let y = 6; y < H; y += 16) c.fillRect(0, y, W, 3)
    })
    const tubeSheetTex = canvasTexture(256, 256, (c, W, H) => {
      c.fillStyle = '#b8c0c5'
      c.fillRect(0, 0, W, H)
      for (let y = 10; y < H; y += 18) {
        for (let x = 10 + ((y / 18) % 2) * 9; x < W; x += 18) {
          if (Math.hypot(x - W / 2, y - H / 2) > W / 2 - 14) continue
          c.fillStyle = '#c47a4b'
          c.beginPath(); c.arc(x, y, 6.5, 0, Math.PI * 2); c.fill()
          c.fillStyle = '#4a3326'
          c.beginPath(); c.arc(x, y, 3.5, 0, Math.PI * 2); c.fill()
        }
      }
    })
    const guardTex = canvasTexture(256, 256, (c, W, H) => {
      c.clearRect(0, 0, W, H)
      c.strokeStyle = '#26323a'
      c.lineWidth = 5
      for (let r = 22; r < W / 2; r += 20) { c.beginPath(); c.arc(W / 2, H / 2, r, 0, Math.PI * 2); c.stroke() }
      for (let a = 0; a < 8; a++) {
        c.beginPath(); c.moveTo(W / 2, H / 2)
        c.lineTo(W / 2 + Math.cos((a * Math.PI) / 4) * W / 2, H / 2 + Math.sin((a * Math.PI) / 4) * H / 2); c.stroke()
      }
    })
    guardTex.wrapS = guardTex.wrapT = THREE.ClampToEdgeWrapping
    const screenTex = canvasTexture(256, 128, (c, W, H) => {
      c.fillStyle = '#0d2230'
      c.fillRect(0, 0, W, H)
      c.fillStyle = '#8fd0f0'
      c.font = '700 34px sans-serif'
      c.fillText('7.0 °C', 18, 52)
      c.font = '500 18px sans-serif'
      c.fillStyle = '#5ea6c9'
      c.fillText('ÁGUA GELADA  ·  OK', 18, 92)
      c.fillRect(18, 104, 150, 6)
    })

    const grilleTex = canvasTexture(128, 128, (c, W, H) => {
      c.clearRect(0, 0, W, H)
      c.strokeStyle = '#2a3944'
      c.lineWidth = 7
      for (let k = -W; k < W * 2; k += 32) {
        c.beginPath(); c.moveTo(k, 0); c.lineTo(k + H, H); c.stroke()
        c.beginPath(); c.moveTo(k, H); c.lineTo(k + H, 0); c.stroke()
      }
    }, [L * 3, (TOP - LOWER) * 3])
    const M = {
      grille: new THREE.MeshStandardMaterial({ map: grilleTex, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, metalness: 0.5, roughness: 0.5 }),
      paint: new THREE.MeshStandardMaterial({ color: '#e3e9ed', roughness: 0.42, metalness: 0.15, transparent: true }),
      louver: new THREE.MeshStandardMaterial({ map: louverTex, roughness: 0.45, metalness: 0.2, transparent: true }),
      frame: new THREE.MeshStandardMaterial({ color: '#253845', roughness: 0.55, metalness: 0.45 }),
      comp: new THREE.MeshStandardMaterial({ color: '#4f88ab', roughness: 0.38, metalness: 0.35 }),
      compInner: new THREE.MeshStandardMaterial({ color: '#8fa3b0', roughness: 0.35, metalness: 0.7, side: THREE.DoubleSide }),
      steel: new THREE.MeshStandardMaterial({ color: '#e4e8ea', roughness: 0.18, metalness: 1 }),
      steelDark: new THREE.MeshStandardMaterial({ color: '#9aa3a9', roughness: 0.3, metalness: 1 }),
      brass: new THREE.MeshStandardMaterial({ color: '#c9a35b', roughness: 0.3, metalness: 1 }),
      copper: new THREE.MeshStandardMaterial({ color: '#c8794a', roughness: 0.3, metalness: 1 }),
      insul: new THREE.MeshStandardMaterial({ color: '#20292f', roughness: 0.92 }),
      fin: new THREE.MeshStandardMaterial({ map: finTex, roughness: 0.4, metalness: 0.65 }),
      blade: new THREE.MeshStandardMaterial({ color: '#2f3d47', roughness: 0.45, metalness: 0.3, side: THREE.DoubleSide }),
      guard: new THREE.MeshStandardMaterial({ map: guardTex, transparent: true, alphaTest: 0.4, roughness: 0.5, metalness: 0.6, side: THREE.DoubleSide }),
      tubeSheet: new THREE.MeshStandardMaterial({ map: tubeSheetTex, roughness: 0.4, metalness: 0.7 }),
      cabinet: new THREE.MeshStandardMaterial({ color: '#e6eaed', roughness: 0.5, metalness: 0.1 }),
      screen: new THREE.MeshStandardMaterial({ map: screenTex, emissive: '#ffffff', emissiveMap: screenTex, emissiveIntensity: 0.9 }),
      breaker: new THREE.MeshStandardMaterial({ color: '#f3f4f4', roughness: 0.6 }),
      breakerAccent: new THREE.MeshStandardMaterial({ color: '#3f86aa', roughness: 0.5 }),
      blueRing: new THREE.MeshStandardMaterial({ color: '#5492b4', roughness: 0.4, metalness: 0.2 }),
    }
    this.M = M
    const add = (parent, geo, mat, x = 0, y = 0, z = 0) => {
      const m = new THREE.Mesh(geo, mat)
      m.position.set(x, y, z)
      m.castShadow = true
      m.receiveShadow = true
      parent.add(m)
      return m
    }

    // ---------- lights & floor ----------
    s.add(new THREE.HemisphereLight('#ffffff', '#b9cbd6', 0.7))
    const key = new THREE.DirectionalLight('#ffffff', 2.2)
    key.position.set(6, 12, 8)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 })
    key.shadow.bias = -0.0005
    key.shadow.normalBias = 0.02
    s.add(key)
    const rim = new THREE.DirectionalLight('#cfe5f5', 0.8)
    rim.position.set(-8, 5, -6)
    s.add(rim)

    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(60, 60).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: 0.16 }))
    shadow.receiveShadow = true
    s.add(shadow)
    const grid = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60).rotateX(-Math.PI / 2),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        extensions: { derivatives: true },
        vertexShader: 'varying vec2 vP; void main(){ vP = (modelMatrix*vec4(position,1.)).xz; gl_Position = projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.); }',
        fragmentShader: `varying vec2 vP;
          float gl(vec2 p, float s){ vec2 q=p/s; vec2 g=abs(fract(q-0.5)-0.5)/fwidth(q); return 1.0-min(min(g.x,g.y),1.0); }
          void main(){ float d=length(vP); float a=max(gl(vP,0.5)*0.35, gl(vP,2.5)*0.7)*(1.0-smoothstep(3.0,13.0,d));
          gl_FragColor=vec4(0.33,0.57,0.71,a*0.55); }`,
      }),
    )
    grid.position.y = 0.002
    s.add(grid)

    const unit = new THREE.Group()
    s.add(unit)
    this.unit = unit

    // ---------- base ----------
    const base = new THREE.Group()
    unit.add(base)
    ;[-0.95, 0.95].forEach((z) => add(base, new THREE.BoxGeometry(L + 0.2, 0.16, 0.14), M.frame, 0, 0.08, z))
    for (let x = X0; x <= X1 + 0.01; x += L / 4) add(base, new THREE.BoxGeometry(0.1, 0.12, 1.9), M.frame, x, 0.1, 0)
    // corner posts
    ;[[X0, -ZW], [X0, ZW], [X1, -ZW], [X1, ZW]].forEach(([x, z]) => add(base, new THREE.BoxGeometry(0.09, TOP - 0.16, 0.09), M.frame, x, 0.16 + (TOP - 0.16) / 2, z))
    ;[-ZW, ZW].forEach((z) => add(base, new THREE.BoxGeometry(L, 0.07, 0.08), M.frame, 0, LOWER, z))

    // ---------- evaporator (shell & tube) ----------
    const evap = new THREE.Group()
    evap.position.set(-0.35, 0.56, -0.5)
    unit.add(evap)
    this.evap = evap
    add(evap, new THREE.CylinderGeometry(0.3, 0.3, 3.8, 40).rotateZ(Math.PI / 2), M.insul)
    ;[-1.6, 1.4].forEach((x) => add(evap, new THREE.BoxGeometry(0.12, 0.3, 0.5), M.frame, x, -0.26, 0))
    ;[-1.0, 0.9].forEach((x, i) => {
      add(evap, new THREE.CylinderGeometry(0.075, 0.075, 0.42, 20), M.insul, x, 0.42, 0)
      add(evap, new THREE.CylinderGeometry(0.11, 0.11, 0.05, 20), M.steelDark, x, 0.64, 0)
      add(evap, new THREE.CylinderGeometry(0.082, 0.082, 0.06, 20), i ? M.blueRing : M.copper, x, 0.3, 0)
    })
    const evapCap = new THREE.Group()
    evapCap.position.x = -1.9
    evap.add(evapCap)
    this.evapCap = evapCap
    add(evapCap, new THREE.CylinderGeometry(0.34, 0.34, 0.12, 40).rotateZ(Math.PI / 2), M.steelDark, -0.06, 0, 0)
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      add(evapCap, new THREE.CylinderGeometry(0.018, 0.018, 0.16, 8).rotateZ(Math.PI / 2), M.steel, -0.06, Math.cos(a) * 0.3, Math.sin(a) * 0.3)
    }
    const sheet = add(evap, new THREE.CircleGeometry(0.29, 40).rotateY(-Math.PI / 2), M.tubeSheet, -1.905, 0, 0)
    sheet.castShadow = false
    add(evap, new THREE.CylinderGeometry(0.34, 0.34, 0.05, 40).rotateZ(Math.PI / 2), M.steelDark, 1.92, 0, 0)

    // ---------- screw compressors ----------
    this.compressors = []
    this.rotors = []
    this.gears = []
    ;[-1.55, 0.75].forEach((cx, ci) => {
      const g = new THREE.Group()
      g.position.set(cx, 0.6, 0.48)
      unit.add(g)
      const rotLen = 0.9
      const w = 0.6
      const h = 0.46
      // lower housing (fixed)
      const lower = add(g, new THREE.ExtrudeGeometry(roundedRectHalf(w, h, 0.2, false), { depth: rotLen, bevelEnabled: false, curveSegments: 10 }).translate(0, 0, -rotLen / 2).rotateY(Math.PI / 2), M.comp)
      void lower
      const upper = add(g, new THREE.ExtrudeGeometry(roundedRectHalf(w, h, 0.2, true), { depth: rotLen, bevelEnabled: false, curveSegments: 10 }).translate(0, 0, -rotLen / 2).rotateY(Math.PI / 2), M.comp)
      // inner face of housing so the opening reads as a cast body
      // flanges
      ;[-rotLen / 2 - 0.03, rotLen / 2 + 0.03].forEach((x) => add(g, new THREE.BoxGeometry(0.06, h + 0.06, w + 0.06), M.comp, x, 0, 0))
      // motor
      const motorLen = 0.62
      const motor = add(g, new THREE.CylinderGeometry(0.27, 0.27, motorLen, 36).rotateZ(Math.PI / 2), M.comp, -rotLen / 2 - 0.06 - motorLen / 2, 0, 0)
      for (let k = 0; k < 9; k++) add(g, new THREE.TorusGeometry(0.272, 0.012, 6, 36).rotateY(Math.PI / 2), M.frame, motor.position.x - motorLen / 2 + 0.06 + k * 0.065, 0, 0)
      add(g, new THREE.CylinderGeometry(0.29, 0.29, 0.05, 36).rotateZ(Math.PI / 2), M.frame, motor.position.x - motorLen / 2, 0, 0)
      add(g, new THREE.BoxGeometry(0.22, 0.12, 0.22), M.frame, motor.position.x, 0.3, 0)
      // discharge flange + pipe
      add(g, new THREE.CylinderGeometry(0.07, 0.07, 0.18, 20), M.steelDark, rotLen / 2 + 0.16, 0.18, 0)
      // feet
      ;[-0.35, 0.35].forEach((x) => add(g, new THREE.BoxGeometry(0.16, 0.14, w + 0.12), M.frame, x, -0.3, 0))
      // twin screw rotors
      const male = add(g, rotorGeometry({ lobes: 4, R: 0.135, r0: 0.07, length: rotLen - 0.04, twist: 2.4 }), M.steel, 0, 0, -0.125)
      const female = add(g, rotorGeometry({ lobes: 6, R: 0.135, r0: 0.085, length: rotLen - 0.04, twist: -1.6, female: true }), M.steelDark, 0, 0, 0.125)
      ;[male, female].forEach((r) => add(r, new THREE.CylinderGeometry(0.03, 0.03, rotLen + 0.3, 12).rotateZ(Math.PI / 2), M.steel))
      this.rotors.push({ male, female })
      // timing gears (exposed at the discharge end)
      const gm = add(g, gearGeometry(16, 0.1, 0.05), M.brass, rotLen / 2 + 0.11, 0, -0.125)
      const gf = add(g, gearGeometry(24, 0.15, 0.05), M.steel, rotLen / 2 + 0.11, 0, 0.125)
      gf.rotation.x = Math.PI / 24
      this.gears.push({ gm, gf })
      const endCover = add(g, new THREE.BoxGeometry(0.12, h, w), M.comp, rotLen / 2 + 0.12, 0, 0)
      this.compressors.push({ g, upper, endCover, base: g.position.clone(), index: ci })
    })

    // copper piping compressor → condenser
    const pipe = (pts, r, mat) => {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)))
      return add(unit, new THREE.TubeGeometry(curve, 48, r, 10, false), mat)
    }
    this.pipes = [
      pipe([[-0.9, 0.78, 0.48], [-0.9, 1.0, 0.48], [-0.7, 1.08, 0.2], [-0.6, 1.1, 0]], 0.045, M.copper),
      pipe([[1.4, 0.78, 0.48], [1.4, 1.0, 0.48], [1.6, 1.08, 0.2], [1.7, 1.1, 0]], 0.045, M.copper),
      pipe([[-2.15, 0.62, 0.48], [-2.35, 0.62, 0.2], [-2.35, 0.7, -0.3], [-2.2, 0.62, -0.5]], 0.05, M.insul),
      pipe([[0.15, 0.62, 0.48], [0.1, 0.9, 0.0], [0.4, 0.92, -0.5], [0.55, 0.85, -0.5]], 0.05, M.insul),
    ]

    // ---------- control cabinet ----------
    const cab = new THREE.Group()
    cab.position.set(2.32, 0.2, 0)
    unit.add(cab)
    this.cab = cab
    add(cab, new THREE.BoxGeometry(0.42, 0.82, 1.7).translate(0, 0.41, 0), M.cabinet)
    const inner = new THREE.Group()
    inner.position.set(0.212, 0.41, 0)
    cab.add(inner)
    add(inner, new THREE.PlaneGeometry(1.6, 0.74).rotateY(Math.PI / 2), M.frame, 0.001, 0, 0)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 9; c++) {
        add(inner, new THREE.BoxGeometry(0.02, 0.14, 0.11), c % 4 === 0 ? M.breakerAccent : M.breaker, 0.03, 0.22 - r * 0.22, -0.66 + c * 0.165)
      }
    }
    const door = new THREE.Group()
    door.position.set(0.235, 0.41, -0.85)
    cab.add(door)
    this.door = door
    add(door, new THREE.BoxGeometry(0.03, 0.8, 1.7), M.cabinet, 0.015, 0, 0.85)
    add(door, new THREE.PlaneGeometry(0.42, 0.21).rotateY(Math.PI / 2), M.screen, 0.032, 0.14, 0.85)
    add(door, new THREE.BoxGeometry(0.04, 0.12, 0.03), M.frame, 0.04, 0, 1.55)

    // ---------- condenser coils (V) ----------
    this.coils = []
    const coilLen = L - 0.16
    const coilH = 1.42
    const tilt = Math.atan2(0.86, 1.2)
    ;[-1, 1].forEach((side) => {
      const g = new THREE.Group()
      g.position.set(0, LOWER + 0.04, side * 0.16)
      g.rotation.x = side * tilt
      unit.add(g)
      const finGeo = new THREE.BoxGeometry(coilLen, coilH, 0.12).translate(0, coilH / 2, 0)
      const uv = finGeo.attributes.uv
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * coilLen * 3, uv.getY(i) * coilH)
      add(g, finGeo, M.fin)
      ;[-coilLen / 2 - 0.03, coilLen / 2 + 0.03].forEach((x) => {
        add(g, new THREE.BoxGeometry(0.06, coilH, 0.16).translate(0, coilH / 2, 0), M.paint, x, 0, 0)
        for (let k = 0; k < 10; k++) add(g, new THREE.TorusGeometry(0.035, 0.012, 6, 12, Math.PI).rotateY(Math.PI / 2).rotateX(Math.PI / 2), M.copper, x + Math.sign(x) * 0.04, 0.1 + k * 0.135, 0)
      })
      add(g, new THREE.CylinderGeometry(0.05, 0.05, coilLen, 14).rotateZ(Math.PI / 2), M.copper, 0, coilH - 0.05, side * 0.1)
      g.userData = { side, baseRot: g.rotation.x, baseZ: g.position.z }
      this.coils.push(g)
    })

    // ---------- top deck + fans ----------
    const deck = new THREE.Group()
    deck.position.y = TOP
    unit.add(deck)
    this.deck = deck
    const fanX = [-1.92, -0.64, 0.64, 1.92]
    const R = 0.56
    const deckShape = new THREE.Shape()
    deckShape.moveTo(X0 - 0.05, -ZW - 0.05)
    deckShape.lineTo(X1 + 0.05, -ZW - 0.05)
    deckShape.lineTo(X1 + 0.05, ZW + 0.05)
    deckShape.lineTo(X0 - 0.05, ZW + 0.05)
    deckShape.closePath()
    fanX.forEach((x) => {
      const h = new THREE.Path()
      h.absarc(x, 0, R + 0.02, 0, Math.PI * 2, true)
      deckShape.holes.push(h)
    })
    add(deck, new THREE.ExtrudeGeometry(deckShape, { depth: 0.05, bevelEnabled: false, curveSegments: 40 }).rotateX(Math.PI / 2).translate(0, 0.05, 0), M.paint)
    this.fans = []
    this.guards = []
    fanX.forEach((x) => {
      const f = new THREE.Group()
      f.position.set(x, 0, 0)
      deck.add(f)
      add(f, new THREE.CylinderGeometry(R + 0.03, R + 0.03, 0.26, 48, 1, true), M.paint, 0, 0.13, 0)
      add(f, new THREE.TorusGeometry(R + 0.03, 0.02, 8, 48).rotateX(Math.PI / 2), M.paint, 0, 0.26, 0)
      const rotor = new THREE.Group()
      rotor.position.y = 0.08
      f.add(rotor)
      add(rotor, new THREE.CylinderGeometry(0.11, 0.13, 0.12, 24), M.frame)
      const bladeShape = new THREE.Shape()
      bladeShape.moveTo(0.1, -0.05)
      bladeShape.quadraticCurveTo(0.35, -0.13, R - 0.02, -0.1)
      bladeShape.quadraticCurveTo(R + 0.02, 0.02, R - 0.04, 0.12)
      bladeShape.quadraticCurveTo(0.35, 0.1, 0.1, 0.06)
      bladeShape.closePath()
      for (let b = 0; b < 5; b++) {
        const bg = new THREE.ShapeGeometry(bladeShape, 8).rotateX(-Math.PI / 2)
        const blade = new THREE.Mesh(bg, M.blade)
        blade.castShadow = true
        const holder = new THREE.Group()
        holder.rotation.y = (b / 5) * Math.PI * 2
        blade.rotation.x = 0.32
        holder.add(blade)
        rotor.add(holder)
      }
      add(f, new THREE.CylinderGeometry(0.13, 0.13, 0.32, 20), M.frame, 0, -0.14, 0)
      ;[0, 1, 2].forEach((k) => add(f, new THREE.BoxGeometry(R * 2, 0.03, 0.04), M.frame, 0, -0.04, 0).rotation.y = (k * Math.PI) / 3)
      const guard = add(f, new THREE.CircleGeometry(R + 0.03, 48).rotateX(-Math.PI / 2), M.guard, 0, 0.27, 0)
      guard.castShadow = false
      this.guards.push(guard)
      this.fans.push({ f, rotor })
    })

    // ---------- housing panels ----------
    this.panels = []
    const panel = (geo, mat, x, y, z, dir) => {
      const m = add(unit, geo, mat, x, y, z)
      m.userData = { base: m.position.clone(), dir: new THREE.Vector3(...dir) }
      this.panels.push(m)
      return m
    }
    const louverGeo = (w, h) => {
      const g = new THREE.BoxGeometry(w, h, 0.04)
      const uv = g.attributes.uv
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w * 2, uv.getY(i) * h * 1.2)
      return g
    }
    const pw = L / 3
    for (let k = 0; k < 3; k++) {
      const x = X0 + pw * (k + 0.5)
      panel(louverGeo(pw - 0.02, LOWER - 0.2), M.louver, x, 0.16 + (LOWER - 0.2) / 2 + 0.02, ZW + 0.02, [0, 0, 1])
      panel(louverGeo(pw - 0.02, LOWER - 0.2), M.louver, x, 0.16 + (LOWER - 0.2) / 2 + 0.02, -ZW - 0.02, [0, 0, -1])
    }
    panel(new THREE.BoxGeometry(0.04, TOP - 0.2, 2 * ZW), M.paint, X0 - 0.03, 0.16 + (TOP - 0.2) / 2, 0, [-1, 0, 0])
    panel(new THREE.BoxGeometry(0.04, TOP - LOWER - 0.02, 2 * ZW), M.paint, X1 + 0.03, LOWER + (TOP - LOWER) / 2, 0, [1, 0, 0])
    panel(new THREE.BoxGeometry(0.04, LOWER - 0.2, 2 * ZW), M.louver, X1 + 0.03, 0.16 + (LOWER - 0.2) / 2 + 0.02, 0, [1, 0, 0])
    panel(new THREE.BoxGeometry(L - 0.1, 0.03, 2 * ZW - 0.1), M.paint, 0, LOWER + 0.02, 0, [-1.6, 0.3, 0])
    // upper side guards (mesh) in front of the coils
    ;[-1, 1].forEach((side) => {
      const gg = new THREE.PlaneGeometry(L, TOP - LOWER)
      const m = panel(gg, M.grille, 0, LOWER + (TOP - LOWER) / 2, side * (ZW + 0.03), [0, 0, side])
      m.castShadow = false
    })

    this.tmpA = new THREE.Vector3()
    this.tmpB = new THREE.Vector3()
    this.keys = [
      // p, camera position, target
      [0.0, [8.0, 5.4, 8.4], [0, 1.15, 0]],
      [0.12, [8.6, 5.2, 8.0], [0, 1.2, 0]],
      [0.26, [9.6, 4.6, 7.4], [0, 1.25, 0]],
      [0.4, [8.6, 6.4, 9.2], [0, 2.1, 0]],
      [0.55, [6.8, 4.8, 10.4], [0, 1.6, 0.2]],
      [0.64, [2.6, 3.4, 8.4], [-1.1, 1.0, 1.6]],
      [0.74, [0.7, 2.6, 5.8], [-1.4, 1.0, 1.9]],
      [0.86, [8.8, 4.4, 6.6], [0.4, 1.1, -0.4]],
      [1.0, [9.2, 5.6, 9.4], [0, 1.7, -0.2]],
    ]
  }

  cameraAt(p) {
    const k = this.keys
    let i = 0
    while (i < k.length - 2 && p > k[i + 1][0]) i++
    const t = easeInOut(clamp01((p - k[i][0]) / (k[i + 1][0] - k[i][0])))
    this.tmpA.fromArray(k[i][1]).lerp(this.tmpB.fromArray(k[i + 1][1]), t)
    const pos = this.tmpA.clone()
    const tgt = new THREE.Vector3().fromArray(k[i][2]).lerp(new THREE.Vector3().fromArray(k[i + 1][2]), t)
    return [pos, tgt]
  }

  update(dt) {
    const p = this.progress
    this.time += dt

    // gabinete
    const a = easeInOut(seg(p, 0.1, 0.26))
    this.panels.forEach((m, i) => {
      const d = m.userData.dir
      const lift = d.y
      void lift
      const k = easeInOut(clamp01(a * 1.3 - (i % 6) * 0.05))
      m.position.copy(m.userData.base).addScaledVector(d, k * 1.8)
      m.position.y += k * 0.15
      const o = 1 - seg(k, 0.55, 1)
      m.material.opacity = m.material.userData?.baseOpacity ?? m.material.opacity
      m.visible = o > 0.01
      m.scale.setScalar(lerp(1, 0.96, k))
    })
    this.M.paint.opacity = 1
    this.M.louver.opacity = 1

    // ventiladores
    const b = easeInOut(seg(p, 0.26, 0.4))
    this.deck.position.y = TOP + b * 1.7
    this.guards.forEach((g) => (g.position.y = 0.27 + easeOut(seg(p, 0.32, 0.42)) * 0.55))
    const fanSpeed = 2.2 + b * 6
    this.fans.forEach(({ rotor }, i) => (rotor.rotation.y = -(this.time * fanSpeed + i * 0.7)))

    // serpentinas
    const c = easeInOut(seg(p, 0.4, 0.55))
    this.coils.forEach((g) => {
      const { side, baseRot, baseZ } = g.userData
      g.position.z = baseZ + side * c * 1.25
      g.position.y = LOWER + 0.04 + c * 0.35
      g.rotation.x = baseRot + side * c * 0.22
    })

    // compressores
    const d = easeInOut(seg(p, 0.55, 0.66))
    const open = easeInOut(seg(p, 0.6, 0.7))
    this.compressors.forEach(({ g, upper, endCover, base, index }) => {
      const out = index === 0 ? 1.45 : 0.75
      g.position.set(base.x, base.y + d * (index === 0 ? 0.35 : 0.15), base.z + d * out)
      const oo = index === 0 ? open : open * 0.0
      upper.position.y = oo * 0.75
      upper.position.z = -oo * 0.32
      upper.rotation.x = -oo * 0.75
      endCover.position.x = 0.9 / 2 + 0.12 + oo * 0.35
      endCover.visible = oo < 0.98
    })
    const spin = this.time * (1.2 + open * 3)
    this.rotors.forEach(({ male, female }) => {
      male.rotation.x = spin
      female.rotation.x = -spin * (4 / 6)
    })
    this.gears.forEach(({ gm, gf }) => {
      gm.rotation.x = spin
      gf.rotation.x = Math.PI / 24 - spin * (16 / 24)
    })

    // evaporador + quadro
    const e = easeInOut(seg(p, 0.74, 0.86))
    this.evap.position.z = -0.5 - e * 1.35
    this.evap.position.y = 0.56 + e * 0.12
    this.evapCap.position.x = -1.9 - easeOut(seg(p, 0.78, 0.88)) * 0.6
    const dr = easeInOut(seg(p, 0.76, 0.88))
    this.cab.position.x = 2.32 + dr * 0.75
    this.door.rotation.y = dr * 1.75
    this.pipes.forEach((m) => (m.visible = p < 0.56))

    const [pos, tgt] = this.cameraAt(p)
    const fit = Math.pow(Math.max(1, 1.45 / this.camera.aspect), 0.78)
    pos.sub(tgt).multiplyScalar(fit * (this.zoom || 1))
    if (this.orbitOffset) pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.orbitOffset)
    pos.add(tgt)
    this.camera.position.copy(pos)
    this.camera.lookAt(tgt)
  }
}
