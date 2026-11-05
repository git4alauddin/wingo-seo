export const site = {
  name: 'WinGo Learning Lab',
  homeTitle: 'WinGo Rules, Colors & Probability Guides | Kalam',
  publisher: 'WinGo Learning Lab project',
  description: 'Learn WinGo rules, number colors, Big and Small, and probability. Explore an independent DmPlay guide, history-chart examples and local educational tools.',
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
  'number-probability', 'patterns-and-randomness', 'historical-analysis', 'dmplay-wingo-guide',
] as const;

export { classifications } from '../lib/model';
