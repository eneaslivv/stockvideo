'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Check, Pencil, Loader2 } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import AudioWaveform from './AudioWaveform';
import TranscriptionResult from './TranscriptionResult';
import { cn } from '@/lib/utils/cn';

interface AudioRecorderProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AudioRecorder({ isOpen, onClose }: AudioRecorderProps) {
  const {
    state,
    startRecording,
    stopRecording,
    cancelRecording,
    result,
    transcription,
    error,
    waveformData,
    duration,
  } = useAudioRecorder();

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleClose = () => {
    if (state === 'recording') cancelRecording();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:max-w-md lg:w-full"
          >
            <div className="bg-bg-card border border-border-subtle rounded-t-2xl lg:rounded-2xl p-6 shadow-2xl">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-bg-elevated transition-colors"
              >
                <X className="w-4 h-4 text-text-tertiary" />
              </button>

              {/* Title */}
              <div className="text-center mb-6">
                <span className="section-label">Registro por voz</span>
                <h3 className="text-lg font-bold mt-1">
                  {state === 'idle' && 'Toca para grabar'}
                  {state === 'recording' && 'Grabando...'}
                  {state === 'processing' && 'Procesando...'}
                  {state === 'result' && 'Resultado'}
                  {state === 'error' && 'Error'}
                </h3>
              </div>

              {/* Idle / Recording state */}
              {(state === 'idle' || state === 'recording') && (
                <div className="flex flex-col items-center gap-6">
                  {state === 'recording' && (
                    <>
                      <AudioWaveform data={waveformData} />
                      <span className="font-mono text-2xl text-text-primary">
                        {formatTime(duration)}
                      </span>
                    </>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={state === 'idle' ? startRecording : stopRecording}
                    className={cn(
                      'w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200',
                      state === 'idle'
                        ? 'bg-accent-primary hover:shadow-glow'
                        : 'bg-status-error animate-pulse-slow'
                    )}
                  >
                    {state === 'idle' ? (
                      <Mic className="w-8 h-8 text-text-on-accent" strokeWidth={2} />
                    ) : (
                      <MicOff className="w-8 h-8 text-white" strokeWidth={2} />
                    )}
                  </motion.button>

                  <p className="text-sm text-text-tertiary">
                    {state === 'idle'
                      ? 'Ejemplo: "Entraron 10 cajas de salsa"'
                      : 'Toca para detener'
                    }
                  </p>
                </div>
              )}

              {/* Processing state */}
              {state === 'processing' && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <Loader2 className="w-10 h-10 text-accent-primary animate-spin" />
                  <p className="text-sm text-text-secondary">Analizando tu audio...</p>
                </div>
              )}

              {/* Result state */}
              {state === 'result' && result && (
                <TranscriptionResult
                  transcription={transcription || ''}
                  result={result}
                  onConfirm={() => {
                    // TODO: Save movement to DB
                    handleClose();
                  }}
                  onEdit={() => {
                    // TODO: Open edit mode
                  }}
                  onCancel={handleClose}
                />
              )}

              {/* Error state */}
              {state === 'error' && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="w-12 h-12 rounded-full bg-status-error/10 flex items-center justify-center">
                    <X className="w-6 h-6 text-status-error" />
                  </div>
                  <p className="text-sm text-status-error">{error}</p>
                  <button
                    onClick={() => startRecording()}
                    className="btn-outline text-sm"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
