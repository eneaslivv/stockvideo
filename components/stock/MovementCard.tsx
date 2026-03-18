'use client';

import { motion } from 'framer-motion';
import { Mic, Video, Keyboard, Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { StockMovement } from '@/types';
import { relativeTime, getMovementSign, getMovementColor, getMovementBadgeClass } from '@/lib/utils/formatters';

interface MovementCardProps {
  movement: StockMovement;
  index?: number;
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

export default function MovementCard({ movement, index = 0 }: MovementCardProps) {
  const SourceIcon = sourceIcons[movement.source] || Keyboard;
  const sign = getMovementSign(movement.type);
  const productData = movement.product as unknown as { name: string } | undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card-hover flex items-center gap-4"
    >
      <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center flex-shrink-0">
        <SourceIcon className="w-5 h-5 text-text-tertiary" strokeWidth={1.5} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{productData?.name || 'Producto'}</span>
          <span className={cn('text-[10px]', getMovementBadgeClass(movement.type))}>
            {typeLabels[movement.type]}
          </span>
        </div>
        <span className="text-xs text-text-tertiary">{relativeTime(movement.created_at)}</span>
        {movement.raw_input && (
          <p className="text-xs text-text-tertiary mt-1 truncate">{movement.raw_input}</p>
        )}
      </div>

      <span className={cn('font-mono font-bold text-lg', getMovementColor(movement.type))}>
        {sign}{movement.quantity}
      </span>
    </motion.div>
  );
}
