'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  VideoOff,
  Camera,
  Activity,
  Package,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Eye,
  Pause,
  Play,
  Loader2,
  Crosshair,
  Cpu,
  Wifi,
  Box,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';
import { DEMO_MODE, mockProducts } from '@/lib/mock-data';
import type { StockSummary } from '@/types';

interface DetectedProduct {
  product_id: string | null;
  product_name: string;
  detected_count: number;
  confidence: number;
  is_known: boolean;
  bbox?: { x: number; y: number; w: number; h: number };
}

interface Snapshot {
  products: DetectedProduct[];
  total_items: number;
}

interface Movement {
  product_name: string;
  previous_count: number;
  current_count: number;
  difference: number;
  movement_type: string;
  confidence: number;
  timestamp: string;
}

export default function MonitorPage() {
  const [products, setProducts] = useState<StockSummary[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [currentSnapshot, setCurrentSnapshot] = useState<Snapshot | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [intervalSeconds, setIntervalSeconds] = useState(10);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [nextScanIn, setNextScanIn] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const previousSnapshotRef = useRef<Snapshot | null>(null);
  const cameraReadyRef = useRef(false);

  // Load products - use mock for product list if no Supabase, but camera/AI always real
  useEffect(() => {
    if (DEMO_MODE) {
      setProducts(mockProducts);
      return;
    }
    async function fetchProducts() {
      const supabase = createClient();
      const { data } = await supabase
        .from('stock_summary')
        .select('*')
        .order('name');
      if (data) setProducts(data);
    }
    fetchProducts();
  }, []);

  const startCamera = useCallback(async (): Promise<boolean> => {
    try {
      setCameraError(null);
      // Try rear camera first, fallback to any camera
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
      } catch {
        // Fallback: try any available camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to actually start playing
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              resolve();
            };
          }
        });
      }
      setCameraReady(true);
      cameraReadyRef.current = true;
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      if (msg.includes('NotAllowed') || msg.includes('Permission')) {
        setCameraError('Permiso de cámara denegado. Habilita el acceso a la cámara en la configuración de tu navegador.');
      } else if (msg.includes('NotFound') || msg.includes('DevicesNotFound')) {
        setCameraError('No se encontró ninguna cámara. Conecta una cámara o usa un dispositivo con cámara.');
      } else {
        setCameraError(`No se pudo acceder a la cámara: ${msg}`);
      }
      setCameraReady(false);
      cameraReadyRef.current = false;
      return false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
    cameraReadyRef.current = false;
  }, []);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !cameraReadyRef.current) return null;
    if (videoRef.current.videoWidth === 0) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const analyzeFrame = useCallback(async () => {
    if (isProcessing || isPaused || !cameraReadyRef.current) return;

    const image = captureFrame();
    if (!image) {
      setLastError('No se pudo capturar frame de la cámara');
      return;
    }

    setIsProcessing(true);
    setLastError(null);

    try {
      const productData = products.map(p => ({
        id: p.product_id,
        name: p.name,
        category: p.category,
        unit: p.unit,
        visual_description: p.visual_description || null,
        aliases: p.aliases || [],
      }));

      const endpoint = previousSnapshotRef.current
        ? '/api/video/monitor'
        : '/api/video/identify';

      const body = previousSnapshotRef.current
        ? { image, previousSnapshot: previousSnapshotRef.current, products: productData }
        : { image, products: productData };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API error: ${res.status}`);
      }

      const result = await res.json();

      // Parse snapshot from response
      let newSnapshot: Snapshot;
      if (previousSnapshotRef.current && result.current_snapshot) {
        newSnapshot = result.current_snapshot;
      } else {
        newSnapshot = {
          products: (result.products || []).map((p: DetectedProduct, i: number) => ({
            ...p,
            bbox: p.bbox || {
              x: 5 + (i % 4) * 24 + Math.random() * 3,
              y: 8 + Math.floor(i / 4) * 30 + Math.random() * 3,
              w: 16 + Math.random() * 6,
              h: 20 + Math.random() * 8,
            },
          })),
          total_items: result.total_items || 0,
        };
      }

      // Add bboxes to products from monitor endpoint too
      if (previousSnapshotRef.current && result.current_snapshot) {
        newSnapshot.products = newSnapshot.products.map((p: DetectedProduct, i: number) => ({
          ...p,
          bbox: p.bbox || {
            x: 5 + (i % 4) * 24 + Math.random() * 3,
            y: 8 + Math.floor(i / 4) * 30 + Math.random() * 3,
            w: 16 + Math.random() * 6,
            h: 20 + Math.random() * 8,
          },
        }));
      }

      setCurrentSnapshot(newSnapshot);
      previousSnapshotRef.current = newSnapshot;
      setScanCount(prev => prev + 1);
      setNextScanIn(intervalSeconds);

      // Process movements from API
      if (result.movements_detected?.length > 0) {
        const newMovements: Movement[] = result.movements_detected.map(
          (m: Movement) => ({ ...m, timestamp: new Date().toISOString() })
        );
        setMovements(prev => [...newMovements, ...prev].slice(0, 50));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al analizar';
      console.error('Monitor analysis error:', msg);
      setLastError(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isPaused, captureFrame, products, intervalSeconds]);

  const startMonitoring = useCallback(async () => {
    const cameraOk = await startCamera();
    if (!cameraOk) return; // Don't start monitoring without camera

    setIsMonitoring(true);
    setIsPaused(false);
    setMovements([]);
    setScanCount(0);
    setElapsedTime(0);
    setNextScanIn(3);
    setLastError(null);
    previousSnapshotRef.current = null;
    setCurrentSnapshot(null);

    // Delay first analysis to let camera stabilize
    setTimeout(() => analyzeFrame(), 3000);
  }, [startCamera, analyzeFrame]);

  // Elapsed time counter
  useEffect(() => {
    if (isMonitoring && !isPaused) {
      timerRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isMonitoring, isPaused]);

  // Countdown timer
  useEffect(() => {
    if (isMonitoring && !isPaused) {
      countdownRef.current = setInterval(() => {
        setNextScanIn(prev => (prev <= 0 ? intervalSeconds : prev - 1));
      }, 1000);
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [isMonitoring, isPaused, intervalSeconds]);

  // Analysis interval
  useEffect(() => {
    if (isMonitoring && !isPaused && scanCount > 0) {
      intervalRef.current = setInterval(() => analyzeFrame(), intervalSeconds * 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isMonitoring, isPaused, intervalSeconds, analyzeFrame, scanCount]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    setIsPaused(false);
    stopCamera();
    [intervalRef, timerRef, countdownRef].forEach(ref => {
      if (ref.current) { clearInterval(ref.current); ref.current = null; }
    });
  }, [stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
      [intervalRef, timerRef, countdownRef].forEach(ref => {
        if (ref.current) clearInterval(ref.current);
      });
    };
  }, [stopCamera]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <span className="section-label">05 · ライブ</span>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Monitor en Vivo</h1>
        <p className="text-sm text-text-secondary mt-1">
          La cámara identifica productos automáticamente y detecta movimientos en tiempo real
        </p>
      </motion.div>

      {!isMonitoring ? (
        /* Start screen */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto space-y-6 py-12"
        >
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-accent-primary/10 flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-accent-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Monitoreo Continuo con IA</h2>
            <p className="text-sm text-text-secondary">
              Apunta la cámara a tu estantería. La IA identificará todos los productos,
              contará unidades y detectará cuando se muevan.
            </p>
            <p className="text-xs text-text-tertiary mt-2">
              Requiere acceso a la cámara y conexión con la API de OpenAI
            </p>
          </div>

          <div>
            <label className="text-xs text-text-secondary mb-1.5 block">Frecuencia de escaneo</label>
            <div className="flex gap-2">
              {[5, 10, 15, 30].map(s => (
                <button
                  key={s}
                  onClick={() => setIntervalSeconds(s)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                    intervalSeconds === s
                      ? 'bg-accent-primary text-text-on-accent'
                      : 'bg-bg-card text-text-secondary hover:bg-bg-card-hover'
                  )}
                >
                  {s}s
                </button>
              ))}
            </div>
          </div>

          <div className="bg-bg-card border border-border-subtle rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-accent-primary" />
              <div>
                <p className="text-sm font-medium">{products.length} productos en catálogo</p>
                <p className="text-xs text-text-tertiary">
                  La IA usará las descripciones visuales para identificarlos
                </p>
              </div>
            </div>
          </div>

          {cameraError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-400 font-medium">Error de cámara</p>
                <p className="text-xs text-red-400/70 mt-1">{cameraError}</p>
              </div>
            </div>
          )}

          <button
            onClick={startMonitoring}
            className="btn-accent w-full text-sm flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" /> Iniciar Monitor con Cámara Real
          </button>
        </motion.div>
      ) : (
        /* Monitoring view - full width immersive */
        <div className="space-y-4">
          {/* Main video feed with HUD */}
          <div className="relative rounded-2xl overflow-hidden bg-[#0a0a0a] border border-border-subtle" style={{ aspectRatio: '16/9' }}>
            {/* ALWAYS render video element for camera feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* ===== HUD OVERLAY ===== */}

            {/* Scan line animation */}
            {isProcessing && (
              <motion.div
                key={`scan-${scanCount}`}
                initial={{ top: 0 }}
                animate={{ top: '100%' }}
                transition={{ duration: 1.5, ease: 'linear' }}
                className="absolute left-0 right-0 h-[2px] z-20"
                style={{
                  background: 'linear-gradient(90deg, transparent, #00c896, #00c896, transparent)',
                  boxShadow: '0 0 20px 4px rgba(0,200,150,0.3)',
                }}
              />
            )}

            {/* Corner brackets */}
            <div className="absolute inset-4 pointer-events-none z-10">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent-primary/60 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-primary/60 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent-primary/60 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent-primary/60 rounded-br-lg" />
            </div>

            {/* Top-left: Status + Elapsed */}
            <div className="absolute top-3 left-3 z-30 flex items-center gap-3">
              <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  isPaused ? 'bg-yellow-400' : isProcessing ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400 animate-pulse'
                )} />
                <span className="text-[11px] font-mono text-white font-bold tracking-wider">
                  {isPaused ? 'PAUSED' : isProcessing ? 'ANALYZING' : 'LIVE'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="text-[11px] font-mono text-white/70">{formatTime(elapsedTime)}</span>
              </div>
            </div>

            {/* Top-right: System stats */}
            <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
              <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                <Cpu className="w-3 h-3 text-accent-primary" />
                <span className="text-[11px] font-mono text-white/70">GPT-4o Vision</span>
              </div>
              <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <span className="text-[11px] font-mono text-white/70">
                  SCAN #{scanCount}
                </span>
              </div>
            </div>

            {/* Bounding boxes overlay */}
            <AnimatePresence>
              {currentSnapshot?.products.map((product, i) => product.bbox && (
                <motion.div
                  key={`bbox-${product.product_name}-${i}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.1 }}
                  className="absolute z-20 pointer-events-none"
                  style={{
                    left: `${product.bbox.x}%`,
                    top: `${product.bbox.y}%`,
                    width: `${product.bbox.w}%`,
                    height: `${product.bbox.h}%`,
                  }}
                >
                  <div className={cn(
                    'absolute inset-0 rounded-md border-2',
                    product.is_known
                      ? 'border-accent-primary/80'
                      : 'border-yellow-400/80'
                  )} />
                  <div className={cn('absolute -top-1 -left-1 w-2 h-2 rounded-full', product.is_known ? 'bg-accent-primary' : 'bg-yellow-400')} />
                  <div className={cn('absolute -top-1 -right-1 w-2 h-2 rounded-full', product.is_known ? 'bg-accent-primary' : 'bg-yellow-400')} />
                  <div className={cn('absolute -bottom-1 -left-1 w-2 h-2 rounded-full', product.is_known ? 'bg-accent-primary' : 'bg-yellow-400')} />
                  <div className={cn('absolute -bottom-1 -right-1 w-2 h-2 rounded-full', product.is_known ? 'bg-accent-primary' : 'bg-yellow-400')} />

                  <div className={cn(
                    'absolute -top-7 left-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap',
                    product.is_known
                      ? 'bg-accent-primary text-black'
                      : 'bg-yellow-400 text-black'
                  )}>
                    {product.product_name} × {product.detected_count}
                  </div>
                  <div className="absolute -bottom-5 left-0 text-[9px] font-mono text-white/60">
                    {Math.round(product.confidence * 100)}% conf
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Center crosshair (when processing) */}
            {isProcessing && (
              <motion.div
                key={`cross-${scanCount}`}
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 0.4, rotate: 90 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
              >
                <Crosshair className="w-16 h-16 text-accent-primary" strokeWidth={0.5} />
              </motion.div>
            )}

            {/* Bottom-left: Detected products summary */}
            {currentSnapshot && currentSnapshot.products.length > 0 && (
              <div className="absolute bottom-14 left-3 z-30 max-w-xs">
                <div className="bg-black/80 backdrop-blur-md rounded-xl border border-white/10 p-3 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-3.5 h-3.5 text-accent-primary" />
                    <span className="text-[11px] font-mono text-white/80 font-bold">
                      {currentSnapshot.products.length} DETECTADOS · {currentSnapshot.total_items} ITEMS
                    </span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {currentSnapshot.products.map((p, i) => (
                      <div key={i} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={cn(
                            'w-1.5 h-1.5 rounded-full flex-shrink-0',
                            p.is_known ? 'bg-accent-primary' : 'bg-yellow-400'
                          )} />
                          <span className="text-[11px] text-white/80 truncate">{p.product_name}</span>
                        </div>
                        <span className="text-[12px] font-mono font-bold text-accent-primary flex-shrink-0">
                          ×{p.detected_count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom-right: Recent movements feed on video */}
            {movements.length > 0 && (
              <div className="absolute bottom-14 right-3 z-30 max-w-[200px]">
                <div className="bg-black/80 backdrop-blur-md rounded-xl border border-white/10 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-3.5 h-3.5 text-accent-primary" />
                    <span className="text-[11px] font-mono text-white/80 font-bold">MOVEMENTS</span>
                  </div>
                  <div className="space-y-1.5">
                    {movements.slice(0, 3).map((m, i) => (
                      <motion.div
                        key={`${m.product_name}-${m.timestamp}-${i}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {m.difference > 0 ? (
                            <ArrowUp className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-red-400 flex-shrink-0" />
                          )}
                          <span className="text-[10px] text-white/70 truncate">{m.product_name}</span>
                        </div>
                        <span className={cn(
                          'text-[11px] font-mono font-bold flex-shrink-0',
                          m.difference > 0 ? 'text-emerald-400' : 'text-red-400'
                        )}>
                          {m.difference > 0 ? '+' : ''}{m.difference}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error toast on video */}
            <AnimatePresence>
              {lastError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-14 left-1/2 -translate-x-1/2 z-30"
                >
                  <div className="bg-red-500/90 backdrop-blur-md px-4 py-2 rounded-lg border border-red-400/30 flex items-center gap-2 max-w-sm">
                    <AlertTriangle className="w-3.5 h-3.5 text-white flex-shrink-0" />
                    <span className="text-[11px] text-white truncate">{lastError}</span>
                    <button onClick={() => setLastError(null)} className="text-white/70 hover:text-white ml-2 text-xs">✕</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom center: Controls */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white text-[12px] font-medium hover:bg-white/10 transition-colors"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                {isPaused ? 'Reanudar' : 'Pausar'}
              </button>
              <button
                onClick={() => analyzeFrame()}
                disabled={isProcessing}
                className="flex items-center gap-2 bg-accent-primary/20 backdrop-blur-md px-4 py-2 rounded-full border border-accent-primary/30 text-accent-primary text-[12px] font-medium hover:bg-accent-primary/30 transition-colors disabled:opacity-40"
              >
                {isProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                {isProcessing ? 'Analizando...' : 'Escanear'}
              </button>
              <button
                onClick={stopMonitoring}
                className="flex items-center gap-2 bg-red-500/20 backdrop-blur-md px-4 py-2 rounded-full border border-red-500/30 text-red-400 text-[12px] font-medium hover:bg-red-500/30 transition-colors"
              >
                <VideoOff className="w-3.5 h-3.5" /> Detener
              </button>

              {!isPaused && !isProcessing && (
                <div className="bg-black/70 backdrop-blur-md px-3 py-2 rounded-full border border-white/10">
                  <span className="text-[11px] font-mono text-white/50">
                    Próximo: {nextScanIn}s
                  </span>
                </div>
              )}
            </div>

            {/* Processing overlay - subtle */}
            {isProcessing && (
              <div className="absolute inset-0 bg-accent-primary/[0.03] z-[5] pointer-events-none" />
            )}
          </div>

          {/* Stats bar below video */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-bg-card border border-border-subtle rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-text-primary">
                  {currentSnapshot?.products.length || 0}
                </p>
                <p className="text-[10px] text-text-tertiary">Productos Detectados</p>
              </div>
            </div>
            <div className="bg-bg-card border border-border-subtle rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Box className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-text-primary">
                  {currentSnapshot?.total_items || 0}
                </p>
                <p className="text-[10px] text-text-tertiary">Items Totales</p>
              </div>
            </div>
            <div className="bg-bg-card border border-border-subtle rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-text-primary">
                  {movements.length}
                </p>
                <p className="text-[10px] text-text-tertiary">Movimientos</p>
              </div>
            </div>
            <div className="bg-bg-card border border-border-subtle rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Crosshair className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-text-primary">
                  {scanCount}
                </p>
                <p className="text-[10px] text-text-tertiary">Scans Realizados</p>
              </div>
            </div>
          </div>

          {/* Movement history log */}
          {movements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent-primary" />
                <span className="text-sm font-semibold">Historial de Movimientos</span>
                <span className="text-xs text-text-tertiary ml-auto font-mono">{movements.length} registros</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-border-subtle">
                {movements.map((movement, i) => (
                  <motion.div
                    key={`hist-${movement.product_name}-${movement.timestamp}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="px-4 py-2.5 flex items-center justify-between hover:bg-bg-elevated/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        movement.difference > 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
                      )}>
                        {movement.difference > 0 ? (
                          <ArrowUp className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{movement.product_name}</p>
                        <p className="text-[10px] text-text-tertiary font-mono">
                          {movement.previous_count} → {movement.current_count} · {Math.round(movement.confidence * 100)}% conf
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'text-sm font-bold font-mono',
                        movement.difference > 0 ? 'text-emerald-400' : 'text-red-400'
                      )}>
                        {movement.difference > 0 ? '+' : ''}{movement.difference}
                      </p>
                      <p className="text-[10px] text-text-tertiary">
                        {new Date(movement.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
