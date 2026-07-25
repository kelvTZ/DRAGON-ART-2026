export interface Theme {
  id: string;
  name: string;
  isAnimated?: boolean;
  animatedClass?: string;
  colors: {
    bgApp: string;
    bgSurface: string;
    bgPanel: string;
    bgElement: string;
    borderSubtle: string;
    borderStrong: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accentColor: string;
  };
}

export const themes: Theme[] = [
  // ==========================================
  // ✦ CORES GRATUITAS (OPACAS, LIMPAS E ELEGANTES)
  // ==========================================
  {
    id: 'clean-dark',
    name: 'Carvão Noturno',
    colors: { bgApp: '#0e0e12', bgSurface: '#16161c', bgPanel: '#1e1e26', bgElement: '#282834', borderSubtle: '#2a2a38', borderStrong: '#3f3f52', textPrimary: '#ffffff', textSecondary: '#a0a5b5', textMuted: '#6b7280', accentColor: '#6366f1' }
  },
  {
    id: 'nord-slate',
    name: 'Ardósia Elegante',
    colors: { bgApp: '#151921', bgSurface: '#1e2430', bgPanel: '#262f3e', bgElement: '#313c4f', borderSubtle: '#2e384b', borderStrong: '#41506b', textPrimary: '#f0f4f8', textSecondary: '#9fb3c8', textMuted: '#627d98', accentColor: '#38bdf8' }
  },
  {
    id: 'marfim-paper',
    name: 'Papel Marfim',
    colors: { bgApp: '#f5f4ef', bgSurface: '#ebe9e0', bgPanel: '#ffffff', bgElement: '#dfdcd0', borderSubtle: '#d8d4c5', borderStrong: '#c2bfae', textPrimary: '#1c1b18', textSecondary: '#4a473d', textMuted: '#787363', accentColor: '#d97706' }
  },
  {
    id: 'emerald-dark',
    name: 'Esmeralda Escura',
    colors: { bgApp: '#08140e', bgSurface: '#0f2319', bgPanel: '#163324', bgElement: '#1f4532', borderSubtle: '#1b3e2d', borderStrong: '#2b5c43', textPrimary: '#ecfdf5', textSecondary: '#a7f3d0', textMuted: '#6ee7b7', accentColor: '#10b981' }
  },
  {
    id: 'sapphire-dark',
    name: 'Safira Profunda',
    colors: { bgApp: '#09101d', bgSurface: '#101a2e', bgPanel: '#172540', bgElement: '#203254', borderSubtle: '#1d2f50', borderStrong: '#2d4674', textPrimary: '#f0f7ff', textSecondary: '#bae6fd', textMuted: '#7dd3fc', accentColor: '#0284c7' }
  },
  {
    id: 'burgundy-dark',
    name: 'Vinho Nobre',
    colors: { bgApp: '#14080c', bgSurface: '#220e14', bgPanel: '#30141d', bgElement: '#421b28', borderSubtle: '#3b1824', borderStrong: '#5c2638', textPrimary: '#fff0f3', textSecondary: '#fecdd3', textMuted: '#fda4af', accentColor: '#e11d48' }
  },
  {
    id: 'clean-light',
    name: 'Neve Pura',
    colors: { bgApp: '#f8fafc', bgSurface: '#f1f5f9', bgPanel: '#ffffff', bgElement: '#e2e8f0', borderSubtle: '#cbd5e1', borderStrong: '#94a3b8', textPrimary: '#0f172a', textSecondary: '#334155', textMuted: '#64748b', accentColor: '#2563eb' }
  },

  // ==========================================
  // 👑 CORES PRO (ANIMADAS & CINEMÁTICAS)
  // ==========================================
  {
    id: 'pro-purple-eclipse',
    name: 'Eclipse Roxo 🌌',
    isAnimated: true,
    animatedClass: 'theme-anim-purple-eclipse',
    colors: { bgApp: '#0d0714', bgSurface: '#170c24', bgPanel: '#231238', bgElement: '#321950', borderSubtle: '#3b1d5e', borderStrong: '#7c3aed', textPrimary: '#ffffff', textSecondary: '#ddd6fe', textMuted: '#a78bfa', accentColor: '#a855f7' }
  },
  {
    id: 'pro-aurora-borealis',
    name: 'Aurora Boreal ✨',
    isAnimated: true,
    animatedClass: 'theme-anim-aurora',
    colors: { bgApp: '#061314', bgSurface: '#0b2426', bgPanel: '#103538', bgElement: '#184b50', borderSubtle: '#1d5b61', borderStrong: '#2dd4bf', textPrimary: '#f0fdf4', textSecondary: '#99f6e4', textMuted: '#5eead4', accentColor: '#14b8a6' }
  },
  {
    id: 'pro-cyber-pulse',
    name: 'Pulso Cyberpunk ⚡',
    isAnimated: true,
    animatedClass: 'theme-anim-cyber-pulse',
    colors: { bgApp: '#120418', bgSurface: '#20082c', bgPanel: '#300a42', bgElement: '#460e5f', borderSubtle: '#521070', borderStrong: '#f43f5e', textPrimary: '#ffffff', textSecondary: '#f472b6', textMuted: '#ec4899', accentColor: '#00f0ff' }
  },
  {
    id: 'pro-cosmic-nebula',
    name: 'Neblina Cósmica 🪐',
    isAnimated: true,
    animatedClass: 'theme-anim-cosmic-nebula',
    colors: { bgApp: '#0b0a1a', bgSurface: '#14122e', bgPanel: '#1f1c46', bgElement: '#2b2762', borderSubtle: '#332e75', borderStrong: '#818cf8', textPrimary: '#f5f3ff', textSecondary: '#c7d2fe', textMuted: '#a5b4fc', accentColor: '#6366f1' }
  },
  {
    id: 'pro-dragon-fire',
    name: 'Chama Dracônica 🔥',
    isAnimated: true,
    animatedClass: 'theme-anim-dragon-fire',
    colors: { bgApp: '#170505', bgSurface: '#290909', bgPanel: '#3d0d0d', bgElement: '#571313', borderSubtle: '#661616', borderStrong: '#f97316', textPrimary: '#fff7ed', textSecondary: '#ffedd5', textMuted: '#fdba74', accentColor: '#ef4444' }
  },
  {
    id: 'pro-ocean-abyss',
    name: 'Abismo Oceânico 🌊',
    isAnimated: true,
    animatedClass: 'theme-anim-ocean-abyss',
    colors: { bgApp: '#04121a', bgSurface: '#082130', bgPanel: '#0c3147', bgElement: '#124563', borderSubtle: '#155276', borderStrong: '#38bdf8', textPrimary: '#f0f9ff', textSecondary: '#bae6fd', textMuted: '#7dd3fc', accentColor: '#0ea5e9' }
  },
  {
    id: 'pro-royal-gold',
    name: 'Ouro Imperador 👑',
    isAnimated: true,
    animatedClass: 'theme-anim-royal-gold',
    colors: { bgApp: '#161104', bgSurface: '#261e07', bgPanel: '#382d0b', bgElement: '#4f3f10', borderSubtle: '#5e4b13', borderStrong: '#fbbf24', textPrimary: '#fffbeb', textSecondary: '#fef3c7', textMuted: '#fde68a', accentColor: '#f59e0b' }
  },
  {
    id: 'pro-matrix-flow',
    name: 'Fluxo Matriz 🧬',
    isAnimated: true,
    animatedClass: 'theme-anim-matrix-flow',
    colors: { bgApp: '#021206', bgSurface: '#05220c', bgPanel: '#083312', bgElement: '#0c471a', borderSubtle: '#0f5820', borderStrong: '#22c55e', textPrimary: '#f0fdf4', textSecondary: '#bbf7d0', textMuted: '#86efac', accentColor: '#10b981' }
  }
];

export const FREE_THEME_IDS: ReadonlySet<string> = new Set([
  'clean-dark',
  'nord-slate',
  'marfim-paper',
  'emerald-dark',
  'sapphire-dark',
  'burgundy-dark',
  'clean-light'
]);

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const body = document.body;

  // Set CSS Variables
  root.style.setProperty('--bg-app', theme.colors.bgApp);
  root.style.setProperty('--bg-surface', theme.colors.bgSurface);
  root.style.setProperty('--bg-panel', theme.colors.bgPanel);
  root.style.setProperty('--bg-element', theme.colors.bgElement);
  root.style.setProperty('--border-subtle', theme.colors.borderSubtle);
  root.style.setProperty('--border-strong', theme.colors.borderStrong);
  root.style.setProperty('--text-primary', theme.colors.textPrimary);
  root.style.setProperty('--text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--text-muted', theme.colors.textMuted);
  root.style.setProperty('--accent-color', theme.colors.accentColor);

  root.setAttribute('data-theme-id', theme.id);

  // Remove existing animated theme classes
  const animClasses = [
    'theme-anim-purple-eclipse',
    'theme-anim-aurora',
    'theme-anim-cyber-pulse',
    'theme-anim-cosmic-nebula',
    'theme-anim-dragon-fire',
    'theme-anim-ocean-abyss',
    'theme-anim-royal-gold',
    'theme-anim-matrix-flow'
  ];
  animClasses.forEach(c => body.classList.remove(c));

  // Add animated class if PRO theme
  if (theme.isAnimated && theme.animatedClass) {
    body.classList.add(theme.animatedClass);
  }
}
