'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, RotateCcw, X } from 'lucide-react';
import { useVideoCapture } from '@/hooks/useVideoCapture';
import DetectionOverlay from './DetectionOverlay';
import VerificationResult from './VerificationResult';
import { cn } from '@/lib/utils/cn';

interface VideoCaptureProps {
  productName: string;
  systemQuantity: number;
  onComplete?: (detected: number) => void;
  onClose?: () => void;
}

export default function VideoCapture({
  productName,
  systemQuantity,
  onComplete,
  onClose,
}: VideoCaptureProps) {
  const { state, result, error, imageData, videoRef, startCamera, capture, stopCamera, reset } =
    useVideoCapture();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-black rounded-xl overflow-hidden">
      {/* Camera view */}
      {(state === 'camera' || state === 'capturing') && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Frame guide overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3/4 h-2/3 border-2 border-accent-primary/50 rounded-2xl relative">
              {/* Corner accents */}
              <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-2 border-l-2 border-accent-primary rounded-tl-lg" />
              <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-2 border-r-2 border-accent-primary rounded-tr-lg" />
              <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-2 border-l-2 border-accent-primary rounded-bl-lg" />
              <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-2 border-r-2 border-accent-primary rounded-br-lg" />
            </div>
          </div>

          {/* Top badge */}
          <div className="absolute top-4 left-0 right-0 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass px-4 py-2 rounded-full text-sm text-text-primary"
            >
              Apunta a la estantería — <span className="text-accent-primary font-medium">{productName}</span>
            </motion.div>
          </div>

          {/* Capture button */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => capture(productName)}
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg"
            >
              <Camera className="w-7 h-7 text-black" strokeWidth={2} />
            </motion.button>
          </div>

          {onClose && (
            <button
              onClick={() => { stopCamera(); onClose(); }}
              className="absolute top-4 right-4 p-2 glass rounded-full"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </>
      )}

      {/* Processing */}
      {state === 'processing' && (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="w-12 h-12 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-secondary">Analizando imagen...</p>
        </div>
      )}

      {/* Result */}
      {state === 'result' && result && imageData && (
        <div className="h-full">
          <div className="relative">
            <img src={imageData} alt="Captured" className="w-full" />
            <DetectionOverlay boxes={result.bounding_boxes} imageWidth={640} imageHeight={480} />
          </div>
          <div className="p-4">
            <VerificationResult
              detected={result.detected_count}
              systemQuantity={systemQuantity}
              confidence={result.confidence}
              notes={result.notes}
              onAdjust={() => onComplete?.(result.detected_count)}
              onRetry={reset}
              onDismiss={onClose}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
          <div className="w-12 h-12 rounded-full bg-status-error/10 flex items-center justify-center">
            <X className="w-6 h-6 text-status-error" />
          </div>
          <p className="text-sm text-status-error text-center">{error}</p>
          <button onClick={reset} className="btn-outline text-sm flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Reintentar
          </button>
        </div>
      )}
    </div>
  );
}
