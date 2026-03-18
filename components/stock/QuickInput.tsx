'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Send, Undo2, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { parseQuickInput, operatorToMovementType } from '@/lib/stock/calculator';
import { toast } from 'sonner';

export default function QuickInput() {
  const [value, setValue] = useState('');
  const [recentInputs, setRecentInputs] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    const movements = parseQuickInput(value);

    if (movements.length === 0) {
      toast.error('Formato no reconocido. Usa: +10 salsa, -2 vino');
      return;
    }

    const descriptions = movements.map(m => {
      const typeLabels: Record<string, string> = {
        entry: 'Entrada',
        exit: 'Salida',
        loss: 'Pérdida',
        adjustment: 'Ajuste',
      };
      const type = operatorToMovementType(m.operator);
      return `${typeLabels[type]}: ${m.quantity} ${m.productQuery}`;
    });

    toast.success(
      `${movements.length} movimiento${movements.length > 1 ? 's' : ''} registrado${movements.length > 1 ? 's' : ''}`,
      {
        description: descriptions.join(' · '),
        action: {
          label: 'Deshacer',
          onClick: () => {
            toast.info('Movimiento(s) deshecho(s)');
          },
        },
        duration: 5000,
      }
    );

    setRecentInputs(prev => [value, ...prev].slice(0, 5));
    setValue('');
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Zap className="w-4 h-4 text-accent-primary" />
        </div>
        <input
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="+10 salsa, -2 vino, =15 cerveza..."
          className={cn(
            'w-full pl-10 pr-12 py-3 rounded-full',
            'bg-transparent border border-accent-primary/30 text-text-primary',
            'placeholder:text-text-tertiary text-sm',
            'focus:outline-none focus:border-accent-primary focus:shadow-glow',
            'transition-all duration-200'
          )}
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2',
            'w-8 h-8 rounded-full flex items-center justify-center',
            'transition-all duration-200',
            value.trim()
              ? 'bg-accent-primary text-text-on-accent'
              : 'bg-bg-elevated text-text-tertiary'
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Helper text */}
      <div className="flex flex-wrap gap-2 px-2">
        {[
          { op: '+', label: 'entrada', color: 'text-status-success' },
          { op: '-', label: 'salida', color: 'text-status-warning' },
          { op: '=', label: 'ajustar a', color: 'text-status-info' },
          { op: '!', label: 'pérdida', color: 'text-status-error' },
        ].map(h => (
          <span key={h.op} className="text-[10px] text-text-tertiary">
            <span className={cn('font-mono font-bold', h.color)}>{h.op}</span> {h.label}
          </span>
        ))}
      </div>

      {/* Recent inputs */}
      <AnimatePresence>
        {recentInputs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-wrap gap-2"
          >
            {recentInputs.map((input, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setValue(input)}
                className="text-xs px-3 py-1 rounded-full bg-bg-elevated text-text-secondary hover:bg-bg-card-hover transition-colors"
              >
                {input}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
