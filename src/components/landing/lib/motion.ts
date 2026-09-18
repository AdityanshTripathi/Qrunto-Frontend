import type { TargetAndTransition, Transition, Variants } from "motion/react";

export interface AppearSpec {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
}

export const FRAMER_EASE = [0.44, 0, 0.56, 1] as const;

export const spring = (duration: number, delay = 0): Transition => ({
  type: "spring",
  bounce: 0.2,
  duration,
  delay,
});

export const tween = (duration: number, delay = 0): Transition => ({
  type: "tween",
  duration,
  delay,
  ease: [...FRAMER_EASE],
});

export const heroAppear = {
  dots: {
    initial: { opacity: 0.001, scale: 0.5 },
    animate: { opacity: 1, scale: 1, transition: tween(1, 0.1) },
  },
  tag: {
    initial: { opacity: 0.001, scale: 0.7 },
    animate: { opacity: 1, scale: 1, transition: spring(0.4, 0) },
  },
  headline: {
    initial: { opacity: 0.001, y: 24 },
    animate: { opacity: 1, y: 0, transition: tween(1, 0.2) },
  },
  paragraphWrap: {
    initial: { opacity: 0.001, scale: 0.5, y: 30 },
    animate: { opacity: 1, scale: 1, y: 0, transition: spring(0.7, 0.5) },
  },
  paragraph: {
    initial: { opacity: 0.001, y: 24 },
    animate: { opacity: 1, y: 0, transition: tween(1, 0.2) },
  },
  ctaButton: {
    initial: { opacity: 0.001, scale: 0.5, y: 30 },
    animate: { opacity: 1, scale: 1, y: 0, transition: spring(0.7, 0.7) },
  },
  figmaNote: {
    initial: { opacity: 0.001, scale: 0.5 },
    animate: { opacity: 1, scale: 1, transition: spring(0.7, 0.8) },
  },
  phoneLeft: {
    initial: { opacity: 0.001, scale: 0.5, y: 30, rotate: 0 },
    animate: { opacity: 1, scale: 1, y: 0, rotate: -18, transition: spring(0.7, 0.7) },
  },
  phoneRight: {
    initial: { opacity: 0.001, scale: 0.5, y: 30, rotate: 0 },
    animate: { opacity: 1, scale: 1, y: 0, rotate: 18, transition: spring(0.7, 0.7) },
  },
  phoneCenter: {
    initial: { opacity: 0.001, scale: 0.5, y: 30 },
    animate: { opacity: 1, scale: 1, y: 0, transition: spring(0.7, 0.7) },
  },
  chipEarly: {
    initial: { opacity: 0.001, scale: 0.5, y: 30 },
    animate: { opacity: 1, scale: 1, y: 0, transition: spring(0.7, 0.9) },
  },
  chipLate: {
    initial: { opacity: 0.001, scale: 0.5, y: 30 },
    animate: { opacity: 1, scale: 1, y: 0, transition: spring(0.7, 1.1) },
  },
} satisfies Record<string, AppearSpec>;

export const capabilityReveal = (delay: number): Variants => ({
  hidden: { opacity: 0, scale: 0.8, y: 100 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 150, damping: 50, mass: 1, delay },
  },
});

export const ctaPhoneReveal = (rotate: number): Variants => ({
  hidden: { opacity: 0, scale: 0.5, rotate },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 150, damping: 50, mass: 1, delay: 0.2 },
  },
});

export const washReveal: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { type: "tween", duration: 0.7, delay: 0.2, ease: [0.12, 0.23, 0.5, 1] },
  },
};

export const buttonPress = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.96 },
  transition: { type: "spring", bounce: 0.25, duration: 0.45 },
} as const;
