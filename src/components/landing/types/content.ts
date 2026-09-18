/** Shared content shapes used by the local data files in `src/components/landing/data`. */

export interface CompanyLogo {
  name: string;
  src: string;
  width: number;
  height: number;
}

export interface ProofStat {
  from: number;
  to: number;
  suffix: string;
  label: string;
}

export interface ValueProp {
  title: string;
  description: string;
  icon: string;
}

export interface Benefit {
  title: string;
  description: string;
  icon: string;
}

export interface FeatureHighlight {
  label: string;
  icon: string;
}

export interface Capability {
  label: string;
  icon: string;
}

export interface HowToUseStep {
  title: string;
  description: string;
  screen: string;
  screenAlt: string;
}

export interface PricingFeature {
  label: string;
  included: boolean;
}

export interface PricingPlan {
  name: string;
  priceMonthly: string;
  priceYearly: string;
  period: string;
  description: string;
  cta: { label: string; href: string };
  tag?: string;
  features: PricingFeature[];
}

export interface Testimonial {
  name: string;
  avatar: string;
  quote: string;
  category?: string;
  icon?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PolicySection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}
