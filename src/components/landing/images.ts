/**
 * Landing Page Image Configuration
 *
 * Slots map to image metadata or null.
 * When src is null, PhotoFrame renders an institutional placeholder block.
 *
 * NOTE: Photos showing students require written consent from John B. Lacson
 * Colleges Foundation - Bacolod (Data Privacy Act of 2012 / school media policy).
 * Never use stock photos or unverified imagery of students.
 */

export type ImageSlot =
  | 'hero-campus'
  | 'howitworks-scanner'
  | 'roles-teacher'
  | 'roles-student'
  | 'final-cta-bg';

export interface ImageConfig {
  src: string | null;
  alt: string;
  width: number;
  height: number;
  label: string;
  objectPosition?: string;
  priority?: boolean;
}

export const LANDING_IMAGES: Record<ImageSlot, ImageConfig> = {
  'hero-campus': {
    src: null,
    alt: 'John B. Lacson Colleges Foundation – Bacolod campus entrance and grounds',
    width: 1200,
    height: 960,
    label: 'JBLCF photo: campus',
    objectPosition: 'center',
    priority: true,
  },
  'howitworks-scanner': {
    src: null,
    alt: 'Classroom barcode scanner reading cadet identification card',
    width: 800,
    height: 600,
    label: 'JBLCF photo: scanner station',
    objectPosition: 'center',
  },
  'roles-teacher': {
    src: null,
    alt: 'Faculty member reviewing attendance roster on classroom terminal',
    width: 800,
    height: 600,
    label: 'JBLCF photo: faculty',
    objectPosition: 'center',
  },
  'roles-student': {
    src: null,
    alt: 'Cadets scanning ID cards during morning muster',
    width: 800,
    height: 600,
    label: 'JBLCF photo: cadets',
    objectPosition: 'center',
  },
  'final-cta-bg': {
    src: null,
    alt: '',
    width: 1920,
    height: 600,
    label: 'JBLCF photo: aerial',
    objectPosition: 'center',
  },
};
