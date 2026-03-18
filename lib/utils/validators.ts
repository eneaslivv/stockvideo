import type { MovementType, MovementSource } from '@/types';

export function isValidMovementType(type: string): type is MovementType {
  return ['entry', 'exit', 'loss', 'adjustment'].includes(type);
}

export function isValidMovementSource(source: string): source is MovementSource {
  return ['audio', 'video', 'manual', 'quick'].includes(source);
}

export function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity !== 0;
}

export function sanitizeProductName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}
