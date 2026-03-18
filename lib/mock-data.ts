import type { StockSummary, StockMovement, DashboardStats } from '@/types';

export const DEMO_MODE = typeof window !== 'undefined' &&
  (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder'));

const now = new Date();
const ago = (minutes: number) => new Date(now.getTime() - minutes * 60000).toISOString();

export const mockProducts: StockSummary[] = [
  { product_id: '1', name: 'Salsa Picante', category: 'Salsas', unit: 'botella', min_stock: 10, image_url: null, current_stock: 24, last_movement: ago(15), is_low_stock: false },
  { product_id: '2', name: 'Vino Tinto Malbec', category: 'Bebidas', unit: 'botella', min_stock: 6, image_url: null, current_stock: 18, last_movement: ago(30), is_low_stock: false },
  { product_id: '3', name: 'Cerveza Artesanal IPA', category: 'Bebidas', unit: 'botella', min_stock: 12, image_url: null, current_stock: 8, last_movement: ago(45), is_low_stock: true },
  { product_id: '4', name: 'Aceite de Oliva Extra Virgen', category: 'Aceites', unit: 'botella', min_stock: 5, image_url: null, current_stock: 15, last_movement: ago(60), is_low_stock: false },
  { product_id: '5', name: 'Pasta Fusilli', category: 'Pastas', unit: 'paquete', min_stock: 20, image_url: null, current_stock: 42, last_movement: ago(90), is_low_stock: false },
  { product_id: '6', name: 'Queso Parmesano', category: 'Lácteos', unit: 'unidad', min_stock: 8, image_url: null, current_stock: 3, last_movement: ago(120), is_low_stock: true },
  { product_id: '7', name: 'Harina 000', category: 'Secos', unit: 'kg', min_stock: 15, image_url: null, current_stock: 28, last_movement: ago(180), is_low_stock: false },
  { product_id: '8', name: 'Tomates Perita', category: 'Verduras', unit: 'kg', min_stock: 10, image_url: null, current_stock: 0, last_movement: ago(200), is_low_stock: true },
  { product_id: '9', name: 'Café Molido Premium', category: 'Bebidas', unit: 'paquete', min_stock: 5, image_url: null, current_stock: 12, last_movement: ago(240), is_low_stock: false },
  { product_id: '10', name: 'Manteca', category: 'Lácteos', unit: 'unidad', min_stock: 4, image_url: null, current_stock: 7, last_movement: ago(300), is_low_stock: false },
  { product_id: '11', name: 'Azúcar', category: 'Secos', unit: 'kg', min_stock: 10, image_url: null, current_stock: 5, last_movement: ago(350), is_low_stock: true },
  { product_id: '12', name: 'Leche Entera', category: 'Lácteos', unit: 'litro', min_stock: 10, image_url: null, current_stock: 22, last_movement: ago(20), is_low_stock: false },
];

export const mockMovements: StockMovement[] = [
  { id: 'm1', user_id: 'u1', product_id: '1', type: 'entry', quantity: 12, source: 'audio', raw_input: 'Llegaron 12 botellas de salsa picante', confidence: 0.95, notes: null, created_at: ago(5), product: { name: 'Salsa Picante', category: 'Salsas', unit: 'botella', image_url: null } as unknown as undefined },
  { id: 'm2', user_id: 'u1', product_id: '2', type: 'exit', quantity: 3, source: 'quick', raw_input: '-3 vino', confidence: null, notes: null, created_at: ago(15), product: { name: 'Vino Tinto Malbec', category: 'Bebidas', unit: 'botella', image_url: null } as unknown as undefined },
  { id: 'm3', user_id: 'u1', product_id: '3', type: 'entry', quantity: 24, source: 'manual', raw_input: null, confidence: null, notes: 'Pedido semanal', created_at: ago(45), product: { name: 'Cerveza Artesanal IPA', category: 'Bebidas', unit: 'botella', image_url: null } as unknown as undefined },
  { id: 'm4', user_id: 'u1', product_id: '6', type: 'loss', quantity: 2, source: 'audio', raw_input: 'Se rompieron 2 quesos parmesano', confidence: 0.88, notes: null, created_at: ago(120), product: { name: 'Queso Parmesano', category: 'Lácteos', unit: 'unidad', image_url: null } as unknown as undefined },
  { id: 'm5', user_id: 'u1', product_id: '5', type: 'entry', quantity: 20, source: 'quick', raw_input: '+20 pasta fusilli', confidence: null, notes: null, created_at: ago(180), product: { name: 'Pasta Fusilli', category: 'Pastas', unit: 'paquete', image_url: null } as unknown as undefined },
  { id: 'm6', user_id: 'u1', product_id: '8', type: 'exit', quantity: 15, source: 'manual', raw_input: null, confidence: null, notes: 'Venta del día', created_at: ago(200), product: { name: 'Tomates Perita', category: 'Verduras', unit: 'kg', image_url: null } as unknown as undefined },
  { id: 'm7', user_id: 'u1', product_id: '12', type: 'entry', quantity: 10, source: 'audio', raw_input: 'Recibí 10 litros de leche', confidence: 0.92, notes: null, created_at: ago(20), product: { name: 'Leche Entera', category: 'Lácteos', unit: 'litro', image_url: null } as unknown as undefined },
  { id: 'm8', user_id: 'u1', product_id: '9', type: 'entry', quantity: 6, source: 'video', raw_input: null, confidence: 0.78, notes: 'Verificado por cámara', created_at: ago(240), product: { name: 'Café Molido Premium', category: 'Bebidas', unit: 'paquete', image_url: null } as unknown as undefined },
  { id: 'm9', user_id: 'u1', product_id: '4', type: 'adjustment', quantity: 2, source: 'video', raw_input: null, confidence: 0.85, notes: 'Ajuste por verificación', created_at: ago(300), product: { name: 'Aceite de Oliva Extra Virgen', category: 'Aceites', unit: 'botella', image_url: null } as unknown as undefined },
  { id: 'm10', user_id: 'u1', product_id: '7', type: 'entry', quantity: 10, source: 'quick', raw_input: '+10 harina', confidence: null, notes: null, created_at: ago(350), product: { name: 'Harina 000', category: 'Secos', unit: 'kg', image_url: null } as unknown as undefined },
];

export const mockStats: DashboardStats = {
  totalProducts: 12,
  totalStock: 184,
  movementsToday: 7,
  movementsTrend: 12,
  lowStockAlerts: 4,
};
