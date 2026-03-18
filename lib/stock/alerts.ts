import type { StockSummary, StockMovement } from '@/types';

export interface Alert {
  id: string;
  type: 'low_stock' | 'verification_diff' | 'unusual_movement' | 'inactive';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  productId?: string;
  productName?: string;
  actionLabel?: string;
  createdAt: string;
}

export function generateLowStockAlerts(summaries: StockSummary[]): Alert[] {
  return summaries
    .filter(s => s.is_low_stock)
    .map(s => ({
      id: `low-stock-${s.product_id}`,
      type: 'low_stock' as const,
      severity: s.current_stock <= 0 ? 'critical' as const : 'warning' as const,
      title: s.current_stock <= 0 ? 'Sin stock' : 'Stock bajo',
      message: `${s.name}: ${s.current_stock} ${s.unit} (mín: ${s.min_stock})`,
      productId: s.product_id,
      productName: s.name,
      actionLabel: 'Reponer',
      createdAt: new Date().toISOString(),
    }));
}

export function checkUnusualMovement(
  movement: StockMovement,
  averageQuantity: number
): Alert | null {
  if (movement.quantity > averageQuantity * 3) {
    return {
      id: `unusual-${movement.id}`,
      type: 'unusual_movement',
      severity: 'info',
      title: 'Movimiento inusual',
      message: `${movement.quantity} unidades es ${Math.round(movement.quantity / averageQuantity)}x más que el promedio`,
      productId: movement.product_id,
      actionLabel: 'Revisar',
      createdAt: new Date().toISOString(),
    };
  }
  return null;
}
