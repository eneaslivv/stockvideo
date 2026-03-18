'use client';

import { motion } from 'framer-motion';
import { Package, BarChart3, ArrowLeftRight, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { DashboardStats } from '@/types';

interface StatsGridProps {
  stats: DashboardStats;
  loading?: boolean;
}

const statItems: Array<{
  key: keyof DashboardStats;
  label: string;
  icon: React.ElementType;
  color: string;
  showTrend?: boolean;
  isAlert?: boolean;
}> = [
  { key: 'totalProducts', label: 'Productos Activos', icon: Package, color: 'text-accent-primary' },
  { key: 'totalStock', label: 'Stock Total', icon: BarChart3, color: 'text-status-info' },
  { key: 'movementsToday', label: 'Movimientos Hoy', icon: ArrowLeftRight, color: 'text-status-success', showTrend: true },
  { key: 'lowStockAlerts', label: 'Alertas', icon: AlertTriangle, color: 'text-status-error', isAlert: true },
];

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-4xl font-bold font-mono"
    >
      {value.toLocaleString('es-ES')}
    </motion.span>
  );
}

export default function StatsGrid({ stats, loading }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, i) => {
        const Icon = item.icon;
        const value = stats[item.key as keyof DashboardStats];

        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            className="card-hover group cursor-default"
          >
            {loading ? (
              <div className="space-y-3">
                <div className="skeleton h-4 w-20" />
                <div className="skeleton h-10 w-24" />
                <div className="skeleton h-3 w-16" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <Icon
                    className={cn('w-5 h-5', item.color)}
                    strokeWidth={1.5}
                  />
                  {item.showTrend && stats.movementsTrend !== 0 && (
                    <div className={cn(
                      'flex items-center gap-1 text-xs font-medium',
                      stats.movementsTrend > 0 ? 'text-status-success' : 'text-status-error'
                    )}>
                      {stats.movementsTrend > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(stats.movementsTrend)}%
                    </div>
                  )}
                </div>
                <AnimatedNumber value={value} />
                <p className="text-sm text-text-secondary mt-1">{item.label}</p>
              </>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
