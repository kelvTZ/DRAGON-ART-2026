import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, X, ZoomIn, ChevronLeft, ChevronRight, 
  Sparkles, Shield, Flame, 
  Sun, Wand2, Compass, Cpu, Bookmark, Palette
} from 'lucide-react';
import { sound } from '../sound';

export interface EbookChapter {
  id: string;
  number: number;
  title: string;
  category: string;
  categoryName: string;
  image: string;
  summary: string;
  details: string[];
  tipsDragonArt: string;
}

export const EBOOK_CHAPTERS: EbookChapter[] = [
  {
    id: 'canvas-size',
    number: 1,
    title: 'Guia de Resoluções e Tamanhos de Tela',
    category: 'fundamentos',
    categoryName: '✦ Fundamentos & Linhas',
    image: '/ebook/Beginners_pixel_art_canvas_size_202607240050.jpeg',
    summary: 'A escolha do tamanho de tela correto define a estética, o nível de detalhamento e a quantidade de trabalho exigida no seu projeto.',
    details: [
      'Resoluções clássicas: 16x16 (Sprite Simples), 32x32 (GBA / SNES), 64x64 (Detalhado / Bosses), 128x128+ (Ilustração HD).',
      'Mantenha a coerência de grid em todo o seu jogo ou conjunto de sprites.',
      'Quanto menor a tela, cada pixel individual carrega mais peso visual.'
    ],
    tipsDragonArt: 'No Dragon Art, você pode criar telas de 16x16 até 512x512 com predefinições instantâneas.'
  },
  {
    id: 'basic-tools',
    number: 2,
    title: 'Ferramentas Básicas e Configuração de Pincel',
    category: 'fundamentos',
    categoryName: '✦ Fundamentos & Linhas',
    image: '/ebook/Tutorial_Pixel_Art_Basic_Tools_202607240050.jpeg',
    summary: 'Aprenda a dominar o pincel de 1px, balde de tinta, borracha, seleção por varinha e conta-gotas sem interpolação.',
    details: [
      'Desative a suavização automática (Anti-Aliasing) do navegador ao desenhar.',
      'Use atalhos de teclado para agilizar o fluxo (B para Pincel, E para Borracha, G para Balde).',
      'Mantenha o pincel fixado em 1px para controle absoluto do traço.'
    ],
    tipsDragonArt: 'Utilize a barra de ferramentas inferior do WyrmPIXEL para alternar pincéis e tamanhos com 1 toque.'
  },
  {
    id: 'cleaning-lines',
    number: 3,
    title: 'Line Art Perfeita: Limpeza de Pixels Duplos (Doubles)',
    category: 'fundamentos',
    categoryName: '✦ Fundamentos & Linhas',
    image: '/ebook/Pixel_art_tutorial_cleaning_lines_202607240050.jpeg',
    summary: 'Pixels duplos indesejados criam ruído e poluem o contorno. Aprenda a regra de 1px de espessura.',
    details: [
      'Elimine cantos em L que duplicam a espessura da linha sem necessidade.',
      'Construa curvas limpas usando contagens progressivas de pixels (ex: 3-2-1-1-2-3).',
      'Mantenha os cantos suaves ajustando o posicionamento diagonal.'
    ],
    tipsDragonArt: 'O Dragon Art inclui o filtro de Pixel Perfect que remove pixels duplos automaticamente enquanto você desenha.'
  },
  {
    id: 'line-action',
    number: 4,
    title: 'Linha de Ação e Dinâmica nas Poses',
    category: 'fundamentos',
    categoryName: '✦ Fundamentos & Linhas',
    image: '/ebook/Pixel_Art_Tutorial_Line_Action_202607240050.jpeg',
    summary: 'Dê vida e energia aos personagens estabelecendo curvas gestuais dinâmicas antes dos detalhes.',
    details: [
      'Trance a silhueta principal com uma única linha gestual em S ou C.',
      'Evite poses rígidas e verticais sem inclinação de ombro e quadril.',
      'Mesmo em sprites de 16x16, a postura transmite a personalidade do personagem.'
    ],
    tipsDragonArt: 'Crie uma camada de rascunho (Draft) com opacidade 30% no WyrmPIXEL antes de fazer a arte final.'
  },
  {
    id: 'colored-outlines',
    number: 5,
    title: 'Outlines Coloridas vs. Outlines Pretas',
    category: 'fundamentos',
    categoryName: '✦ Fundamentos & Linhas',
    image: '/ebook/Pixel_art_tutorial_colored_outlines_202607240050.jpeg',
    summary: 'Saiba quando usar contornos pretos rígidos (estilo arcade) ou contornos coloridos integrados à iluminação (estilo moderno).',
    details: [
      'Outlines pretas destacam o sprite de qualquer cenário, ideal para jogos com fundo movimentado.',
      'Outlines coloridas usam tons mais escuros da própria cor interna para suavidade.',
      'Selective Outlining (Selout) aplica contorno escuro apenas onde há sombra.'
    ],
    tipsDragonArt: 'No WyrmPIXEL você pode trocar a cor dos contornos facilmente usando a ferramenta de substituição de cor.'
  },
  {
    id: 'anti-aliasing',
    number: 6,
    title: 'Anti-Aliasing Manual (Suavização de Bordas)',
    category: 'cores',
    categoryName: '🎨 Cores & Luz',
    image: '/ebook/Pixel_Art_Tutorial_Manual_Anti-a…_202607240050.jpeg',
    summary: 'Técnica de colocar pixels com tonalidade intermediária para simular curvas e bordas extremamente suaves.',
    details: [
      'Posicione pixels de transição entre a cor da linha e o fundo.',
      'Evite aplicar Anti-Aliasing excessivo para não causar desfoque ou perda de nitidez.',
      'Use tons com luminância proporcional ao ângulo da curva.'
    ],
    tipsDragonArt: 'Aumente o zoom para 800% no WyrmPIXEL para enxergar com precisão cada pixel de suavização.'
  },
  {
    id: 'shading-sphere',
    number: 7,
    title: 'Sombreamento Fundamental de Formas 3D',
    category: 'cores',
    categoryName: '🎨 Cores & Luz',
    image: '/ebook/Pixel_art_shading_tutorial_sphere_202607240050.jpeg',
    summary: 'Compreenda a física da luz: Luz Direta, Meio-Tom, Sombra Própria, Luz Refletida e Sombra Projetada.',
    details: [
      'Defina um ponto de luz fixo no espaço (ex: superior esquerdo em 45°).',
      'Construa degradês em blocos de cor (clusters) sem espalhar pixels avulsos.',
      'A luz refletida na borda oposta dá tridimensionalidade à esfera ou cubo.'
    ],
    tipsDragonArt: 'Use a paleta de cores lateral do Dragon Art para selecionar rampas prontas de luz e sombra.'
  },
  {
    id: 'color-palettes',
    number: 8,
    title: 'Criação de Paletas Harmoniosas e Rampas de Cor',
    category: 'cores',
    categoryName: '🎨 Cores & Luz',
    image: '/ebook/Pixel_art_color_palettes_tutorial_202607240050.jpeg',
    summary: 'A escolha de paletas limitadas garante coesão artística e visual retrô inconfundível.',
    details: [
      'Trabalhe com rampas de 3 a 5 tons para cada cor base.',
      'Evite selecionar cores puras e saturadas ao extremo (como #FF0000 puro).',
      'Compartilhe tons escuros entre cores diferentes para economizar espaço na paleta.'
    ],
    tipsDragonArt: 'O Dragon Art traz mais de 20 paletas clássicas prontas (GB, NES, DB-16, PICO-8, Lospec).'
  },
  {
    id: 'hue-shifting',
    number: 9,
    title: 'Hue Shifting: Transição Térmica de Cores',
    category: 'cores',
    categoryName: '🎨 Cores & Luz',
    image: '/ebook/Pixel_Art_Hue_Shifting_Tutorial_202607240050.jpeg',
    summary: 'Altere o tom (Hue) além do brilho ao sombrear: luzes tendem ao amarelo/quente e sombras ao azul/frio.',
    details: [
      'Ao clarear: mova a matriz de cor em direção ao Amarelo quente.',
      'Ao escurecer: mova a matriz de cor em direção ao Azul/Roxo frio.',
      'Isso evita que as sombras fiquem acinzentadas e sem vida.'
    ],
    tipsDragonArt: 'O seletor de cores HSL do Dragon Art facilita mover a roda de cores na direção quente/fria.'
  },
  {
    id: 'cluster-theory',
    number: 10,
    title: 'Teoria dos Clusters e Leitura Visual',
    category: 'cores',
    categoryName: '🎨 Cores & Luz',
    image: '/ebook/Clustering_pixel_art_cluster_theory_202607240050.jpeg',
    summary: 'Agrupe pixels em formas contínuas (Clusters) para evitar o visual "ruído de sal e pimenta".',
    details: [
      'Clusters grandes definem a estrutura principal da forma.',
      'Pixels isolados (1x1) chamam atenção excessiva e devem ter propósito claro (ex: brilho no olho).',
      'Harmonize as bordas dos clusters para uma leitura limpa mesmo de longe.'
    ],
    tipsDragonArt: 'Use a visualização de prévia em tamanho 1x no canto superior do WyrmPIXEL para checar a leitura visual.'
  },
  {
    id: 'gradients-dithering',
    number: 11,
    title: 'Gradientes Manuais e Dithering Avançado',
    category: 'cores',
    categoryName: '🎨 Cores & Luz',
    image: '/ebook/Pixel_Art_Tutorial_Gradients_Ble…_202607240050.jpeg',
    summary: 'Técnica clássica de entrelaçamento de pixels para simular transições de cores com paletas limitadas.',
    details: [
      'Dithering em xadrez 50/50 simula o meio-tom exato entre duas cores.',
      'Dithering esparso cria degradação suave em céus, fundos e metais.',
      'Evite dither desnecessário em sprites pequenos para não poluir a silhueta.'
    ],
    tipsDragonArt: 'A ferramenta de Pincel Dithering do WyrmPIXEL aplica padrões quadriculados automaticamente.'
  },
  {
    id: 'dynamic-lighting',
    number: 12,
    title: 'Iluminação Dinâmica e Pontos de Luz',
    category: 'cores',
    categoryName: '🎨 Cores & Luz',
    image: '/ebook/Pixel_art_dynamic_lighting_tutorial_202607240050.jpeg',
    summary: 'Simule luzes de tochas, magias e néon interagindo com o ambiente e a anatomia.',
    details: [
      'Identifique superfícies perpendiculares ao raio de luz para aplicar destaques de alto brilho.',
      'Luzes coloridas alteram a cor original do objeto (ex: luz vermelha sobre roupa azul gera roxo).',
      'Use camadas de overlay com modo de mesclagem para testes rápidos.'
    ],
    tipsDragonArt: 'Utilize o sistema de camadas com opacidade do Dragon Art para simular luzes dinâmicas sem destruir o desenho.'
  },
  {
    id: 'stone-brick-texture',
    number: 13,
    title: 'Texturas de Pedra, Tijolos e Rochas',
    category: 'texturas',
    categoryName: '🧱 Texturas & Materiais',
    image: '/ebook/Pixel_art_stone_brick_texture_202607240050.jpeg',
    summary: 'Crie paredes de castelo, masmorras e pedras rústicas com variações de volume e ranhuras.',
    details: [
      'Evite padrões repetitivos idênticos em cada tijolo.',
      'Desenhe imperfeições, quebras nas bordas e musgo para dar realismo.',
      'Destaque as ranhuras horizontais e verticais com linhas de sombra escuras.'
    ],
    tipsDragonArt: 'Crie blocos de tiles no Dragon Art e teste a repetição sem emendas com a ferramenta de grid.'
  },
  {
    id: 'wood-texture',
    number: 14,
    title: 'Texturas de Madeira e Tábua Envelhecida',
    category: 'texturas',
    categoryName: '🧱 Texturas & Materiais',
    image: '/ebook/Pixel_art_tutorial_wood_texture_202607240050.jpeg',
    summary: 'Desenhe tábuas de madeira, nós, veios naturais e superfícies amadeiradas polidas ou desgastadas.',
    details: [
      'Siga o sentido dos veios da madeira com linhas levemente onduladas.',
      'Adicione nós arredondados e rachaduras finas com tons mais escuros.',
      'Destaque os cantos das tábuas com um brilho sutil de luz refletida.'
    ],
    tipsDragonArt: 'Use a paleta de marrons quentes do WyrmPIXEL para obter tons de carvalho, mogno e pinho.'
  },
  {
    id: 'organic-materials',
    number: 15,
    title: 'Materiais Orgânicos e Superfícies Naturais',
    category: 'texturas',
    categoryName: '🧱 Texturas & Materiais',
    image: '/ebook/Pixel_Art_Tutorial_Organic_Mater…_202607240050.jpeg',
    summary: 'Como representar couros, peles de monstros, escamas de dragão e terra molhada.',
    details: [
      'Escamas requerem sombras em arco repetidas com pequenos pontos de iluminação.',
      'Couro possui reflexos foscos e ranhuras suaves ao longo das dobras.',
      'Misture clusters irregulares para superfícies rugosas.'
    ],
    tipsDragonArt: 'Ative a camada de referência para comparar a textura com a anatomia do dragão ou criatura.'
  },
  {
    id: 'metals-shine',
    number: 16,
    title: 'Metais, Armaduras e Brilho Especular',
    category: 'texturas',
    categoryName: '🧱 Texturas & Materiais',
    image: '/ebook/Pixel_art_tutorial_metals_shine_202607240050.jpeg',
    summary: 'Metais polidos exigem alto contraste: áreas muito escuras adjacentes a pontos de luz branca intensa.',
    details: [
      'Reflexos em metal formam faixas verticais ou diagonais nítidas.',
      'Insira uma linha de luz de contorno (Rim Light) na borda oposta para separar do fundo.',
      'Ouro usa tons de marrom profundo até amarelo esbranquiçado.'
    ],
    tipsDragonArt: 'Use o pincel com cor branca pura (#FFFFFF) apenas para o ponto exato de brilho especular máximo.'
  },
  {
    id: 'glass-reflection',
    number: 17,
    title: 'Vidros Translúcidos e Refratação de Luz',
    category: 'texturas',
    categoryName: '🧱 Texturas & Materiais',
    image: '/ebook/Pixel_art_tutorial_glass_reflect…_202607240050.jpeg',
    summary: 'Desenhe frascos de poção, janelas e orbes mágicas com transparência e reflexos curvos.',
    details: [
      'Mantenha as bordas do vidro mais claras e o centro transparente.',
      'Desenhe traços diagonais brancos curvos para indicar o reflexo da luz na superfície esférica.',
      'O líquido interno deve acompanhar a rotação do frasco.'
    ],
    tipsDragonArt: 'No WyrmPIXEL, desenhe o vidro na camada superior com opacidade de 70% sobre o líquido.'
  },
  {
    id: 'fabric-folds',
    number: 18,
    title: 'Dobras de Tecidos, Capas e Vestimentas',
    category: 'texturas',
    categoryName: '🧱 Texturas & Materiais',
    image: '/ebook/Pixel_Art_Tutorial_Fabric_Folds_202607240050.jpeg',
    summary: 'Compreenda a gravidade e o ponto de tensão nas dobras de vestimentas de magos, cavaleiros e camponeses.',
    details: [
      'As dobras radiam a partir dos pontos de suporte (ombros, cotovelos, cintura).',
      'Tecidos pesados formam dobras largas em V ou U.',
      'Tecidos leves criam múltiplas dobras finas e agrupadas.'
    ],
    tipsDragonArt: 'Use a ferramenta de rotação de seleção para testar a caimento de capas e bandeiras.'
  },
  {
    id: 'humanoid-anatomy',
    number: 19,
    title: 'Anatomia Humana e Proporções em Pixel Art',
    category: 'personagens',
    categoryName: '🛡️ Personagens & Armaduras',
    image: '/ebook/Humanoid_anatomy_pixel_art_tutorial_202607240050.jpeg',
    summary: 'Esquema de proporções corporais em cabeças para estilos Chibi (2-3 cabeças), Retro (4-5 cabeças) e Realista (7-8 cabeças).',
    details: [
      'Em sprites pequenos, exagere o tamanho da cabeça e das mãos para facilitar a leitura.',
      'Simplifique grupos musculares em formas geométricas básicas (caixas e esferas).',
      'Assegure que os pés estejam firmemente apoiados na linha do chão.'
    ],
    tipsDragonArt: 'Carregue templates de manequins anatômicos inclusos no Dragon Art como guia base.'
  },
  {
    id: 'female-male-structure',
    number: 20,
    title: 'Silhuetas e Estrutura dos Corpos Masculino e Feminino',
    category: 'personagens',
    categoryName: '🛡️ Personagens & Armaduras',
    image: '/ebook/Pixel_art_tutorial_female_male_202607240054.jpeg',
    summary: 'Diferenças fundamentais de silhueta, ombros, quadril e centro de gravidade nos sprites.',
    details: [
      'Corpo masculino: ombros mais largos que o quadril (formato em V ou trapézio).',
      'Corpo feminino: quadril mais largo e cintura definida (formato ampulheta).',
      'Destaque a postura de ombros e cabeça para definir personalidades fortes.'
    ],
    tipsDragonArt: 'Use a visualização em espelho horizontal (Flip X) do WyrmPIXEL para conferir o equilíbrio anatômico.'
  },
  {
    id: 'faces-expressions',
    number: 21,
    title: 'Expressões Faciais, Olhos e Cabelos',
    category: 'personagens',
    categoryName: '🛡️ Personagens & Armaduras',
    image: '/ebook/Pixel_Art_Tutorial_Faces_Express…_202607240050.jpeg',
    summary: 'Transmita emoções intensas (Alegria, Raiva, Tristeza, Surpresa) ajustando sobrancelhas e formato dos olhos.',
    details: [
      'Mesmo em 1x1 pixel, a sobrancelha inclinada muda uma face neutra para raiva.',
      'Desenhe cabelos em grandes blocos (mechas) em vez de fios individuais.',
      'Adicione um ponto de brilho branco de 1px nos olhos para vivacidade.'
    ],
    tipsDragonArt: 'O Dragon Art possui uma galeria de expressões e cabelos pré-prontos para personalizar.'
  },
  {
    id: 'armor-types',
    number: 22,
    title: 'Tipos de Armaduras, Capacetes e Equipamentos',
    category: 'personagens',
    categoryName: '🛡️ Personagens & Armaduras',
    image: '/ebook/Armor_types_pixel_art_tutorial_202607240050.jpeg',
    summary: 'Design de equipamentos medievais e fantásticos: Placas de Aço, Cota de Malha, Couro Batido e Trajes Mágicos.',
    details: [
      'Hombreiras e elmos devem se projetar além da silhueta do corpo.',
      'Cota de malha usa padrões de dithering cruzado denso.',
      'Armaduras de reis usam detalhes dourados e gemas brilhantes nos bordos.'
    ],
    tipsDragonArt: 'Separe o personagem em camadas: Corpo, Roupa, Armadura e Arma para trocar equipamentos facilmente.'
  },
  {
    id: 'items-potions',
    number: 23,
    title: 'Ícones de Itens, Baús e Poções RPG',
    category: 'personagens',
    categoryName: '🛡️ Personagens & Armaduras',
    image: '/ebook/Pixel_art_tutorial_chest_potion_202607240050.jpeg',
    summary: 'Como criar ícones de inventário cristalinos e reconhecíveis instantaneamente em tamanhos 16x16 e 32x32.',
    details: [
      'Mantenha contornos escuros fortes para destacar do fundo do inventário.',
      'Cores vibrantes para itens mágicos (Vermelho = Vida, Azul = Mana, Verde = Veneno).',
      'Adicione um brilho diagonal reluzente para itens raros e lendários.'
    ],
    tipsDragonArt: 'Exporte seus conjuntos de ícones como folha de sprites (Spritesheet) pronta para motores de jogos.'
  },
  {
    id: 'perspective-basic',
    number: 24,
    title: 'Perspectiva de 1 e 2 Pontos de Fuga',
    category: 'cenarios',
    categoryName: '🏰 Cenários & Perspectiva',
    image: '/ebook/Pixel_art_perspective_tutorial_202607240050.jpeg',
    summary: 'Construa cenários profundos utilizando linhas convergentes em direção ao horizonte.',
    details: [
      'Ponto de Fuga no centro cria corredores dramáticos de masmorras.',
      'Objetos diminuem de tamanho e se aproximam da linha do horizonte à medida que se distanciam.',
      'Mantenha as verticais perfeitamente alinhadas a 90°.'
    ],
    tipsDragonArt: 'Ative as guias de perspectiva editáveis no WyrmPIXEL para desenhar cenários alinhados.'
  },
  {
    id: 'isometric-rules',
    number: 25,
    title: 'Regras da Perspectiva Isométrica (Proporção 2:1)',
    category: 'cenarios',
    categoryName: '🏰 Cenários & Perspectiva',
    image: '/ebook/Pixel_art_isometric_perspective_…_202607240050.jpeg',
    summary: 'A perspectiva dos clássicos jogos táticos e RPGs de visão diagonal (3/4).',
    details: [
      'A linha isométrica perfeita no Pixel Art anda 2 pixels na horizontal para 1 pixel na vertical (ângulo de 26.56°).',
      'Evite bordas serrilhadas usando sempre a proporção exata de 2:1.',
      'As 3 faces visíveis do cubo devem ter 3 níveis claros de iluminação (Topo mais claro, Esquerda médio, Direita escuro).'
    ],
    tipsDragonArt: 'O Dragon Art possui a opção de Grid Isométrico 2:1 integrado com encaixe automático de pincel.'
  },
  {
    id: 'isometric-curves',
    number: 26,
    title: 'Curvas e Círculos em Vista Isométrica',
    category: 'cenarios',
    categoryName: '🏰 Cenários & Perspectiva',
    image: '/ebook/Pixel_Art_Isometric_Curves_Tutorial_202607240050.jpeg',
    summary: 'Como projetar cilindros, arcos, torres e barris no espaço isométrico sem distorção.',
    details: [
      'Círculos no plano isométrico viram elipses achatadas na proporção 2:1.',
      'Torres circulares usam o mesmo topo elíptico repetido na base com linhas verticais nas extremidades.',
      'Curvas suaves requerem passos simétricos de pixels (ex: 2-2-1-1-2-2).'
    ],
    tipsDragonArt: 'A ferramenta de Elipse Isométrica do WyrmPIXEL desenha círculos no ângulo correto com 1 clique.'
  },
  {
    id: 'isometric-furniture',
    number: 27,
    title: 'Móveis e Objetos Isométricos',
    category: 'cenarios',
    categoryName: '🏰 Cenários & Perspectiva',
    image: '/ebook/Pixel_art_tutorial_isometric_fur…_202607240050.jpeg',
    summary: 'Desenhe mesas, cadeiras, tronos e bibliotecas perfeitamente integrados ao cenário 2.5D.',
    details: [
      'Construa primeiro a caixa isométrica rascunho de englobar o objeto.',
      'Corte o objeto rascunhado para extrair pés de mesa, encostos e prateleiras.',
      'Projete sombras no chão na mesma direção diagonal.'
    ],
    tipsDragonArt: 'Agrupe móveis em coleções e salve como carimbos (Stamps) no WyrmPIXEL.'
  },
  {
    id: 'tileset-seamless',
    number: 28,
    title: 'Criação de Tilesets Sem Emendas (Seamless Tiles)',
    category: 'cenarios',
    categoryName: '🏰 Cenários & Perspectiva',
    image: '/ebook/Tileset_creation_tutorial_retro_202607240050.jpeg',
    summary: 'Aprenda a criar blocos de terreno (grama, terra, água) que se encaixam infinitamente sem linhas visíveis.',
    details: [
      'Use a técnica de deslocamento (Offset 50%) para trabalhar nas bordas da imagem.',
      'Garanta que detalhes de grama ou pedras cruzem a borda direita e continuem na esquerda.',
      'Crie variações de blocos centrais para evitar repetição visual perceptível.'
    ],
    tipsDragonArt: 'Ative o modo Tile Preview no Dragon Art para ver sua textura repetida em 3x3 em tempo real.'
  },
  {
    id: 'parallax-backgrounds',
    number: 29,
    title: 'Camadas de Cenário e Parallax Scrolling',
    category: 'cenarios',
    categoryName: '🏰 Cenários & Perspectiva',
    image: '/ebook/Pixel_art_background_layers_tuto…_202607240050.jpeg',
    summary: 'Crie a ilusão de profundidade tridimensional em jogos 2D dividindo o fundo em 3 a 5 camadas móveis.',
    details: [
      'Camada 1 (Primeiro Plano): Elementos desfocados ou escuros passando rápido.',
      'Camada 2 (Jogo/Plataforma): Onde o jogador caminha, com contraste nítido.',
      'Camada 3 e 4 (Montanhas/Florestas distantes): Cores desbotadas movendo devagar.',
      'Camada 5 (Céu/Nuvens): Movel ultralento ou estático.'
    ],
    tipsDragonArt: 'No WyrmPIXEL você pode visualizar suas camadas animando em velocidades de Parallax diferentes.'
  },
  {
    id: 'atmospheric-perspective',
    number: 30,
    title: 'Perspectiva Atmosférica e Profundidade de Campo',
    category: 'cenarios',
    categoryName: '🏰 Cenários & Perspectiva',
    image: '/ebook/Pixel_Art_Tutorial_Atmospheric_P…_202607240050.jpeg',
    summary: 'Utilize a névoa e a luz do ambiente para fazer objetos distantes parecerem mais claros e azulados.',
    details: [
      'Objetos próximos possuem contraste máximo, cores quentes e detalhes afiados.',
      'Objetos distantes perdem detalhe, reduzem contraste e tomam a cor do ar (azul/cinza).',
      'Isso guia o olhar do jogador imediatamente para a ação principal.'
    ],
    tipsDragonArt: 'Use a ferramenta de ajuste de saturação e brilho de camada no Dragon Art para distanciar fundos.'
  },
  {
    id: 'clouds-sky',
    number: 31,
    title: 'Desenhando Nuvens e Céus Realistas',
    category: 'cenarios',
    categoryName: '🏰 Cenários & Perspectiva',
    image: '/ebook/Pixel_art_clouds_tutorial_202607240050.jpeg',
    summary: 'Formatos, iluminação e volume de nuvens Cumulus, Stratus e céus de pôr do sol épicos.',
    details: [
      'Construa nuvens unindo círculos imbricados de tamanhos variados.',
      'A parte superior recebe a iluminação direta do sol (branco/amarelo).',
      'A base das nuvens é plana e carrega a sombra mais escura (azul/violeta).'
    ],
    tipsDragonArt: 'Use a paleta de gradientes de céu do Dragon Art para transições perfeitas de crepúsculo.'
  },
  {
    id: 'tree-foliage',
    number: 32,
    title: 'Árvores, Folhagens e Vegetação',
    category: 'cenarios',
    categoryName: '🏰 Cenários & Perspectiva',
    image: '/ebook/Pixel_Art_Tutorial_Tree_Foliage_202607240050.jpeg',
    summary: 'Evite desenhar folha por folha! Agrupe copas de árvores em grandes nuvens verdes volumosas.',
    details: [
      'Trate a copa da árvore como grandes móbiles esféricos agrupados.',
      'Deixe pequenas aberturas (Sky Holes) onde o céu aparece através dos galhos.',
      'O tronco deve se alargar na base onde as raízes encontram o solo.'
    ],
    tipsDragonArt: 'O WyrmPIXEL tem pincéis especiais de folhagem e dithering vegetal para agilizar a criação.'
  },
  {
    id: 'water-reflections',
    number: 33,
    title: 'Água Transparente, Reflexos e Mar',
    category: 'vfx',
    categoryName: '✨ Efeitos Especiais (VFX)',
    image: '/ebook/Water_effects_reflections_transp…_202607240050.jpeg',
    summary: 'Como desenhar rios, lagos, mares e a distorção da água em movimento.',
    details: [
      'Reflexos na água são ondulados horizontalmente e levemente mais escuros que o original.',
      'Linhas de espuma de onda usam traços horizontais finos de 1px com transparência.',
      'A profundidade da água é indicada por um escurecimento progressivo do azul.'
    ],
    tipsDragonArt: 'Anime ondas facilmente duplicando quadros e movendo as linhas 1px para a direita a cada frame.'
  },
  {
    id: 'wet-floor',
    number: 34,
    title: 'Piso Molhado e Reflexos Especulares',
    category: 'vfx',
    categoryName: '✨ Efeitos Especiais (VFX)',
    image: '/ebook/Pixel_art_tutorial_wet_floor_202607240050.jpeg',
    summary: 'Crie cenários estilo Cyberpunk e noites chuvosas com reflexos brilhantes no asfalto molhado.',
    details: [
      'Espelhe os objetos verticalmente na superfície do piso.',
      'Aplique transparência e borrões horizontais nos reflexos.',
      'Adicione pequenos pontos de luz e pingos d’água criando arcos concêntricos.'
    ],
    tipsDragonArt: 'Duplique a camada do cenário, espelhe verticalmente e ajuste a opacidade para 40% no Dragon Art.'
  },
  {
    id: 'fire-effects',
    number: 35,
    title: 'Efeitos de Fogo e Chamas Animadas',
    category: 'vfx',
    categoryName: '✨ Efeitos Especiais (VFX)',
    image: '/ebook/Pixel_Art_Tutorial_Fire_Effects_202607240050.jpeg',
    summary: 'Anatomia da chama: Núcleo Branco/Amarelo, Corpo Laranja, Pontas Vermelhas e Fumaça.',
    details: [
      'O fogo se move para cima em formas de gotas d’água invertidas que se destacam e sobem.',
      'O núcleo mais quente no centro é quase branco (#FFFFFF).',
      'Partículas de fagulhas sobem e desaparecem gradualmente no ar.'
    ],
    tipsDragonArt: 'Anime chamas em ciclos de 4 a 6 quadros usando o painel de timelines do WyrmPIXEL.'
  },
  {
    id: 'explosion-frames',
    number: 36,
    title: 'Quadros de Animação de Explosão',
    category: 'vfx',
    categoryName: '✨ Efeitos Especiais (VFX)',
    image: '/ebook/Pixel_Art_Explosion_Frames_Tutorial_202607240050.jpeg',
    summary: 'Desenvolvimento do timing e antecipação de explosões em 5 etapas fundamentais.',
    details: [
      'Frame 1: Flash de luz branco intenso rápido (1 frame).',
      'Frame 2-3: Expansão veloz da bola de fogo amarela e laranja.',
      'Frame 4-5: Transformação em nuvens de fumaça escura com pontos de brasa.',
      'Frame 6+: Dissipação lenta da fumaça em partículas.'
    ],
    tipsDragonArt: 'Use a cebola (Onion Skinning) do Dragon Art para enxergar o rastro dos quadros anteriores de explosão.'
  },
  {
    id: 'magic-particles',
    number: 37,
    title: 'Partículas Mágicas e Feitiços',
    category: 'vfx',
    categoryName: '✨ Efeitos Especiais (VFX)',
    image: '/ebook/Pixel_Art_Magic_Particles_Tutorial_202607240050.jpeg',
    summary: 'Raios, orbes de energia, poeira estelar e auras de poder para personagens fantasy.',
    details: [
      'Combine cores complementares de alto contraste (ex: Violeta com Amarelo Néon).',
      'Partículas giram em espirais ao redor do conjurador.',
      'Use o efeito de desvanecimento (Fading Out) reduzindo o tamanho de 2x2 para 1x1.'
    ],
    tipsDragonArt: 'O Dragon Art inclui carimbos de partículas mágicas prontos para importar na animação.'
  },
  {
    id: 'neon-glow',
    number: 38,
    title: 'Brilho Neon e Luzes Emissivas',
    category: 'vfx',
    categoryName: '✨ Efeitos Especiais (VFX)',
    image: '/ebook/Pixel_art_tutorial_neon_glow_202607240050.jpeg',
    summary: 'Como simular o efeito de luz tubo de néon, sabres de luz e painéis futuristas.',
    details: [
      'O centro do néon deve ser sempre BRANCO puro (#FFFFFF).',
      'O halo de brilho ao redor carrega a cor saturada do néon (Ciano, Rosa, Verde).',
      'O brilho ilumina os objetos adjacentes no mesmo tom.'
    ],
    tipsDragonArt: 'Aplique o filtro Glow Emissivo do WyrmPIXEL para gerar o halo de luz neon instantaneamente.'
  },
  {
    id: 'wind-dust',
    number: 39,
    title: 'Efeitos de Vento, Poeira e Rastro',
    category: 'vfx',
    categoryName: '✨ Efeitos Especiais (VFX)',
    image: '/ebook/Pixel_art_wind_dust_tutorial_202607240050.jpeg',
    summary: 'Dê sensação de velocidade aos ataques e corridas adicionando linhas de vento e fumaça de impacto.',
    details: [
      'Poeira nos pés se expande em arcos semicirculares ao derrapar.',
      'Linhas de velocidade (Speedlines) acompanham a trajetória de espadas e socos.',
      'Mantenha as linhas de vento finas (1px) e temporárias (1-2 frames).'
    ],
    tipsDragonArt: 'Use a ferramenta de rastro de movimento (Motion Trail) no WyrmPIXEL para gerar speedlines.'
  },
  {
    id: 'walk-cycle',
    number: 40,
    title: 'Ciclo de Caminhada (Walk Cycle): Keyframes e Timing',
    category: 'animacao',
    categoryName: '🏃 Animação & Movimento',
    image: '/ebook/Walk_cycle_tutorial_keyframes_an…_202607240050.jpeg',
    summary: 'Os 4 quadros essenciais da caminhada: Contato, Passagem (Passing), Queda (Down) e Pico (Up).',
    details: [
      'Contato: Pés no ponto mais distante, braços opostos à frente.',
      'Down: O corpo afunda no ponto mais baixo absorvendo o peso.',
      'Passing: Uma perna cruza a outra, corpo se eleva.',
      'Up: O corpo atinge o pico mais alto antes de dar o próximo passo.'
    ],
    tipsDragonArt: 'Anime ciclos perfeitos de 8 quadros no Dragon Art usando o player de animação com taxa de 12 FPS.'
  },
  {
    id: 'subpixel-animation',
    number: 41,
    title: 'Animação em Subpixel (Subpixel Motion)',
    category: 'animacao',
    categoryName: '🏃 Animação & Movimento',
    image: '/ebook/Pixel_Art_Tutorial_Subpixel_Anim…_202607240050.jpeg',
    summary: 'Mova olhos, respiração e detalhes sutis sem mover a posição do pixel, alterando apenas o brilho.',
    details: [
      'Alterar a luminância de um pixel dá a ilusão de que o objeto se moveu meio pixel.',
      'Essencial para animações de respiração (Idle Animation) em sprites pequenos.',
      'Evite mover o contorno inteiro se o movimento for micro.'
    ],
    tipsDragonArt: 'Alterne pequenos brilhos no Dragon Art para fazer gemas e olhos piscarem suavemente.'
  },
  {
    id: 'composition-focal',
    number: 42,
    title: 'Composição Visual e Ponto Focal de Cenas',
    category: 'fundamentos',
    categoryName: '✦ Fundamentos & Linhas',
    image: '/ebook/Tutorial_pixel_art_composition_s…_202607240050.jpeg',
    summary: 'Como organizar os elementos da tela para guiar os olhos do espectador diretamente para o herói ou vilão.',
    details: [
      'Aplique a Regra dos Terços para posicionar o personagem principal.',
      'Crie contraste máximo de cor e luminosidade no ponto focal.',
      'Use linhas de cenário (árvores, espadas, raios) apontando para o centro de interesse.'
    ],
    tipsDragonArt: 'Ative as linhas de grade de composição (Regra dos Terços) nas opções do WyrmPIXEL.'
  },
  {
    id: 'ui-design',
    number: 43,
    title: 'Design de Interface (UI) e HUDs Retrô',
    category: 'ui',
    categoryName: '💻 UI & Interface',
    image: '/ebook/Pixel_art_UI_design_tutorial_202607240050.jpeg',
    summary: 'Construção de barras de vida, caixas de diálogo, botões pixelados e molduras decorativas.',
    details: [
      'Utilize bordas de 9-Slice para caixas de diálogo escaláveis.',
      'Mantenha as fontes pixeladas em tamanhos múltiplos inteiros (ex: 8px, 16px).',
      'Use estados claros de botão: Normal, Hover (Brilho) e Pressed (Afundado 1px).'
    ],
    tipsDragonArt: 'O Dragon Art possui fontes pixeladas nativas (Press Start 2P, Silkscreen) prontas para suas UIs.'
  },
  {
    id: 'crt-filters',
    number: 44,
    title: 'Simulação de Filtros CRT e Telas Retro',
    category: 'ui',
    categoryName: '💻 UI & Interface',
    image: '/ebook/Pixel_art_tutorial_CRT_filters_202607240050.jpeg',
    summary: 'Simule a nostalgia das TVs de tubo de raio catódico com linhas de varredura (Scanlines) e curvatura de tela.',
    details: [
      'Linhas horizontais pretas com 15% de opacidade criam o efeito de Scanline instantâneo.',
      'Aberração cromática suave desloca os canais Vermelho e Azul em 1px nas bordas.',
      'Curvatura de tubo arredonda levemente os 4 cantos da tela.'
    ],
    tipsDragonArt: 'Ative o filtro CRT em tempo real no menu de visualização do Dragon Art para testar a nostalgia retrô.'
  },
  {
    id: 'retro-vs-modern',
    number: 45,
    title: 'Entendendo o Estilo Retro vs. Moderno',
    category: 'fundamentos',
    categoryName: '✦ Fundamentos & Linhas',
    image: '/ebook/Pixel_art_tutorial_understanding…_202607240050.jpeg',
    summary: 'Compare os limites técnicos dos consoles de 8-bit / 16-bit com a liberdade do Pixel Art moderno (HD Pixel Art).',
    details: [
      'Retro estrito: Máximo de 4 cores por tile (Game Boy / NES), sem rotação livre.',
      'Modern Pixel Art: Camadas ilimitadas, iluminação dinâmica, partículas e resoluções livres.',
      'Saiba qual estilo combina com o escopo do seu projeto ou jogo.'
    ],
    tipsDragonArt: 'Alterne entre o Modo Retro Limitação e o Modo Moderno HD a qualquer momento no WyrmPIXEL.'
  },
  {
    id: 'saving-exporting',
    number: 46,
    title: 'Boas Práticas de Exportação e Formatos (PNG vs GIF)',
    category: 'fundamentos',
    categoryName: '✦ Fundamentos & Linhas',
    image: '/ebook/Pixel_art_tutorial_saving_work_202607240050.jpeg',
    summary: 'Garanta que suas artes não fiquem borradas na internet ou em motores de jogos (Unity, Godot, Unreal).',
    details: [
      'NUNCA salve Pixel Art em formato JPG/JPEG (causa artefatos de compressão irreversíveis).',
      'Sempre exporte imagens estáticas em PNG sem perda de qualidade.',
      'Para redes sociais, dimensione sua arte para pelo menos 1080px de largura usando escala vizinho mais próximo (Nearest Neighbor).'
    ],
    tipsDragonArt: 'O botão de Exportar do Dragon Art gera automaticamente arquivos PNG e GIF em 1080p e 4K perfeitos!'
  },
  // NOVOS 20 CAPÍTULOS ILUSTRADOS (47 a 66)
  {
    id: 'character-progression',
    number: 47,
    title: 'Evolução e Progressão Visual de Personagens (LV 1 ao LV 100)',
    category: 'personagens',
    categoryName: '🛡️ Personagens & Armaduras',
    image: '/ebook/Character_progression_pixel_art_…_202607252337.jpeg',
    summary: 'Como fazer o herói evoluir de vestes simples até armaduras lendárias reluzentes.',
    details: [
      'Aumente o tamanho dos ombros e a riqueza de detalhes conforme o nível do personagem sobe.',
      'Adicione auras mágicas e efeitos de luz nos equipamentos de nível alto.',
      'Mantenha as cores primárias do personagem identificáveis em todas as evoluções.'
    ],
    tipsDragonArt: 'Salve variações da mesma base anatômica em camadas separadas no Dragon Art.'
  },
  {
    id: 'masterclass-character-design',
    number: 48,
    title: 'Masterclass de Character Design e Conceito Visual',
    category: 'personagens',
    categoryName: '🛡️ Personagens & Armaduras',
    image: '/ebook/Masterclass_character_design_ill…_202607252337.jpeg',
    summary: 'Técnicas avançadas de desenho conceitual para heróis, vilões e NPCs inesquecíveis.',
    details: [
      'Formas triangulares transmitem perigo e velocidade; formas circulares transmitem simpatia.',
      'Trabalhe a regra das 3 cores principais por personagem.',
      'Defina o centro de interesse do design na cabeça e peitoral.'
    ],
    tipsDragonArt: 'Carregue templates de silhueta no WyrmPIXEL para testar formas marcantes.'
  },
  {
    id: 'monster-anatomy',
    number: 49,
    title: 'Anatomia de Monstros, Bestas e Criaturas Fantásticas',
    category: 'personagens',
    categoryName: '🛡️ Personagens & Armaduras',
    image: '/ebook/Pixel_art_monster_anatomy_tutorial_202607252337.jpeg',
    summary: 'Desenho de criaturas míticas, gárgulas, dragões, harpias e demônios.',
    details: [
      'Misture elementos animais conhecidos (ex: asas de morcego + corpo de felino).',
      'Exagere dentes, garras e chifres para maior impacto visual.',
      'Crie contraste entre peles duras de couro e áreas brilhantes emissivas.'
    ],
    tipsDragonArt: 'Use a ferramenta de simetria espelhada do WyrmPIXEL para desenhar monstros com rapidez.'
  },
  {
    id: 'antialiasing-precision',
    number: 50,
    title: 'Anti-Aliasing de Alta Precisão para Curvas Nítidas',
    category: 'cores',
    categoryName: '🎨 Cores & Luz',
    image: '/ebook/Pixel_art_tutorial_antialiasing_…_202607252337.jpeg',
    summary: 'Técnicas de suavização em alta precisão sem perder o visual Pixel Art afiado.',
    details: [
      'Coloque pixels de suavização apenas nos pontos de ruptura da curva.',
      'Ajuste a opacidade e luminância proporcionalmente ao fundo.',
      'Evite suavizar contornos internos para manter o estilo retro.'
    ],
    tipsDragonArt: 'Alterne a grade de pixels no WyrmPIXEL para checar a precisão dos pontos de alinhamento.'
  },
  {
    id: 'arms-legs-anatomy',
    number: 51,
    title: 'Anatomia e Articulação de Braços e Pernas',
    category: 'personagens',
    categoryName: '🛡️ Personagens & Armaduras',
    image: '/ebook/Pixel_art_tutorial_arms_legs_202607252337.jpeg',
    summary: 'Como desenhar membros anatômicos articulados em movimento e perspectiva.',
    details: [
      'Divida o membro em 3 cilindros anatômicos básicos (Ombro/Braço, Antebraço, Mão).',
      'Dobre as articulações criando pequenos vales de sombra nos cotovelos e joelhos.',
      'Destaque bíceps e panturrilhas com clusters curvos.'
    ],
    tipsDragonArt: 'Utilize a ferramenta de seleção com rotação do WyrmPIXEL para mover braços e pernas facilmente.'
  },
  {
    id: 'character-archetypes',
    number: 52,
    title: 'Arquétipos de Personagens: Guerreiro, Mago e Ladino',
    category: 'personagens',
    categoryName: '🛡️ Personagens & Armaduras',
    image: '/ebook/Pixel_art_tutorial_character_arc…_202607252337.jpeg',
    summary: 'Identidade visual e silhueta para classes clássicas de RPG.',
    details: [
      'Guerreiro: Postura pesada, linhas retas, armaduras de metal e espadas grandes.',
      'Mago: Capuzes altos, cajados longos, robes fluídos e auras de iluminação.',
      'Ladino: Silhueta ágil, capuzes ajustados, adagas duplas e cores furtivas.'
    ],
    tipsDragonArt: 'O Dragon Art possui ícones e acessórios específicos para cada classe prontos para usar.'
  },
  {
    id: 'character-clothing-armor',
    number: 53,
    title: 'Modelagem de Roupas, Armaduras e Tecidos em Movimento',
    category: 'texturas',
    categoryName: '🧱 Texturas & Materiais',
    image: '/ebook/Pixel_art_tutorial_character_clo…_202607252337.jpeg',
    summary: 'Como fazer vestimentas se adaptarem à pose dinâmica do personagem.',
    details: [
      'As roupas seguem o volume dos músculos e do esqueleto por baixo.',
      'Adicione bordas de costura e fivelas de cinto para riqueza de detalhes.',
      'Dobre tecidos ao redor das articulações em movimento.'
    ],
    tipsDragonArt: 'Desenhe as roupas numa camada separada do corpo do personagem no WyrmPIXEL.'
  },
  {
    id: 'character-facial-expressions',
    number: 54,
    title: 'Expressões Faciais Avançadas e Micro-Emoções',
    category: 'personagens',
    categoryName: '🛡️ Personagens & Armaduras',
    image: '/ebook/Pixel_art_tutorial_character_exp…_202607252337.jpeg',
    summary: 'Micro-expressões de determinação, deboche, choque e fúria em pouca resolução.',
    details: [
      'Incline as pupilas e a boca para transmitir ironia e deboche.',
      'Abra a boca em 2x3 pixels para gritos de batalha heroicos.',
      'Adicione gotas de suor ou veias de raiva de 1px.'
    ],
    tipsDragonArt: 'Use a ferramenta de zoom em 1600% para desenhar detalhes faciais com 1px.'
  },
  {
    id: 'character-perspective-angles',
    number: 55,
    title: 'Perspectiva de Personagem: Visão Frontal, 3/4 e Costas',
    category: 'personagens',
    categoryName: '🛡️ Personagens & Armaduras',
    image: '/ebook/Pixel_art_tutorial_character_per…_202607252337.jpeg',
    summary: 'Desenho de sprites em múltiplos ângulos de câmera para jogos top-down e RPGs.',
    details: [
      'Visão 3/4 é a mais recomendada por mostrar volume de frente e perfil ao mesmo tempo.',
      'Ajuste o comprimento das pernas em visão top-down.',
      'Mantenha a altura da cabeça idêntica em todas as 4 direções.'
    ],
    tipsDragonArt: 'Use a visualização de múltiplos quadros (Grid Timeline) no WyrmPIXEL para comparar os ângulos.'
  },
  {
    id: 'combat-poses',
    number: 56,
    title: 'Poses de Combate e Ponto de Equilíbrio Dinâmico',
    category: 'personagens',
    categoryName: '🛡️ Personagens & Armaduras',
    image: '/ebook/Pixel_art_tutorial_character_poses_202607252337.jpeg',
    summary: 'Construção de posturas de ataque, esquiva, guarda de escudo e magias.',
    details: [
      'Afaste os pés para criar uma base ampla de equilíbrio nas poses de combate.',
      'Incline o tronco na direção do golpe para passar sensação de peso e força.',
      'Estique o braço livre para trás para balancear o corpo.'
    ],
    tipsDragonArt: 'Desenhe a linha de chão no Dragon Art para verificar o pé de apoio.'
  },
  {
    id: 'chibi-vs-heroic-proportions',
    number: 57,
    title: 'Proporções Chibi vs. Proporções Heróicas',
    category: 'personagens',
    categoryName: '🛡️ Personagens & Armaduras',
    image: '/ebook/Pixel_art_tutorial_character_pro…_202607252337.jpeg',
    summary: 'Comparação de estilos de proporção para diferentes tipos de jogos.',
    details: [
      'Estilo Chibi (2-3 cabeças): Foco total na fofura, olhos grandes e membros simplificados.',
      'Estilo Heróico (6-7 cabeças): Foco no realismo, anatomia definida e detalhes de armadura.',
      'Estilo Retro 16-bit: Equilíbrio entre legibilidade e detalhes musculares.'
    ],
    tipsDragonArt: 'O Dragon Art possui guias de proporção de cabeças prontas nas configurações de tela.'
  },
  {
    id: 'clean-outlines-master',
    number: 58,
    title: 'Técnicas de Limpeza de Traço e Outlines Cristalinas',
    category: 'fundamentos',
    categoryName: '✦ Fundamentos & Linhas',
    image: '/ebook/Pixel_art_tutorial_clean_line_202607252337.jpeg',
    summary: 'Como manter contornos nítidos e limpos em qualquer estilo de desenho.',
    details: [
      'Substitua linhas serrilhadas por sequências perfeitas (ex: 2-2-2 ou 3-3-3).',
      'Arredonde cantos removendo pixels excedentes na quina.',
      'Mantenha a espessura da linha uniforme em todo o contorno.'
    ],
    tipsDragonArt: 'Use o pincel Pixel Perfect do WyrmPIXEL para desenhar traços perfeitos de primeira.'
  },
  {
    id: 'character-color-harmony',
    number: 59,
    title: 'Harmonia de Cores e Contraste para Personagens',
    category: 'cores',
    categoryName: '🎨 Cores & Luz',
    image: '/ebook/Pixel_art_tutorial_color_palette…_202607252337.jpeg',
    summary: 'Selecione esquemas de cores marcantes para identificar heróis e vilões.',
    details: [
      'Heróis usam cores quentes e saturadas (Vermelho, Dourado, Azul Royal).',
      'Vilões usam cores frias e ácidas (Roxo Escuro, Verde Veneno, Magenta).',
      'Garanta que a cor da pele tenha contraste com as vestimentas.'
    ],
    tipsDragonArt: 'Crie paletas personalizadas de personagens e salve no banco de paletas do WyrmPIXEL.'
  },
  {
    id: 'epic-capes-movement',
    number: 60,
    title: 'Capas Épicas e Movimento Fluído do Vento',
    category: 'texturas',
    categoryName: '🧱 Texturas & Materiais',
    image: '/ebook/Pixel_art_tutorial_drawing_capes_202607252337.jpeg',
    summary: 'Como desenhar capas esvoaçantes com dobras dinâmicas e sombras realistas.',
    details: [
      'A capa se move em ondas de forma senoidal atrás do personagem.',
      'Destaque as bordas internas rasgadas ou decoradas com linhas mais claras.',
      'O tom da sombra interna deve ser bem mais escuro que a superfície exterior.'
    ],
    tipsDragonArt: 'Anime capas em 6 a 8 quadros com o onion skinning do Dragon Art.'
  },
  {
    id: 'hair-volume-shine',
    number: 61,
    title: 'Estilos de Cabelo, Volume e Brilho Especular',
    category: 'personagens',
    categoryName: '🛡️ Personagens & Armaduras',
    image: '/ebook/Pixel_art_tutorial_drawing_hair_202607252337.jpeg',
    summary: 'Desenho de cabelos curtos, longos, cacheados e espetados estilo anime.',
    details: [
      'Agrupe o cabelo em 3 seções: Franja, Laterais e Fundo.',
      'Adicione uma faixa curva de brilho especular no topo da cabeça.',
      'Evite desenhar fios de cabelo individuais de 1px soltos sem forma.'
    ],
    tipsDragonArt: 'Use a ferramenta de preenchimento com rampa de cor do WyrmPIXEL para dar volume imediato ao cabelo.'
  },
  {
    id: 'hands-feet-pixels',
    number: 62,
    title: 'Desenhando Mãos, Gestos e Pés em Poucos Pixels',
    category: 'personagens',
    categoryName: '🛡️ Personagens & Armaduras',
    image: '/ebook/Pixel_art_tutorial_hands_feet_202607252337.jpeg',
    summary: 'Simplifique mãos e pés em pequenos conjuntos de pixels expressivos.',
    details: [
      'Mão fechada (punho) vira um bloco quadriculado de 3x3 ou 4x4 pixels.',
      'Mão aberta indica os 4 dedos agrupados e o polegar separado.',
      'Pés usam formato trapezoidal inclinado na direção do chão.'
    ],
    tipsDragonArt: 'Consulte o banco de ícones de mãos e botas embutido no Dragon Art.'
  },
  {
    id: 'head-construction-rotation',
    number: 63,
    title: 'Construção da Cabeça e Rotação 360°',
    category: 'personagens',
    categoryName: '🛡️ Personagens & Armaduras',
    image: '/ebook/Pixel_art_tutorial_head_construction_202607252337.jpeg',
    summary: 'Como girar a cabeça do personagem em 8 direções mantendo a coerência.',
    details: [
      'Use a esfera base e adicione o queixo em formato de cunha.',
      'A linha dos olhos fica exatamente na metade da altura da cabeça.',
      'As orelhas alinham-se entre a linha dos olhos e o nariz.'
    ],
    tipsDragonArt: 'Use o grid de simetria e alinhamento do WyrmPIXEL para girar cabeças.'
  },
  {
    id: 'silhouettes-recognition',
    number: 64,
    title: 'Silhuetas Marcantes e Reconhecimento Instantâneo',
    category: 'fundamentos',
    categoryName: '✦ Fundamentos & Linhas',
    image: '/ebook/Pixel_art_tutorial_silhouettes_concept_202607252337.jpeg',
    summary: 'Preencha o personagem totalmente de preto para testar se ele é reconhecível de longe.',
    details: [
      'Se a silhueta totalmente preta não for identificável, o design precisa de ajustes.',
      'Projete armas, capas e chifres para fora da linha do corpo.',
      'Mantenha espaços vazios entre braços e tronco para clareza.'
    ],
    tipsDragonArt: 'Alterne o modo Silhouette View com 1 clique na barra de ferramentas do Dragon Art.'
  },
  {
    id: 'subpixel-micro-animation',
    number: 65,
    title: 'Micro-Animação em Subpixel para Respirar e Flutuar',
    category: 'animacao',
    categoryName: '🏃 Animação & Movimento',
    image: '/ebook/Pixel_art_tutorial_sub-pixel_animation_202607252337.jpeg',
    summary: 'Animações ultra suaves de flutuação e respiração alterando tons de cor.',
    details: [
      'Alterne o tom do contorno superior em 1 nível para simular elevação de 0.5px.',
      'Perfeito para magias flutuantes, poções balançando e respiração de peito.',
      'Economiza tempo sem precisar redesenhar o sprite inteiro.'
    ],
    tipsDragonArt: 'Use a ferramenta de ajuste fino de tom no WyrmPIXEL para criar micro-animações em subpixel.'
  },
  {
    id: 'skeleton-stickman-method',
    number: 66,
    title: 'Método do Esqueleto Stickman para Animação de Poses',
    category: 'animacao',
    categoryName: '🏃 Animação & Movimento',
    image: '/ebook/Skeleton_method_character_posing_202607252337.jpeg',
    summary: 'Rascunhe a estrutura óssea em palitos de 1px antes de desenhar o corpo e roupas.',
    details: [
      'Marque articulações de ombros, cotovelos, quadril e joelhos com pontos de 1px.',
      'Testar a fluidez do salto ou ataque no palito antes de investir tempo nos detalhes.',
      'Garanta que a coluna vertebral tenha curvatura flexível.'
    ],
    tipsDragonArt: 'Utilize a camada de Esqueleto com cor brilhante no WyrmPIXEL e desenhe o personagem por cima em outra camada.'
  }
];

export const CATEGORIES = [
  { id: 'todos', label: '📖 Todos os Capítulos (66)', icon: BookOpen },
  { id: 'fundamentos', label: '✦ Fundamentos & Linhas', icon: Sparkles },
  { id: 'cores', label: '🎨 Cores & Luz', icon: Palette },
  { id: 'texturas', label: '🧱 Texturas & Materiais', icon: Shield },
  { id: 'personagens', label: '🛡️ Personagens & Armaduras', icon: Flame },
  { id: 'cenarios', label: '🏰 Cenários & Perspectiva', icon: Compass },
  { id: 'vfx', label: '✨ Efeitos Especiais (VFX)', icon: Wand2 },
  { id: 'animacao', label: '🏃 Animação & Movimento', icon: Sun },
  { id: 'ui', label: '💻 UI & Interface', icon: Cpu }
];

interface EbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EbookModal: React.FC<EbookModalProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [zoomTitle, setZoomTitle] = useState<string>('');

  const filteredChapters = useMemo(() => {
    return EBOOK_CHAPTERS.filter(ch => {
      return selectedCategory === 'todos' || ch.category === selectedCategory;
    });
  }, [selectedCategory]);

  if (!isOpen) return null;

  const currentZoomIndex = zoomImage 
    ? EBOOK_CHAPTERS.findIndex(c => c.image === zoomImage) 
    : -1;

  const handleNextZoom = () => {
    if (currentZoomIndex >= 0 && currentZoomIndex < EBOOK_CHAPTERS.length - 1) {
      const nextCh = EBOOK_CHAPTERS[currentZoomIndex + 1];
      setZoomImage(nextCh.image);
      setZoomTitle(`Capítulo ${nextCh.number}: ${nextCh.title}`);
      sound.playClick();
    }
  };

  const handlePrevZoom = () => {
    if (currentZoomIndex > 0) {
      const prevCh = EBOOK_CHAPTERS[currentZoomIndex - 1];
      setZoomImage(prevCh.image);
      setZoomTitle(`Capítulo ${prevCh.number}: ${prevCh.title}`);
      sound.playClick();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[6000] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-2xl overflow-hidden">
        
        {/* Modal Principal do E-Book */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-6xl h-[92vh] bg-gradient-to-b from-[#14141e] via-[#0d0d14] to-[#08080c] rounded-[36px] border border-amber-500/30 shadow-[0_0_80px_rgba(245,158,11,0.15)] flex flex-col overflow-hidden relative"
        >
          {/* Fundo com Brilho Mágico de Ouro */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

          {/* Header do E-Book - SEM BARRA DE PESQUISA */}
          <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between gap-4 shrink-0 bg-black/40 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl text-black font-black shadow-lg shadow-amber-500/20 shrink-0">
                <BookOpen size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30 tracking-widest">
                    LIVRO OFICIAL DRAGON ART
                  </span>
                  <span className="text-[10px] font-bold text-white/50">66 Capítulos Ilustrados</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5 uppercase">
                  O Guia Mestre do Pixel Art 🐉📖
                </h2>
              </div>
            </div>

            {/* Botão Fechar */}
            <button 
              onClick={() => { sound.playClick(); onClose(); }}
              className="p-3 bg-white/5 hover:bg-red-500/20 hover:border-red-500/40 text-white/70 hover:text-red-400 rounded-2xl border border-white/10 transition-all active:scale-95 shrink-0 flex items-center gap-2 font-bold text-xs"
              title="Fechar E-Book (Esc)"
            >
              <span>Fechar</span>
              <X size={20} />
            </button>
          </div>

          {/* Categorias (Abas Horizontais) */}
          <div className="px-4 py-3 border-b border-white/5 bg-black/20 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { sound.playClick(); setSelectedCategory(cat.id); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isActive 
                      ? 'bg-amber-400 text-black border-amber-400 font-black shadow-lg shadow-amber-400/20 scale-105' 
                      : 'bg-white/5 text-white/70 border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Conteúdo Principal: Grid com os 66 Capítulos */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChapters.map((chapter) => (
                <motion.div 
                  key={chapter.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#12121c]/90 hover:bg-[#161624] rounded-3xl border border-white/10 hover:border-amber-400/50 transition-all duration-300 shadow-xl flex flex-col overflow-hidden group relative"
                >
                  {/* Imagem do Capítulo com Botão de Zoom */}
                  <div 
                    className="relative aspect-[4/3] bg-black/60 overflow-hidden cursor-pointer group/img border-b border-white/10"
                    onClick={() => {
                      sound.playClick();
                      setZoomImage(chapter.image);
                      setZoomTitle(`Capítulo ${chapter.number}: ${chapter.title}`);
                    }}
                  >
                    <img 
                      src={chapter.image} 
                      alt={chapter.title} 
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Badge do Número do Capítulo */}
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-amber-400 text-[10px] font-black px-3 py-1 rounded-full border border-amber-400/40 tracking-wider flex items-center gap-1 shadow-lg">
                      <Bookmark size={11} className="fill-amber-400" />
                      CAPÍTULO {chapter.number}
                    </div>

                    {/* Overlay com Ícone de Ampliar */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                      <div className="p-3 bg-amber-400 text-black rounded-full shadow-2xl mb-1 group-hover/img:scale-110 transition-transform">
                        <ZoomIn size={22} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">CLIQUE PARA AMPLIAR ARTE HD</span>
                    </div>
                  </div>

                  {/* Conteúdo Explicativo do Capítulo */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
                        {chapter.categoryName}
                      </span>
                      <h3 className="text-base font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                        {chapter.title}
                      </h3>
                      <p className="text-xs text-gray-300 font-medium leading-relaxed mt-2">
                        {chapter.summary}
                      </p>
                    </div>

                    {/* Detalhes Técnicos em Tópicos */}
                    <div className="space-y-2 bg-black/30 p-3.5 rounded-2xl border border-white/5">
                      <span className="text-[9px] font-black text-white/50 uppercase tracking-wider block mb-1">
                        📌 PONTOS-CHAVE DA TÉCNICA:
                      </span>
                      {chapter.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px] text-gray-300 leading-relaxed font-medium">
                          <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>

                    {/* Dica Prática no Dragon Art */}
                    <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-start gap-2.5">
                      <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-200/90 font-bold leading-relaxed">
                        <strong className="text-amber-300">No Dragon Art:</strong> {chapter.tipsDragonArt}
                      </p>
                    </div>

                    {/* Botão de Ampliar */}
                    <button
                      onClick={() => {
                        sound.playClick();
                        setZoomImage(chapter.image);
                        setZoomTitle(`Capítulo ${chapter.number}: ${chapter.title}`);
                      }}
                      className="w-full py-2.5 bg-white/5 hover:bg-amber-400 hover:text-black text-white font-black text-xs uppercase tracking-wider rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
                    >
                      <ZoomIn size={16} /> Ampliar Imagem em HD
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Rodapé com Contador */}
          <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between gap-4 text-xs font-bold text-white/60 shrink-0">
            <span>Exibindo {filteredChapters.length} de 66 capítulos ilustrados</span>
            <span className="text-amber-400 font-black">Dragon Art & WyrmPIXEL Book Studio v1.16.0</span>
          </div>
        </motion.div>
      </div>

      {/* Lightbox / Zoom da Imagem em Tela Cheia com Navegação */}
      {zoomImage && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-[7000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-6"
          onClick={() => setZoomImage(null)}
        >
          {/* Header do Zoom */}
          <div className="w-full max-w-5xl flex items-center justify-between gap-4 text-white z-10" onClick={e => e.stopPropagation()}>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">MODO VISUALIZAÇÃO EM HD</span>
              <h3 className="text-base sm:text-lg font-black text-white drop-shadow-md">{zoomTitle}</h3>
            </div>
            <button 
              onClick={() => { sound.playClick(); setZoomImage(null); }}
              className="p-3 bg-white/10 hover:bg-red-500 text-white rounded-full transition-all active:scale-95 shadow-2xl flex items-center gap-2 font-bold text-xs"
              title="Fechar Zoom"
            >
              <span>Fechar</span>
              <X size={20} />
            </button>
          </div>

          {/* Imagem Ampliada com Controles de Navegação */}
          <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <motion.img 
              key={zoomImage}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 25 }}
              src={zoomImage} 
              alt={zoomTitle} 
              className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 image-pixelated"
            />

            {/* Seta Anterior */}
            {currentZoomIndex > 0 && (
              <button 
                onClick={handlePrevZoom}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3.5 bg-black/80 hover:bg-amber-400 hover:text-black text-white rounded-full border border-white/20 shadow-2xl transition-all active:scale-95"
                title="Capítulo Anterior"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Seta Próxima */}
            {currentZoomIndex < EBOOK_CHAPTERS.length - 1 && (
              <button 
                onClick={handleNextZoom}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3.5 bg-black/80 hover:bg-amber-400 hover:text-black text-white rounded-full border border-white/20 shadow-2xl transition-all active:scale-95"
                title="Próximo Capítulo"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Footer do Zoom */}
          <div className="text-center text-xs font-bold text-white/60 z-10" onClick={e => e.stopPropagation()}>
            <span>Pressione <kbd className="px-2 py-1 bg-white/10 rounded text-amber-400">ESC</kbd> ou toque fora para sair. Use as setas para navegar pelos 66 capítulos.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
