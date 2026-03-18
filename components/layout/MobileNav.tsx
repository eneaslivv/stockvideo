'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  ScanLine,
  Video,
  Settings,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { href: '/', label: 'Dashboard', labelJp: 'ダッシュボード', icon: LayoutDashboard, num: '01' },
  { href: '/products', label: 'Productos', labelJp: '製品', icon: Package, num: '02' },
  { href: '/movements', label: 'Movimientos', labelJp: '履歴', icon: ArrowLeftRight, num: '03' },
  { href: '/verify', label: 'Verificación', labelJp: '検証', icon: ScanLine, num: '04' },
  { href: '/monitor', label: 'Monitor en Vivo', labelJp: 'ライブ', icon: Video, num: '05' },
  { href: '/settings', label: 'Configuración', labelJp: '設定', icon: Settings, num: '06' },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-80 bg-bg-primary border-r border-border-subtle z-50 lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-accent-primary flex items-center justify-center">
                  <Zap className="w-4 h-4 text-text-on-accent" />
                </div>
                <span className="font-display font-bold text-lg tracking-tight">
                  Stock<span className="text-accent-primary">AI</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-bg-card transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Nav items */}
            <nav className="py-4 px-3 space-y-1">
              {navItems.map((item, i) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200',
                        isActive
                          ? 'bg-bg-card text-accent-primary border-l-2 border-accent-primary'
                          : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
                      )}
                    >
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-[10px] font-mono text-text-tertiary">
                          {item.num} · {item.labelJp}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
