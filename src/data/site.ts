export const site = {
  name: 'WinGo Learning Lab',
  publisher: 'WinGo Learning Lab project',
  description: 'Explore WinGo-style number classifications, probability, and randomness through clear guides and transparent educational models.',
};

export const navigation = [
  { href: '/guides/', label: 'Learn' },
  { href: '/simulator/', label: 'Simulator' },
  { href: '/probability-calculator/', label: 'Calculator' },
  { href: '/about/', label: 'About' },
];

// Kept explicit so published guides cannot accidentally replace a dedicated route.
export const guideSlugs = [
  'what-is-wingo', 'wingo-rules', 'big-small-explained',
  'number-probability', 'patterns-and-randomness', 'historical-analysis',
] as const;

export { classifications } from '../lib/model';
