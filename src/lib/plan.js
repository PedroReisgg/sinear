// Planta baixa compartilhada entre o SVG do hero e a cena 3D (metros; fachada em z = +4.5).
export const WALLS = [
  { a: [-6, 4.5], b: [6, 4.5], ext: true, open: [
    { t: 1.6, w: 1.6, y: [1.0, 2.1], kind: 'window' },
    { t: 4.2, w: 1.0, y: [0, 2.1], kind: 'door', swing: -1 },
    { t: 9.6, w: 1.4, y: [1.0, 2.1], kind: 'window' },
  ] },
  { a: [6, 4.5], b: [6, -4.5], ext: true, open: [
    { t: 2.4, w: 1.2, y: [1.0, 2.1], kind: 'window' },
    { t: 7.2, w: 0.6, y: [1.5, 2.1], kind: 'window' },
  ] },
  { a: [6, -4.5], b: [-6, -4.5], ext: true, open: [
    { t: 4.75, w: 1.4, y: [1.0, 2.1], kind: 'window' },
    { t: 9.5, w: 1.4, y: [1.0, 2.1], kind: 'window' },
  ] },
  { a: [-6, -4.5], b: [-6, 4.5], ext: true, open: [
    { t: 2.0, w: 1.2, y: [1.0, 2.1], kind: 'window' },
    { t: 6.8, w: 1.4, y: [1.0, 2.1], kind: 'window' },
  ] },
  { a: [-6, -0.5], b: [6, -0.5], open: [
    { t: 3.6, w: 0.8, y: [0, 2.1], kind: 'door', swing: -1 },
    { t: 6.0, w: 0.8, y: [0, 2.1], kind: 'door', swing: -1 },
    { t: 10.4, w: 0.7, y: [0, 2.1], kind: 'door', swing: -1 },
  ] },
  { a: [1, -0.5], b: [1, 4.5], open: [{ t: 2.2, w: 2.0, y: [0, 2.1], kind: 'pass' }] },
  { a: [-1, -0.5], b: [-1, -4.5], open: [] },
  { a: [3.5, -0.5], b: [3.5, -4.5], open: [] },
]

export const ROOMS = [
  ['Sala', -2.5, 2.0], ['Cozinha', 3.5, 2.0],
  ['Quarto 1', -3.5, -2.5], ['Quarto 2', 1.25, -2.5], ['Banheiro', 4.75, -2.5],
]
