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
  RefreshCw,
  Loader2,
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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [currentSnapshot, setCurrentSnapshot] = useState<Snapshot | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [intervalSeconds, setIntervalSeconds] = useState(10);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousSnapshotRef = useRef<Snapshot | null>(null);

  // Load products
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

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError('No se pudo acceder a la cámara');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const analyzeFrame = useCallback(async () => {
    if (isProcessing || isPaused) return;

    const image = captureFrame();
    if (!image) return;

    setIsProcessing(true);

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

      if (!res.ok) throw new Error('Analysis failed');

      const result = await res.json();

      // Update snapshot
      const newSnapshot: Snapshot = previousSnapshotRef.current
        ? result.current_snapshot
        : { products: result.products, total_items: result.total_items };

      setCurrentSnapshot(newSnapshot);
      previousSnapshotRef.current = newSnapshot;
      setScanCount(prev => prev + 1);

      // Process movements
      if (result.movements_detected && result.movements_detected.length > 0) {
        const newMovements: Movement[] = result.movements_detected.map(
          (m: Movement) => ({
            ...m,
            timestamp: new Date().toISOString(),
          })
        );
        setMovements(prev => [...newMovements, ...prev].slice(0, 50));
      }
    } catch (err) {
      console.error('Monitor analysis error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isPaused, captureFrame, products]);

  const startMonitoring = useCallback(async () => {
    await startCamera();
    setIsMonitoring(true);
    setIsPaused(false);
    setMovements([]);
    setScanCount(0);
    previousSnapshotRef.current = null;
    setCurrentSnapshot(null);

    // Small delay to let camera initialize
    setTimeout(() => {
      analyzeFrame();
    }, 2000);
  }, [startCamera, analyzeFrame]);

  // Set up interval for continuous monitoring
  useEffect(() => {
    if (isMonitoring && !isPaused) {
      intervalRef.current = setInterval(() => {
        analyzeFrame();
      }, intervalSeconds * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isMonitoring, isPaused, intervalSeconds, analyzeFrame]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    setIsPaused(false);
    stopCamera();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [stopCamera]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <span className="section-label">05 · ライブ</span>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Monitor en Vivo</h1>
        <p className="text-sm text-text-secondary mt-1">
          La cámara identifica productos automáticamente y detecta movimientos de stock en tiempo real
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
          </div>

          {/* Interval selector */}
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

          {/* Product count info */}
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

          <button
            onClick={startMonitoring}
            className="btn-accent w-full text-sm flex items-center justify-center gap-2"
          >
            <Video className="w-4 h-4" /> Iniciar Monitor
          </button>

          {cameraError && (
            <p className="text-sm text-status-error text-center">{cameraError}</p>
          )}
        </motion.div>
      ) : (
        /* Monitoring view */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera feed - Left 2/3 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Status overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    isPaused ? 'bg-status-warning' : 'bg-status-success animate-pulse'
                  )} />
                  <span className="text-xs text-white font-medium">
                    {isPaused ? 'PAUSADO' : isProcessing ? 'ANALIZANDO...' : 'EN VIVO'}
                  </span>
                </div>
                <div className="glass px-3 py-1.5 rounded-full">
                  <span className="text-xs text-white font-mono">
                    Scan #{scanCount} · cada {intervalSeconds}s
                  </span>
                </div>
              </div>

              {/* Processing indicator */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="glass px-4 py-3 rounded-xl flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-accent-primary animate-spin" />
                    <span className="text-sm text-white">Identificando productos...</span>
                  </div>
                </div>
              )}

              {/* Bottom controls */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="glass px-4 py-2 rounded-full text-white text-sm flex items-center gap-2 hover:bg-white/20 transition-colors"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isPaused ? 'Reanudar' : 'Pausar'}
                </button>
                <button
                  onClick={() => analyzeFrame()}
                  disabled={isProcessing}
                  className="glass px-4 py-2 rounded-full text-white text-sm flex items-center gap-2 hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" /> Escanear Ahora
                </button>
                <button
                  onClick={stopMonitoring}
                  className="glass px-4 py-2 rounded-full text-status-error text-sm flex items-center gap-2 hover:bg-red-500/20 transition-colors"
                >
                  <VideoOff className="w-4 h-4" /> Detener
                </button>
              </div>
            </div>

            {/* Detected products grid */}
            {currentSnapshot && currentSnapshot.products.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Productos Detectados ({currentSnapshot.products.length})
                  <span className="text-xs font-mono text-text-tertiary ml-auto">
                    Total: {currentSnapshot.total_items} items
                  </span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {currentSnapshot.products.map((product, i) => (
                    <motion.div
                      key={`${product.product_name}-${i}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        'card p-3 space-y-2',
                        product.is_known
                          ? 'border-accent-primary/30'
                          : 'border-status-warning/30'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          'text-[10px] font-mono px-1.5 py-0.5 rounded',
                          product.is_known
                            ? 'bg-accent-primary/10 text-accent-primary'
                            : 'bg-status-warning/10 text-status-warning'
                        )}>
                          {product.is_known ? 'CONOCIDO' : 'NUEVO'}
                        </span>
                        <span className="text-[10px] text-text-tertiary">
                          {Math.round(product.confidence * 100)}%
                        </span>
                      </div>
                      <p className="text-sm font-medium text-text-primary truncate">
                        {product.product_name}
                      </p>
                      <p className="text-2xl font-bold font-mono text-accent-primary">
                        {product.detected_count}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right panel - Movement log */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card p-3 text-center">
                <p className="text-2xl font-bold font-mono text-accent-primary">
                  {currentSnapshot?.total_items || 0}
                </p>
                <p className="text-[10px] text-text-tertiary mt-1">Items Detectados</p>
              </div>
              <div className="card p-3 text-center">
                <p className="text-2xl font-bold font-mono text-accent-primary">
                  {movements.length}
                </p>
                <p className="text-[10px] text-text-tertiary mt-1">Movimientos</p>
              </div>
            </div>

            {/* Movement feed */}
            <div className="card">
              <div className="p-3 border-b border-border-subtle">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-accent-primary" />
                  Movimientos Detectados
                </h3>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {movements.length === 0 ? (
                  <div className="p-6 text-center">
                    <Activity className="w-8 h-8 text-text-tertiary/30 mx-auto mb-2" />
                    <p className="text-xs text-text-tertiary">
                      Los movimientos aparecerán aquí cuando la IA detecte cambios
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border-subtle">
                    <AnimatePresence initial={false}>
                      {movements.map((movement, i) => (
                        <motion.div
                          key={`${movement.product_name}-${movement.timestamp}-${i}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-3 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {movement.difference > 0 ? (
                                <ArrowUp className="w-3.5 h-3.5 text-status-success" />
                              ) : movement.difference < 0 ? (
                                <ArrowDown className="w-3.5 h-3.5 text-status-error" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-status-warning" />
                              )}
                              <span className="text-sm font-medium text-text-primary">
                                {movement.product_name}
                              </span>
                            </div>
                            <span className={cn(
                              'text-sm font-bold font-mono',
                              movement.difference > 0 ? 'text-status-success' : 'text-status-error'
                            )}>
                              {movement.difference > 0 ? '+' : ''}{movement.difference}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-text-tertiary">
                            <span>
                              {movement.previous_count} → {movement.current_count}
                            </span>
                            <span>
                              {new Date(movement.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>

            {/* Products without visual description warning */}
            {products.filter(p => !p.visual_description).length > 0 && (
              <div className="card p-3 border-status-warning/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-status-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-status-warning">
                      {products.filter(p => !p.visual_description).length} productos sin descripción visual
                    </p>
                    <p className="text-[10px] text-text-tertiary mt-0.5">
                      Agrega descripciones visuales en Productos para mejorar la identificación por cámara
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
