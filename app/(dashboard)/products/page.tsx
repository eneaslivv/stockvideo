'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Package,
  MoreVertical,
  Pencil,
  Archive,
  Upload,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';
import type { Product, StockSummary } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showNewModal, setShowNewModal] = useState(false);
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

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (current: number, min: number) => {
    if (current <= 0) return { color: 'bg-status-error', label: 'Sin stock' };
    if (current <= min) return { color: 'bg-status-warning', label: 'Bajo' };
    return { color: 'bg-status-success', label: 'OK' };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="section-label">02 · 製品</span>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Productos</h1>
        </motion.div>

        <div className="flex items-center gap-3">
          <button className="btn-outline text-sm flex items-center gap-2">
            <Upload className="w-4 h-4" /> Importar CSV
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="btn-accent text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nuevo Producto
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-card border border-border-subtle text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat || 'all'}
              onClick={() => setSelectedCategory(cat || 'all')}
              className={cn(
                'px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors',
                selectedCategory === cat
                  ? 'bg-accent-primary text-text-on-accent'
                  : 'bg-bg-card text-text-secondary hover:bg-bg-card-hover'
              )}
            >
              {cat === 'all' ? 'Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card space-y-3">
              <div className="skeleton h-32 rounded-md" />
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
              <div className="skeleton h-8 w-20" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-bg-card flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-text-tertiary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {searchQuery ? 'Sin resultados' : 'Agrega tu primer producto'}
          </h3>
          <p className="text-sm text-text-tertiary mb-4">
            {searchQuery
              ? 'Intenta con otra búsqueda'
              : 'Comienza agregando productos a tu inventario'}
          </p>
          {!searchQuery && (
            <button onClick={() => setShowNewModal(true)} className="btn-accent text-sm">
              <Plus className="w-4 h-4 inline mr-2" /> Nuevo Producto
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product, i) => {
            const status = getStockStatus(product.current_stock, product.min_stock);

            return (
              <motion.div
                key={product.product_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-hover group"
              >
                {/* Image placeholder */}
                <div className="h-32 rounded-md bg-bg-elevated flex items-center justify-center mb-3 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-10 h-10 text-text-tertiary/30" />
                  )}
                </div>

                {/* Info */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-text-primary">{product.name}</h3>
                    {product.category && (
                      <span className="badge-accent mt-1">{product.category}</span>
                    )}
                  </div>
                  <button className="p-1 rounded hover:bg-bg-elevated opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4 text-text-tertiary" />
                  </button>
                </div>

                {/* Stock */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle">
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full', status.color)} />
                    <span className="text-2xl font-bold font-mono">{product.current_stock}</span>
                    <span className="text-xs text-text-tertiary">{product.unit}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* New Product Modal */}
      <AnimatePresence>
        {showNewModal && (
          <ProductModal onClose={() => setShowNewModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('unidad');
  const [minStock, setMinStock] = useState(0);
  const [aliases, setAliases] = useState<string[]>([]);
  const [aliasInput, setAliasInput] = useState('');
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const handleAddAlias = () => {
    if (aliasInput.trim() && !aliases.includes(aliasInput.trim())) {
      setAliases([...aliases, aliasInput.trim()]);
      setAliasInput('');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('products').insert({
      user_id: user.id,
      name: name.trim(),
      category: category.trim() || null,
      unit,
      min_stock: minStock,
      aliases,
    });

    setSaving(false);
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-x-4 top-[10vh] lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-lg z-50"
      >
        <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Nuevo Producto</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-bg-elevated">
              <X className="w-4 h-4 text-text-tertiary" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs text-text-secondary mb-1.5 block">Nombre *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Salsa picante"
                className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-subtle text-sm focus:outline-none focus:border-accent-primary transition-colors"
              />
            </div>

            {/* Category + Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-secondary mb-1.5 block">Categoría</label>
                <input
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="Ej: Salsas"
                  className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-subtle text-sm focus:outline-none focus:border-accent-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1.5 block">Unidad</label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-subtle text-sm focus:outline-none focus:border-accent-primary transition-colors"
                >
                  <option value="unidad">Unidad</option>
                  <option value="botella">Botella</option>
                  <option value="caja">Caja</option>
                  <option value="kg">Kg</option>
                  <option value="litro">Litro</option>
                  <option value="paquete">Paquete</option>
                </select>
              </div>
            </div>

            {/* Min stock */}
            <div>
              <label className="text-xs text-text-secondary mb-1.5 block">Stock Mínimo</label>
              <input
                type="number"
                value={minStock}
                onChange={e => setMinStock(parseInt(e.target.value) || 0)}
                min={0}
                className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-subtle text-sm focus:outline-none focus:border-accent-primary transition-colors"
              />
            </div>

            {/* Aliases */}
            <div>
              <label className="text-xs text-text-secondary mb-1.5 block">
                Aliases (para reconocimiento por voz)
              </label>
              <div className="flex gap-2">
                <input
                  value={aliasInput}
                  onChange={e => setAliasInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddAlias())}
                  placeholder="Ej: picante, hot sauce"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-subtle text-sm focus:outline-none focus:border-accent-primary transition-colors"
                />
                <button onClick={handleAddAlias} className="btn-outline text-sm px-4">
                  +
                </button>
              </div>
              {aliases.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {aliases.map((alias, i) => (
                    <span key={i} className="badge-accent flex items-center gap-1">
                      {alias}
                      <button onClick={() => setAliases(aliases.filter((_, j) => j !== i))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="btn-ghost flex-1 text-sm">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="btn-accent flex-1 text-sm disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Crear Producto'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
