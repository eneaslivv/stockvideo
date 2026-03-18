'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Package, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { StockSummary } from '@/types';

interface AlertPanelProps {
  lowStockItems: StockSummary[];
  loading?: boolean;
}

export default function AlertPanel({ lowStockItems, loading }: AlertPanelProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-text-primary">Stock Bajo</h3>
          <span className="section-label">alertas activas</span>
        </div>
        {lowStockItems.length > 0 && (
          <span className="badge-error">{lowStockItems.length}</span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-lg" />
          ))}
        </div>
      ) : lowStockItems.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-status-success/10 flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6 text-status-success" />
          </div>
          <p className="text-text-tertiary text-sm">Todo el stock está en orden</p>
        </div>
      ) : (
        <div className="space-y-2">
          {lowStockItems.map((item, i) => (
            <motion.div
              key={item.product_id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg bg-bg-elevated',
                'border-l-2',
                item.current_stock <= 0 ? 'border-l-status-error' : 'border-l-status-warning'
              )}
            >
              <AlertTriangle
                className={cn(
                  'w-4 h-4 flex-shrink-0',
                  item.current_stock <= 0 ? 'text-status-error' : 'text-status-warning'
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                <p className="text-xs text-text-tertiary">
                  {item.current_stock} / {item.min_stock} {item.unit}
                </p>
              </div>
              <button className="flex items-center gap-1 text-xs text-accent-primary hover:underline">
                Reponer <ArrowRight className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
