'use client';

import { motion } from 'framer-motion';
import { ArrowDown, Check, Pencil, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { AudioInterpretation } from '@/types';
import { getMovementBadgeClass, getConfidenceColor, formatPercentage } from '@/lib/utils/formatters';

interface TranscriptionResultProps {
  transcription: string;
  result: AudioInterpretation;
  onConfirm: () => void;
  onEdit: () => void;
  onCancel: () => void;
}

export default function TranscriptionResult({
  transcription,
  result,
  onConfirm,
  onEdit,
  onCancel,
}: TranscriptionResultProps) {
  const typeLabels: Record<string, string> = {
    entry: 'Entrada',
    exit: 'Salida',
    loss: 'Pérdida',
    adjustment: 'Ajuste',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Raw transcription */}
      <div className="p-3 rounded-lg bg-bg-elevated">
        <p className="text-xs text-text-tertiary mb-1">Audio transcrito:</p>
        <p className="text-sm text-text-secondary italic">&ldquo;{transcription}&rdquo;</p>
      </div>

      <div className="flex justify-center">
        <ArrowDown className="w-4 h-4 text-text-tertiary" />
      </div>

      {/* Interpreted result */}
      <div className="p-4 rounded-lg border border-accent-primary/20 bg-accent-primary/5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-text-primary">{result.product_match}</span>
          <span className={cn(getMovementBadgeClass(result.movement_type))}>
            {typeLabels[result.movement_type] || result.movement_type}
          </span>
        </div>

        <div className="text-4xl font-bold font-mono text-accent-primary mb-3">
          {result.quantity}
        </div>

        <p className="text-sm text-text-secondary mb-3">{result.raw_interpretation}</p>

        {/* Confidence bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-tertiary">Confianza:</span>
          <div className="flex-1 h-1.5 rounded-full bg-bg-elevated overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', getConfidenceColor(result.confidence))}
              style={{ width: `${result.confidence * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono text-text-secondary">
            {formatPercentage(result.confidence)}
          </span>
        </div>

        {result.needs_clarification && result.clarification_message && (
          <div className="mt-3 p-2 rounded bg-status-warning/10 text-status-warning text-xs">
            {result.clarification_message}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onConfirm} className="btn-accent flex-1 flex items-center justify-center gap-2 text-sm py-2.5">
          <Check className="w-4 h-4" /> Confirmar
        </button>
        <button onClick={onEdit} className="btn-outline flex items-center justify-center gap-2 text-sm py-2.5 px-4">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={onCancel} className="btn-ghost flex items-center justify-center gap-2 text-sm py-2.5 px-4">
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
