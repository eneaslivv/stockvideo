'use client';

import { motion } from 'framer-motion';
import { Check, RotateCcw, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getConfidenceColor, formatPercentage } from '@/lib/utils/formatters';

interface VerificationResultProps {
  detected: number;
  systemQuantity: number;
  confidence: number;
  notes: string;
  onAdjust?: () => void;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function VerificationResult({
  detected,
  systemQuantity,
  confidence,
  notes,
  onAdjust,
  onRetry,
  onDismiss,
}: VerificationResultProps) {
  const difference = detected - systemQuantity;
  const hasDifference = difference !== 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-lg bg-bg-elevated">
          <p className="text-xs text-text-tertiary mb-1">Detectado</p>
          <p className="text-2xl font-bold font-mono text-status-success">{detected}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-bg-elevated">
          <p className="text-xs text-text-tertiary mb-1">En sistema</p>
          <p className="text-2xl font-bold font-mono text-text-primary">{systemQuantity}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-bg-elevated">
          <p className="text-xs text-text-tertiary mb-1">Diferencia</p>
          <p className={cn(
            'text-2xl font-bold font-mono',
            difference > 0 ? 'text-status-warning' : difference < 0 ? 'text-status-error' : 'text-status-success'
          )}>
            {difference > 0 ? '+' : ''}{difference}
          </p>
        </div>
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-tertiary">Confianza:</span>
        <div className="flex-1 h-1.5 rounded-full bg-bg-elevated overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', getConfidenceColor(confidence))}
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
        <span className="text-xs font-mono text-text-secondary">{formatPercentage(confidence)}</span>
      </div>

      {/* Notes */}
      {notes && (
        <p className="text-xs text-text-secondary bg-bg-elevated p-2 rounded">{notes}</p>
      )}

      {/* Warning if difference */}
      {hasDifference && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-status-warning/10 border border-status-warning/20">
          <AlertTriangle className="w-4 h-4 text-status-warning flex-shrink-0" />
          <p className="text-xs text-status-warning">
            Se detectó una diferencia de {Math.abs(difference)} unidades
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {hasDifference && (
          <button onClick={onAdjust} className="btn-accent flex-1 flex items-center justify-center gap-2 text-sm py-2.5">
            <Check className="w-4 h-4" /> Ajustar Stock
          </button>
        )}
        <button onClick={onRetry} className="btn-outline flex items-center justify-center gap-2 text-sm py-2.5 px-4">
          <RotateCcw className="w-4 h-4" /> Repetir
        </button>
        <button onClick={onDismiss} className="btn-ghost flex items-center justify-center gap-2 text-sm py-2.5 px-4">
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
