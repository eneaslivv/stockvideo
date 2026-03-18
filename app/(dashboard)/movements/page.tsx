'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  Mic,
  Video,
  Keyboard,
  Zap,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';
import { DEMO_MODE, mockMovements } from '@/lib/mock-data';
import type { StockMovement } from '@/types';
import {
  relativeTime,
  formatDate,
  getMovementSign,
  getMovementColor,
  getMovementBadgeClass,
  getConfidenceColor,
} from '@/lib/utils/formatters';

const typeLabels: Record<string, string> = {
  entry: 'Entrada',
  exit: 'Salida',
  loss: 'Pérdida',
  adjustment: 'Ajuste',
};

const sourceIcons: Record<string, React.ElementType> = {
  audio: Mic,
  video: Video,
  manual: Keyboard,
  quick: Zap,
};

export default function MovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    if (DEMO_MODE) {
      setMovements(mockMovements);
      setLoading(false);
      return;
    }
    async function fetchMovements() {
      const supabase = createClient();
      const { data } = await supabase
        .from('stock_movements')
        .select('*, product:products(name, category, unit, image_url)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) setMovements(data as unknown as StockMovement[]);
      setLoading(false);
    }
    fetchMovements();
  }, []);

  const filtered = movements.filter(m => {
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    const matchesSource = sourceFilter === 'all' || m.source === sourceFilter;
    const productName = (m.product as unknown as { name: string })?.name || '';
    const matchesSearch = productName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSource && matchesSearch;
  });

  // Group by date
  const grouped = filtered.reduce<Record<string, StockMovement[]>>((acc, m) => {
    const date = new Date(m.created_at).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <span className="section-label">03 · 履歴</span>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Movimientos</h1>
      </motion.div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: filtered.length, color: 'text-text-primary' },
          { label: 'Entradas', value: filtered.filter(m => m.type === 'entry').length, color: 'text-status-success' },
          { label: 'Salidas', value: filtered.filter(m => m.type === 'exit').length, color: 'text-status-warning' },
          { label: 'Pérdidas', value: filtered.filter(m => m.type === 'loss').length, color: 'text-status-error' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card text-center"
          >
            <span className={cn('text-2xl font-bold font-mono', stat.color)}>{stat.value}</span>
            <p className="text-xs text-text-tertiary mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por producto..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-card border border-border-subtle text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary transition-colors"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-bg-card border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
          >
            <option value="all">Todos los tipos</option>
            <option value="entry">Entradas</option>
            <option value="exit">Salidas</option>
            <option value="loss">Pérdidas</option>
            <option value="adjustment">Ajustes</option>
          </select>

          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-bg-card border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
          >
            <option value="all">Todas las fuentes</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="manual">Manual</option>
            <option value="quick">Rápido</option>
          </select>

          <button className="btn-outline text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="skeleton w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-48" />
                <div className="skeleton h-3 w-32" />
              </div>
              <div className="skeleton h-6 w-16" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Calendar className="w-12 h-12 text-text-tertiary/30 mx-auto mb-4" />
          <p className="text-text-tertiary">No hay movimientos que mostrar</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wide mb-3 px-1">
                {date}
              </h3>
              <div className="card space-y-0 divide-y divide-border-subtle p-0 overflow-hidden">
                {items.map((movement, i) => {
                  const SourceIcon = sourceIcons[movement.source] || Keyboard;
                  const sign = getMovementSign(movement.type);
                  const productData = movement.product as unknown as { name: string } | undefined;

                  return (
                    <motion.div
                      key={movement.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 px-4 py-3.5 hover:bg-bg-elevated/50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-bg-elevated flex items-center justify-center flex-shrink-0">
                        <SourceIcon className="w-4 h-4 text-text-tertiary" strokeWidth={1.5} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {productData?.name || 'Producto'}
                          </span>
                          <span className={cn('text-[10px]', getMovementBadgeClass(movement.type))}>
                            {typeLabels[movement.type]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-text-tertiary">
                            {relativeTime(movement.created_at)}
                          </span>
                          {movement.confidence != null && (
                            <div className="flex items-center gap-1">
                              <div className="w-8 h-1 rounded-full bg-bg-elevated overflow-hidden">
                                <div
                                  className={cn('h-full rounded-full', getConfidenceColor(movement.confidence))}
                                  style={{ width: `${movement.confidence * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <span className={cn('font-mono font-bold text-sm', getMovementColor(movement.type))}>
                        {sign}{movement.quantity}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
