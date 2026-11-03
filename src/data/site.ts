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

export const classifications = [
  { digit: 0, size: 'Small', colors: ['Red', 'Violet'] },
  { digit: 1, size: 'Small', colors: ['Green'] },
  { digit: 2, size: 'Small', colors: ['Red'] },
  { digit: 3, size: 'Small', colors: ['Green'] },
  { digit: 4, size: 'Small', colors: ['Red'] },
  { digit: 5, size: 'Big', colors: ['Green', 'Violet'] },
  { digit: 6, size: 'Big', colors: ['Red'] },
  { digit: 7, size: 'Big', colors: ['Green'] },
  { digit: 8, size: 'Big', colors: ['Red'] },
  { digit: 9, size: 'Big', colors: ['Green'] },
] as const;
