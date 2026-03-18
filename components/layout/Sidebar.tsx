'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  ScanLine,
  Settings,
  Mic,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { href: '/', label: 'Dashboard', labelJp: 'ダッシュボード', icon: LayoutDashboard, num: '01' },
  { href: '/products', label: 'Productos', labelJp: '製品', icon: Package, num: '02' },
  { href: '/movements', label: 'Movimientos', labelJp: '履歴', icon: ArrowLeftRight, num: '03' },
  { href: '/verify', label: 'Verificación', labelJp: '検証', icon: ScanLine, num: '04' },
  { href: '/settings', label: 'Configuración', labelJp: '設定', icon: Settings, num: '05' },
];

interface SidebarProps {
  onAudioOpen?: () => void;
}

export default function Sidebar({ onAudioOpen }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-bg-primary border-r border-border-subtle z-40"
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-border-subtle">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-md bg-accent-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-text-on-accent" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight">
                Stock<span className="text-accent-primary">AI</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="w-8 h-8 rounded-md bg-accent-primary flex items-center justify-center mx-auto">
            <Zap className="w-4 h-4 text-text-on-accent" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative',
                  isActive
                    ? 'bg-bg-card text-accent-primary'
                    : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-primary rounded-full"
                  />
                )}
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 flex-1 min-w-0"
                    >
                      <span className="text-sm font-medium truncate">{item.label}</span>
                      <span className="text-[10px] font-mono text-text-tertiary ml-auto">
                        {item.num}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Audio CTA */}
      <div className="p-3 border-t border-border-subtle">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAudioOpen}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3 rounded-full',
            'bg-accent-primary text-text-on-accent font-semibold text-sm',
            'hover:shadow-glow transition-all duration-200'
          )}
        >
          <Mic className="w-4 h-4" strokeWidth={2} />
          {!collapsed && <span>Nuevo Registro</span>}
        </motion.button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-bg-card border border-border-subtle flex items-center justify-center hover:bg-bg-elevated transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-text-secondary" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-text-secondary" />
        )}
      </button>
    </motion.aside>
  );
}
