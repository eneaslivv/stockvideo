import { QuickMovement, MovementType } from '@/types';

export function parseQuickInput(input: string): QuickMovement[] {
  const parts = input.split(',').map(s => s.trim()).filter(Boolean);
  const movements: QuickMovement[] = [];

  for (const part of parts) {
    const match = part.match(/^([+\-=!])(\d+)\s+(.+)$/);
    if (match) {
      movements.push({
        operator: match[1] as QuickMovement['operator'],
        quantity: parseInt(match[2], 10),
        productQuery: match[3].trim(),
      });
    }
  }

  return movements;
}

export function operatorToMovementType(operator: string): MovementType {
  switch (operator) {
    case '+': return 'entry';
    case '-': return 'exit';
    case '=': return 'adjustment';
    case '!': return 'loss';
    default: return 'entry';
  }
}

export function calculateStockFromMovements(
  movements: { type: MovementType; quantity: number }[]
): number {
  return movements.reduce((stock, m) => {
    switch (m.type) {
      case 'entry': return stock + m.quantity;
      case 'exit': return stock - m.quantity;
      case 'loss': return stock - m.quantity;
      case 'adjustment': return stock + m.quantity;
      default: return stock;
    }
  }, 0);
}
