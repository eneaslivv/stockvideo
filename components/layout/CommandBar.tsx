'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, ArrowLeftRight, ScanLine, Settings, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const commands = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/', category: 'Páginas' },
  { id: 'products', label: 'Productos', icon: Package, href: '/products', category: 'Páginas' },
  { id: 'movements', label: 'Movimientos', icon: ArrowLeftRight, href: '/movements', category: 'Páginas' },
  { id: 'verify', label: 'Verificación', icon: ScanLine, href: '/verify', category: 'Páginas' },
  { id: 'settings', label: 'Configuración', icon: Settings, href: '/settings', category: 'Páginas' },
];

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandBar({ isOpen, onClose }: CommandBarProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleSelect = (href: string) => {
    router.push(href);
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
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <div className="fixed inset-0 flex items-start justify-center pt-[20vh] z-[60] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-bg-card border border-border-subtle rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
                <Search className="w-5 h-5 text-text-tertiary flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar comandos, productos..."
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
                />
                <kbd className="px-2 py-0.5 rounded bg-bg-elevated text-[10px] font-mono text-text-tertiary">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-64 overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <div className="px-4 py-8 text-center text-text-tertiary text-sm">
                    No se encontraron resultados
                  </div>
                ) : (
                  filtered.map((cmd, i) => {
                    const Icon = cmd.icon;
                    return (
                      <motion.button
                        key={cmd.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => handleSelect(cmd.href)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5',
                          'text-left text-sm text-text-secondary',
                          'hover:bg-bg-elevated hover:text-text-primary transition-colors'
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                        <span>{cmd.label}</span>
                        <span className="ml-auto text-[10px] text-text-tertiary">{cmd.category}</span>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
