# Site Grupo Sinear

Site institucional do **Grupo Sinear — Projetos e Manutenção**, com três frentes:

- `#/` Grupo Sinear (porta de entrada para as duas empresas)
- `#/ar-condicionados` Sinear Ar-condicionados (chiller 3D abrindo no scroll)
- `#/engenharia` Sinear Engenharia (planta baixa virando casa no scroll)
- `#/galeria` 94 fotos reais com lightbox

Stack: React 18 + Vite, GSAP (ScrollTrigger, SplitText, DrawSVG), Motion, Three.js e Lenis.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera dist/ (site estático)
npm run preview    # serve o build
```

`dist/` pode ser publicado em qualquer hospedagem estática (Netlify, Vercel, Hostinger, S3). As rotas usam `#/`, então não precisa configurar redirecionamento no servidor.

## Onde mexer

| O quê | Arquivo |
| --- | --- |
| Textos, serviços, telefone, WhatsApp, redes sociais | `src/data.js` |
| Cores, fontes e espaçamentos | `src/styles.css` (variáveis em `:root`) |
| Cena 3D da casa (etapas, câmera, cores) | `src/three/HouseScene.js` |
| Cena 3D do chiller (peças, explosão, câmera) | `src/three/ChillerScene.js` |
| Planta baixa (SVG do hero e cena 3D) | `src/lib/plan.js` |
| Animações de entrada, contadores e parallax | `src/lib/useAnimations.js` |

## Animações de scroll

As duas animações principais são cenas 3D em tempo real (Three.js) controladas pelo scroll: a seção fica fixa e o progresso da rolagem avança a construção da casa ou a abertura do chiller, enquanto o texto lateral troca por etapa. Isso deixa o movimento nítido em qualquer tela e mais leve do que um vídeo pesado.

Os mesmos movimentos também estão exportados em vídeo (`media/video-planta-para-casa.mp4` e `media/video-chiller-abrindo.mp4`, 1920×1080) para redes sociais e apresentações.

Para regenerar imagens e vídeos, abra `capture.html?scene=house` ou `capture.html?scene=chiller` no `npm run dev`; a página expõe `window.__setP(progresso, tempo, órbita)` para capturar quadros.

## Pendências para o cliente

- Fotos reais das obras de engenharia (as da seção "Obras entregues" são renderizações marcadas como "Imagem ilustrativa").
- Endereços oficiais do YouTube e do Facebook em `src/data.js` (os links só aparecem quando preenchidos).
- Números de projetos, casas e m² construídos, se quiser trocar os indicadores atuais.

## Acessibilidade

Navegação por teclado, foco visível, Esc fecha menu e galeria, textos alternativos e `prefers-reduced-motion` (sem pin/scroll 3D; mostra imagem estática e etapas em lista).
