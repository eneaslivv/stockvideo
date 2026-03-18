'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DEMO_MODE, mockProducts, mockMovements, mockStats } from '@/lib/mock-data';
import type { StockSummary, StockMovement, DashboardStats } from '@/types';

export function useStockSummary() {
  const [data, setData] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (DEMO_MODE) {
      setData(mockProducts);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: summary } = await supabase
      .from('stock_summary')
      .select('*')
      .order('name');

    if (summary) setData(summary);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    if (DEMO_MODE) return;

    const supabase = createClient();
    const channel = supabase
      .channel('stock-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stock_movements' },
        () => { fetchData(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}

export function useRecentMovements(limit = 10) {
  const [data, setData] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (DEMO_MODE) {
      setData(mockMovements.slice(0, limit));
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: movements } = await supabase
      .from('stock_movements')
      .select('*, product:products(name, category, unit, image_url)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (movements) setData(movements as unknown as StockMovement[]);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    fetchData();

    if (DEMO_MODE) return;

    const supabase = createClient();
    const channel = supabase
      .channel('movements-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stock_movements' },
        () => { fetchData(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}

export function useDashboardStats(): { stats: DashboardStats; loading: boolean } {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalStock: 0,
    movementsToday: 0,
    movementsTrend: 0,
    lowStockAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      setStats(mockStats);
      setLoading(false);
      return;
    }

    async function fetchStats() {
      const supabase = createClient();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [productsRes, summaryRes, todayRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('stock_summary').select('*'),
        supabase
          .from('stock_movements')
          .select('id', { count: 'exact' })
          .gte('created_at', today.toISOString()),
      ]);

      const summary = summaryRes.data || [];
      const totalStock = summary.reduce((acc: number, s: StockSummary) => acc + (s.current_stock || 0), 0);
      const lowStock = summary.filter((s: StockSummary) => s.is_low_stock).length;

      setStats({
        totalProducts: productsRes.count || 0,
        totalStock,
        movementsToday: todayRes.count || 0,
        movementsTrend: 12,
        lowStockAlerts: lowStock,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  return { stats, loading };
}
