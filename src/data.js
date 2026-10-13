export const PHONE_DISPLAY = '11 98541-3047'
export const WHATSAPP = '5511985413047'

export const MSG = {
  grupo: 'Olá, Grupo Sinear! Gostaria de conversar sobre um projeto.',
  ar: 'Olá, Sinear Ar-condicionados! Gostaria de pedir um orçamento.',
  eng: 'Olá, Sinear Engenharia! Gostaria de solicitar um projeto.',
}

export const wa = (message = MSG.grupo) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`

// Preencher com os endereços oficiais; links vazios não aparecem no rodapé.
export const SOCIAL = {
  youtube: '',
  facebook: '',
}

export const FRONTS = [
  { key: 'grupo', label: 'Grupo Sinear', short: 'Grupo', to: '/' },
  { key: 'ar', label: 'Ar-condicionados', short: 'Ar-condicionado', to: '/ar-condicionados' },
  { key: 'eng', label: 'Engenharia', short: 'Engenharia', to: '/engenharia' },
]

export const NAV = {
  grupo: [
    ['Início', '#inicio'],
    ['Quem somos', '#quem-somos'],
    ['Nossas frentes', '#frentes'],
    ['Galeria', '/galeria'],
    ['Contato', '#contato'],
  ],
  ar: [
    ['Início', '#inicio'],
    ['Por dentro', '#por-dentro'],
    ['Serviços', '#servicos'],
    ['Case', '#case'],
    ['Por que a Sinear', '#por-que'],
    ['Contato', '#contato'],
  ],
  eng: [
    ['Início', '#inicio'],
    ['Como construímos', '#como-construimos'],
    ['Serviços', '#servicos'],
    ['Obras', '#obras'],
    ['Contato', '#contato'],
  ],
  galeria: [
    ['Início', '/'],
    ['Ar-condicionados', '/ar-condicionados'],
    ['Engenharia', '/engenharia'],
    ['Contato', '#contato'],
  ],
}

export const CTA = {
  grupo: ['Fale conosco', MSG.grupo],
  ar: ['Pedir orçamento', MSG.ar],
  eng: ['Solicitar projeto', MSG.eng],
  galeria: ['Fale conosco', MSG.grupo],
}

export const reasons = [
  ['Profissionais qualificados', 'Equipe técnica experiente, flexível e orientada a resolver o problema do cliente.'],
  ['Transparência nos negócios', 'Escopo, prazo e custo claros desde a proposta, sem surpresa no meio do caminho.'],
  ['Solução e custo na medida', 'A solução certa para a necessidade e para a capacidade de investimento de cada cliente.'],
]

export const arServices = [
  ['Instalação', 'Instalação de sistemas de climatização com projeto e acabamento técnico: split, VRF, self e chiller.'],
  ['Vendas', 'Equipamentos das principais marcas, indicados para cada ambiente, carga térmica e orçamento.'],
  ['Manutenção', 'Preventiva, corretiva e PMOC para o equipamento render mais, gastar menos energia e durar mais.'],
  ['Assessoria', 'Orientação técnica para escolher o sistema certo antes de investir, com laudo e proposta clara.'],
]

export const arSteps = [
  ['Visita técnica', 'Entendemos o ambiente, a carga térmica e a necessidade.'],
  ['Proposta clara', 'Solução e custo na medida, sem surpresa.'],
  ['Instalação', 'Execução com equipe qualificada e comissionamento.'],
  ['Manutenção', 'Acompanhamento para o sistema seguir funcionando bem.'],
]

export const chillerStory = [
  {
    tag: '1.000.000 BTU/h',
    title: 'Por fora, uma caixa. Por dentro, engenharia.',
    text: 'Um chiller de grande porte resfria a água que climatiza prédios inteiros. Role para abrir o equipamento e ver como cada parte trabalha.',
  },
  {
    tag: 'Gabinete',
    title: 'Painéis que protegem e dão acesso.',
    text: 'Chapas tratadas contra intempéries e venezianas removíveis: tudo pensado para a manutenção chegar em cada componente.',
  },
  {
    tag: 'Ventiladores axiais',
    title: 'O ar que leva o calor embora.',
    text: 'Os ventiladores puxam o ar externo pelas serpentinas e expulsam o calor para cima. Rolamentos, pás e motores entram no plano de manutenção.',
  },
  {
    tag: 'Serpentinas condensadoras',
    title: 'Onde o gás quente vira líquido.',
    text: 'Tubos de cobre e aletas de alumínio em V trocam calor com o ar. Serpentina limpa é menos consumo de energia e mais vida útil.',
  },
  {
    tag: 'Compressor parafuso',
    title: 'O coração do sistema.',
    text: 'Dois rotores helicoidais giram engrenados e comprimem o gás refrigerante. Reformamos compressores Trane, Carrier, York, Bitzer e outras marcas.',
  },
  {
    tag: 'Evaporador e comando',
    title: 'Água gelada e controle total.',
    text: 'No evaporador a água é resfriada e segue para o prédio. O quadro de comando monitora pressões e temperaturas a cada segundo.',
  },
]

export const engStory = [
  ['Planta baixa', 'Tudo começa no papel: ambientes, medidas e o jeito que você quer viver.'],
  ['Fundação', 'Sapatas, vigas baldrame e laje: a base calculada para o solo do seu terreno.'],
  ['Estrutura', 'Pilares e vigas formam o esqueleto da casa, com acompanhamento do engenheiro.'],
  ['Alvenaria e cobertura', 'As paredes sobem, as aberturas aparecem e o telhado fecha a obra.'],
  ['Acabamento e entrega', 'Pintura, esquadrias e jardim. Casa conferida com você e chave na mão.'],
]

export const engServices = [
  ['Construção de casas', 'Da fundação à entrega, com cronograma e custo acompanhados.'],
  ['Reformas e ampliações', 'Renovar ou crescer o que você já tem, com planejamento técnico.'],
  ['Projeto e execução', 'Projeto técnico e obra sob o mesmo time, sem ruído entre papel e canteiro.'],
  ['Acompanhamento técnico', 'Engenheiro responsável acompanhando cada etapa da sua obra.'],
]

export const engSteps = [
  ['Briefing', 'Ouvimos o que você quer construir.'],
  ['Projeto', 'Planta baixa e projeto técnico.'],
  ['Orçamento', 'Custo e prazo claros, na sua medida.'],
  ['Obra', 'Execução com acompanhamento técnico.'],
  ['Entrega', 'Casa pronta e conferida com você.'],
]

export const engWorks = [
  { img: 'media/eng-03.jpg', title: 'Casa térrea contemporânea', cat: 'Casas' },
  { img: 'media/eng-04.jpg', title: 'Residência com telhado em duas águas', cat: 'Casas' },
  { img: 'media/eng-05.jpg', title: 'Reforma de fachada e cobertura', cat: 'Reformas' },
  { img: 'media/eng-06.jpg', title: 'Ampliação com nova cobertura', cat: 'Ampliações' },
  { img: 'media/eng-07.jpg', title: 'Casa em fase de estrutura', cat: 'Casas' },
  { img: 'media/eng-08.jpg', title: 'Ampliação da área de convivência', cat: 'Ampliações' },
]

export const partners = [
  ['Carrier', 'carrier.png'], ['Springer', 'springer.png'], ['LG', 'lg.png'], ['Fujitsu', 'fujitsu.png'],
  ['Komeco', 'komeco.png'], ['Samsung', 'samsung.png'], ['Elgin', 'elgin.png'], ['Gree', 'gree.png'],
  ['Consul', 'consul.png'], ['Electrolux', 'electrolux.png'], ['Midea', 'midea.png'], ['Hitachi', 'hitachi.png'],
]

const legacyCaptions = ['Climatização', 'Refrigeração industrial', 'Manutenção', 'Instalação', 'Infraestrutura técnica']
export const gallery = [
  ...[
    ['obra-01.jpg', 'Atendimento técnico em campo'], ['obra-06.jpg', 'Central de água gelada'], ['obra-04.jpg', 'Chiller industrial'],
    ['obra-07.jpg', 'Diagnóstico de precisão'], ['obra-10.jpg', 'Infraestrutura técnica'], ['obra-12.jpg', 'Instalação e comissionamento'],
    ['obra-08.jpg', 'Equipe Sinear em campo'], ['obra-03.jpg', 'Unidade condensadora'], ['obra-11.jpg', 'Quadro elétrico'],
    ['obra-02.jpg', 'Split instalado'], ['obra-05.jpg', 'Acabamento de instalação'], ['obra-09.jpg', 'Limpeza de filtros'],
  ].map(([f, c]) => ({ src: `assets/${f}`, caption: c })),
  ...Array.from({ length: 82 }, (_, i) => ({
    src: `assets/galeria-legado/legado-${String(i + 1).padStart(3, '0')}.jpg`,
    caption: `${legacyCaptions[i % legacyCaptions.length]} · acervo Sinear`,
  })),
]
