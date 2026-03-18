'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { VideoAnalysis } from '@/types';

type CaptureState = 'idle' | 'camera' | 'capturing' | 'processing' | 'result' | 'error';

export function useVideoCapture() {
  const [state, setState] = useState<CaptureState>('idle');
  const [result, setResult] = useState<VideoAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setState('camera');
    } catch {
      setError('No se pudo acceder a la cámara');
      setState('error');
    }
  }, []);

  const capture = useCallback(async (productName: string) => {
    if (!videoRef.current) return;

    setState('capturing');

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setImageData(dataUrl);

    setState('processing');

    try {
      const res = await fetch('/api/video/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl, productName }),
      });

      if (!res.ok) throw new Error('Analysis failed');

      const analysis = await res.json();
      setResult(analysis);
      setState('result');
    } catch {
      setError('Error al analizar la imagen');
      setState('error');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setState('idle');
    setResult(null);
    setImageData(null);
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setImageData(null);
    setError(null);
    setState('camera');
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    state,
    result,
    error,
    imageData,
    videoRef,
    startCamera,
    capture,
    stopCamera,
    reset,
  };
}
