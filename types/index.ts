// ─── Shared Type Definitions ────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface Feature {
  title: string;
  description: string;
  icon: 'curve' | 'network' | 'chain' | 'fee';
}

export interface Step {
  number: number;
  title: string;
  description: string;
}

export interface Stat {
  label: string;
  value: string;
  illustrative?: boolean;
  icon?: string;
  bgClass?: string;
  textClass?: string;
}
