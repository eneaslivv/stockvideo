'use client';

import { motion } from 'framer-motion';
import { Mic, Video, Keyboard, Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { StockMovement } from '@/types';
import { relativeTime, getMovementSign, getMovementColor, getMovementBadgeClass } from '@/lib/utils/formatters';

interface RecentActivityProps {
  movements: StockMovement[];
  loading?: boolean;
}

const sourceIcons: Record<string, React.ElementType> = {
  audio: Mic,
  video: Video,
  manual: Keyboard,
  quick: Zap,
};

const typeLabels: Record<string, string> = {
  entry: 'Entrada',
  exit: 'Salida',
  loss: 'Pérdida',
  adjustment: 'Ajuste',
};

export default function RecentActivity({ movements, loading }: RecentActivityProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-text-primary">Actividad Reciente</h3>
          <span className="section-label">últimos movimientos</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-32" />
                <div className="skeleton h-2 w-20" />
              </div>
              <div className="skeleton h-6 w-12" />
            </div>
          ))}
        </div>
      ) : movements.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-text-tertiary text-sm">No hay movimientos recientes</p>
          <p className="text-text-tertiary text-xs mt-1">Registra tu primer movimiento por audio o manual</p>
        </div>
      ) : (
        <div className="space-y-1">
          {movements.map((movement, i) => {
            const SourceIcon = sourceIcons[movement.source] || Keyboard;
            const sign = getMovementSign(movement.type);

            return (
              <motion.div
                key={movement.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-elevated transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center flex-shrink-0">
                  <SourceIcon className="w-4 h-4 text-text-tertiary" strokeWidth={1.5} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary truncate">
                      {(movement.product as unknown as { name: string })?.name || 'Producto'}
                    </span>
                    <span className={cn('text-[10px]', getMovementBadgeClass(movement.type))}>
                      {typeLabels[movement.type]}
                    </span>
                  </div>
                  <span className="text-xs text-text-tertiary">{relativeTime(movement.created_at)}</span>
                </div>

                <span className={cn('font-mono font-semibold text-sm', getMovementColor(movement.type))}>
                  {sign}{movement.quantity}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
