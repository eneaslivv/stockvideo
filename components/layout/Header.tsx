'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Menu, Mic, Command } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface HeaderProps {
  onMenuOpen?: () => void;
  onAudioOpen?: () => void;
  onCommandOpen?: () => void;
}

export default function Header({ onMenuOpen, onAudioOpen, onCommandOpen }: HeaderProps) {
  const [notifications] = useState(3);

  return (
    <header className="sticky top-0 z-30 glass border-b border-border-subtle">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Mobile menu */}
        <button
          onClick={onMenuOpen}
          className="lg:hidden p-2 rounded-md hover:bg-bg-card transition-colors"
        >
          <Menu className="w-5 h-5 text-text-secondary" />
        </button>

        {/* Mobile logo */}
        <div className="lg:hidden font-display font-bold text-lg">
          Stock<span className="text-accent-primary">AI</span>
        </div>

        {/* Search bar (desktop) */}
        <div className="hidden lg:flex items-center flex-1 max-w-md">
          <button
            onClick={onCommandOpen}
            className={cn(
              'flex items-center gap-3 w-full px-4 py-2 rounded-full',
              'bg-bg-card border border-border-subtle',
              'text-text-tertiary text-sm',
              'hover:border-border-medium transition-colors'
            )}
          >
            <Search className="w-4 h-4" />
            <span>Buscar productos, movimientos...</span>
            <kbd className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded bg-bg-elevated text-[10px] font-mono">
              <Command className="w-3 h-3" /> K
            </kbd>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2 rounded-md hover:bg-bg-card transition-colors">
            <Bell className="w-5 h-5 text-text-secondary" strokeWidth={1.5} />
            {notifications > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-status-error text-white text-[10px] font-bold flex items-center justify-center"
              >
                {notifications}
              </motion.span>
            )}
          </button>

          {/* Mobile audio button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onAudioOpen}
            className="lg:hidden w-10 h-10 rounded-full bg-accent-primary flex items-center justify-center"
          >
            <Mic className="w-5 h-5 text-text-on-accent" strokeWidth={2} />
          </motion.button>

          {/* User avatar */}
          <div className="hidden lg:flex items-center gap-3 ml-2 pl-4 border-l border-border-subtle">
            <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-sm font-medium text-text-secondary">
              U
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
