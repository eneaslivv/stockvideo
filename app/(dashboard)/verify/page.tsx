'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScanLine, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';
import VideoCapture from '@/components/video/VideoCapture';
import type { StockSummary } from '@/types';

export default function VerifyPage() {
  const [products, setProducts] = useState<StockSummary[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<StockSummary | null>(null);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('stock_summary')
        .select('*')
        .order('name');
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, [supabase]);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <span className="section-label">04 · 検証</span>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Verificación por Video</h1>
      </motion.div>

      {!started ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto space-y-6 py-12"
        >
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-accent-primary/10 flex items-center justify-center mx-auto mb-4">
              <ScanLine className="w-10 h-10 text-accent-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Verificar Stock con Cámara</h2>
            <p className="text-sm text-text-secondary">
              Selecciona un producto y usa la cámara para contar unidades automáticamente con IA
            </p>
          </div>

          {/* Product selector */}
          <div>
            <label className="text-xs text-text-secondary mb-1.5 block">Producto a verificar</label>
            <select
              value={selectedProduct?.product_id || ''}
              onChange={e => {
                const p = products.find(p => p.product_id === e.target.value);
                setSelectedProduct(p || null);
              }}
              className="w-full px-4 py-3 rounded-lg bg-bg-card border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
            >
              <option value="">Seleccionar producto...</option>
              {products.map(p => (
                <option key={p.product_id} value={p.product_id}>
                  {p.name} (stock: {p.current_stock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setStarted(true)}
            disabled={!selectedProduct}
            className="btn-accent w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Iniciar Verificación
          </button>
        </motion.div>
      ) : selectedProduct ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <VideoCapture
            productName={selectedProduct.name}
            systemQuantity={selectedProduct.current_stock}
            onComplete={(detected) => {
              setStarted(false);
            }}
            onClose={() => setStarted(false)}
          />
        </motion.div>
      ) : null}
    </div>
  );
}
