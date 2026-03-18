'use client';

import { motion } from 'framer-motion';
import { Mic, Zap, Video, PackagePlus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface QuickActionsProps {
  onAudioOpen: () => void;
  onQuickInput: () => void;
  onVideoOpen: () => void;
  onNewProduct: () => void;
}

const actions = [
  { id: 'audio', label: 'Registrar por Audio', icon: Mic, variant: 'accent' as const },
  { id: 'quick', label: 'Modo Rápido', icon: Zap, variant: 'outline' as const },
  { id: 'video', label: 'Verificar Stock', icon: Video, variant: 'outline' as const },
  { id: 'product', label: 'Nuevo Producto', icon: PackagePlus, variant: 'outline' as const },
];

export default function QuickActions({ onAudioOpen, onQuickInput, onVideoOpen, onNewProduct }: QuickActionsProps) {
  const handlers: Record<string, () => void> = {
    audio: onAudioOpen,
    quick: onQuickInput,
    video: onVideoOpen,
    product: onNewProduct,
  };

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handlers[action.id]}
            className={cn(
              'flex items-center gap-2 text-sm',
              action.variant === 'accent'
                ? 'btn-accent relative overflow-hidden'
                : 'btn-outline'
            )}
          >
            <Icon className="w-4 h-4" strokeWidth={1.5} />
            {action.label}
            {action.id === 'audio' && (
              <span className="absolute inset-0 rounded-full animate-ping bg-accent-primary/20" />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
