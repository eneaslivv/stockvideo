'use client';

import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { StockSummary } from '@/types';

interface StockTableProps {
  items: StockSummary[];
  loading?: boolean;
}

export default function StockTable({ items, loading }: StockTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-14 rounded-lg" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <Package className="w-10 h-10 text-text-tertiary/30 mx-auto mb-3" />
        <p className="text-sm text-text-tertiary">No hay productos</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-text-tertiary text-xs uppercase tracking-wider">
            <th className="pb-3 pl-4">Producto</th>
            <th className="pb-3">Categoría</th>
            <th className="pb-3 text-right">Stock</th>
            <th className="pb-3 text-right pr-4">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {items.map((item, i) => (
            <motion.tr
              key={item.product_id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="hover:bg-bg-elevated/50 transition-colors"
            >
              <td className="py-3 pl-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-bg-elevated flex items-center justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-full h-full rounded object-cover" />
                    ) : (
                      <Package className="w-4 h-4 text-text-tertiary/50" />
                    )}
                  </div>
                  <span className="font-medium">{item.name}</span>
                </div>
              </td>
              <td className="py-3">
                {item.category && <span className="badge-accent">{item.category}</span>}
              </td>
              <td className="py-3 text-right font-mono font-semibold">
                {item.current_stock} <span className="text-text-tertiary font-normal">{item.unit}</span>
              </td>
              <td className="py-3 text-right pr-4">
                <span className={cn(
                  'w-2 h-2 rounded-full inline-block',
                  item.current_stock <= 0 ? 'bg-status-error' :
                  item.is_low_stock ? 'bg-status-warning' : 'bg-status-success'
                )} />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
