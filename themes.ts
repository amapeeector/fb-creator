export interface Theme {
  id: string;
  name: string;
  colors: {
    '--bg-main': string;
    '--bg-panel': string;
    '--bg-element': string;
    '--border': string;
    '--text-main': string;
    '--text-sec': string;
    '--text-dim': string;
    '--text-muted': string;
    '--primary': string;
    '--primary-hover': string;
    '--primary-dim': string;
    '--danger': string;
    '--danger-dim': string;
    '--success': string;
    '--success-dim': string;
    '--warning': string;
    '--warning-dim': string;
  };
}

export const THEMES: Theme[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    colors: {
      '--bg-main': '#020617',
      '--bg-panel': '#0f172a',
      '--bg-element': '#1e293b',
      '--border': '#334155',
      '--text-main': '#e2e8f0',
      '--text-sec': '#cbd5e1',
      '--text-dim': '#94a3b8',
      '--text-muted': '#64748b',
      '--primary': '#06b6d4', // Cyan
      '--primary-hover': '#22d3ee',
      '--primary-dim': '#083344',
      '--danger': '#fb7185',
      '--danger-dim': '#450a0a',
      '--success': '#34d399',
      '--success-dim': '#052e16',
      '--warning': '#fbbf24',
      '--warning-dim': '#451a03',
    }
  },
  {
    id: 'forest',
    name: 'Deep Forest',
    colors: {
      '--bg-main': '#022c22',
      '--bg-panel': '#064e3b',
      '--bg-element': '#065f46',
      '--border': '#115e59',
      '--text-main': '#ecfdf5',
      '--text-sec': '#d1fae5',
      '--text-dim': '#6ee7b7',
      '--text-muted': '#34d399',
      '--primary': '#facc15', // Gold
      '--primary-hover': '#fde047',
      '--primary-dim': '#422006',
      '--danger': '#f87171',
      '--danger-dim': '#450a0a',
      '--success': '#4ade80',
      '--success-dim': '#052e16',
      '--warning': '#fb923c',
      '--warning-dim': '#431407',
    }
  },
  {
    id: 'midnight',
    name: 'Midnight Purple',
    colors: {
      '--bg-main': '#1e1b4b',
      '--bg-panel': '#312e81',
      '--bg-element': '#3730a3',
      '--border': '#4338ca',
      '--text-main': '#e0e7ff',
      '--text-sec': '#c7d2fe',
      '--text-dim': '#a5b4fc',
      '--text-muted': '#818cf8',
      '--primary': '#c084fc', // Purple
      '--primary-hover': '#d8b4fe',
      '--primary-dim': '#3b0764',
      '--danger': '#f472b6',
      '--danger-dim': '#500724',
      '--success': '#4ade80',
      '--success-dim': '#052e16',
      '--warning': '#fbbf24',
      '--warning-dim': '#451a03',
    }
  },
  {
    id: 'coffee',
    name: 'Espresso',
    colors: {
      '--bg-main': '#271c19', // Very dark brown
      '--bg-panel': '#451a03', // Dark brown
      '--bg-element': '#572e16',
      '--border': '#78350f',
      '--text-main': '#fef3c7', // Cream
      '--text-sec': '#fde68a',
      '--text-dim': '#d4d4d4',
      '--text-muted': '#a8a29e',
      '--primary': '#f59e0b', // Amber
      '--primary-hover': '#fbbf24',
      '--primary-dim': '#451a03',
      '--danger': '#f87171',
      '--danger-dim': '#450a0a',
      '--success': '#84cc16',
      '--success-dim': '#1a2e05',
      '--warning': '#eab308',
      '--warning-dim': '#422006',
    }
  },
  {
    id: 'matrix',
    name: 'Matrix',
    colors: {
      '--bg-main': '#000000',
      '--bg-panel': '#020602',
      '--bg-element': '#052e16',
      '--border': '#14532d',
      '--text-main': '#4ade80',
      '--text-sec': '#22c55e',
      '--text-dim': '#16a34a',
      '--text-muted': '#15803d',
      '--primary': '#00ff00', // Bright Green
      '--primary-hover': '#86efac',
      '--primary-dim': '#064e3b',
      '--danger': '#ef4444',
      '--danger-dim': '#450a0a',
      '--success': '#00ff00',
      '--success-dim': '#052e16',
      '--warning': '#eab308',
      '--warning-dim': '#422006',
    }
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    colors: {
      '--bg-main': '#042f2e',
      '--bg-panel': '#115e59',
      '--bg-element': '#134e4a',
      '--border': '#2dd4bf',
      '--text-main': '#ccfbf1',
      '--text-sec': '#99f6e4',
      '--text-dim': '#5eead4',
      '--text-muted': '#2dd4bf',
      '--primary': '#22d3ee', // Cyan
      '--primary-hover': '#67e8f9',
      '--primary-dim': '#164e63',
      '--danger': '#fda4af',
      '--danger-dim': '#4c0519',
      '--success': '#6ee7b7',
      '--success-dim': '#064e3b',
      '--warning': '#fdba74',
      '--warning-dim': '#431407',
    }
  },
  {
    id: 'dracula',
    name: 'Dracula',
    colors: {
      '--bg-main': '#282a36',
      '--bg-panel': '#44475a',
      '--bg-element': '#6272a4',
      '--border': '#6272a4',
      '--text-main': '#f8f8f2',
      '--text-sec': '#bfbfbf',
      '--text-dim': '#8b8b8b',
      '--text-muted': '#6272a4',
      '--primary': '#ff79c6', // Pink
      '--primary-hover': '#ff92d0',
      '--primary-dim': '#521d3a',
      '--danger': '#ff5555',
      '--danger-dim': '#5c1010',
      '--success': '#50fa7b',
      '--success-dim': '#104a20',
      '--warning': '#f1fa8c',
      '--warning-dim': '#575a0c',
    }
  },
  {
    id: 'royal',
    name: 'Royal Gold',
    colors: {
      '--bg-main': '#171717',
      '--bg-panel': '#262626',
      '--bg-element': '#404040',
      '--border': '#a16207',
      '--text-main': '#fafaf9',
      '--text-sec': '#e7e5e4',
      '--text-dim': '#a8a29e',
      '--text-muted': '#78716c',
      '--primary': '#eab308', // Gold
      '--primary-hover': '#facc15',
      '--primary-dim': '#422006',
      '--danger': '#dc2626',
      '--danger-dim': '#450a0a',
      '--success': '#16a34a',
      '--success-dim': '#052e16',
      '--warning': '#ca8a04',
      '--warning-dim': '#422006',
    }
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    colors: {
      '--bg-main': '#0a0a0a',
      '--bg-panel': '#171717',
      '--bg-element': '#262626',
      '--border': '#404040',
      '--text-main': '#ffffff',
      '--text-sec': '#e5e5e5',
      '--text-dim': '#a3a3a3',
      '--text-muted': '#737373',
      '--primary': '#ffffff', // White
      '--primary-hover': '#d4d4d4',
      '--primary-dim': '#404040',
      '--danger': '#999999',
      '--danger-dim': '#404040',
      '--success': '#dedede',
      '--success-dim': '#404040',
      '--warning': '#bdbdbd',
      '--warning-dim': '#404040',
    }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      '--bg-main': '#4a044e',
      '--bg-panel': '#701a75',
      '--bg-element': '#86198f',
      '--border': '#a21caf',
      '--text-main': '#fdf4ff',
      '--text-sec': '#fae8ff',
      '--text-dim': '#f0abfc',
      '--text-muted': '#c026d3',
      '--primary': '#f472b6', // Pink/Orange mix
      '--primary-hover': '#fb7185',
      '--primary-dim': '#831843',
      '--danger': '#ef4444',
      '--danger-dim': '#450a0a',
      '--success': '#34d399',
      '--success-dim': '#064e3b',
      '--warning': '#fbbf24',
      '--warning-dim': '#451a03',
    }
  }
];