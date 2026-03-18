'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import StatsGrid from '@/components/dashboard/StatsGrid';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';
import AlertPanel from '@/components/dashboard/AlertPanel';
import QuickInput from '@/components/stock/QuickInput';
import { useDashboardStats, useRecentMovements, useStockSummary } from '@/hooks/useStockRealtime';

export default function DashboardPage() {
  const router = useRouter();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { data: movements, loading: movementsLoading } = useRecentMovements(10);
  const { data: stockSummary, loading: summaryLoading } = useStockSummary();
  const [showQuickInput, setShowQuickInput] = useState(false);

  const lowStockItems = stockSummary.filter(s => s.is_low_stock);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="section-label">01 · ダッシュボード</span>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Dashboard</h1>
      </motion.div>

      {/* Stats */}
      <StatsGrid stats={stats} loading={statsLoading} />

      {/* Quick Actions */}
      <section>
        <QuickActions
          onAudioOpen={() => {/* handled by layout */}}
          onQuickInput={() => setShowQuickInput(!showQuickInput)}
          onVideoOpen={() => router.push('/verify')}
          onNewProduct={() => router.push('/products?new=true')}
        />

        {/* Quick Input inline */}
        {showQuickInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <QuickInput />
          </motion.div>
        )}
      </section>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RecentActivity movements={movements} loading={movementsLoading} />
        </div>
        <div className="lg:col-span-2">
          <AlertPanel lowStockItems={lowStockItems} loading={summaryLoading} />
        </div>
      </div>

      {/* Decorative marquee */}
      <div className="overflow-hidden py-4 opacity-[0.03] select-none pointer-events-none">
        <div className="animate-marquee whitespace-nowrap flex">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="text-6xl font-bold tracking-tighter mx-8">
              STOCKAI · ストックAI · INVENTARIO INTELIGENTE · 在庫管理 ·{' '}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
