'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import CommandBar from '@/components/layout/CommandBar';
import AudioRecorder from '@/components/audio/AudioRecorder';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [audioOpen, setAudioOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandOpen(prev => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-bg-secondary">
      <Sidebar onAudioOpen={() => setAudioOpen(true)} />
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <CommandBar isOpen={commandOpen} onClose={() => setCommandOpen(false)} />

      <div className="lg:pl-[280px]">
        <Header
          onMenuOpen={() => setMobileNavOpen(true)}
          onAudioOpen={() => setAudioOpen(true)}
          onCommandOpen={() => setCommandOpen(true)}
        />

        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-4 lg:p-8 max-w-[1400px] mx-auto"
        >
          {children}
        </motion.main>
      </div>

      <AudioRecorder isOpen={audioOpen} onClose={() => setAudioOpen(false)} />
    </div>
  );
}
