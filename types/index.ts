export type MovementType = 'entry' | 'exit' | 'loss' | 'adjustment';
export type MovementSource = 'audio' | 'video' | 'manual' | 'quick';
export type VerificationStatus = 'pending' | 'confirmed' | 'adjusted' | 'dismissed';

export interface Product {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  unit: string;
  image_url: string | null;
  aliases: string[];
  min_stock: number;
  barcode: string | null;
  visual_description: string | null;
  reference_image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  user_id: string;
  product_id: string;
  type: MovementType;
  quantity: number;
  source: MovementSource;
  raw_input: string | null;
  confidence: number | null;
  notes: string | null;
  created_at: string;
  product?: Product;
}

export interface StockVerification {
  id: string;
  user_id: string;
  product_id: string;
  detected_quantity: number;
  system_quantity: number;
  difference: number;
  confidence: number;
  video_url: string | null;
  thumbnail_url: string | null;
  status: VerificationStatus;
  created_at: string;
  product?: Product;
}

export interface StockSummary {
  product_id: string;
  name: string;
  category: string | null;
  unit: string;
  min_stock: number;
  image_url: string | null;
  aliases: string[];
  visual_description: string | null;
  reference_image_url: string | null;
  current_stock: number;
  last_movement: string | null;
  is_low_stock: boolean;
}

export interface AudioInterpretation {
  product_match: string;
  product_id: string | null;
  movement_type: MovementType;
  quantity: number;
  confidence: number;
  needs_clarification: boolean;
  clarification_message: string | null;
  raw_interpretation: string;
}

export interface VideoAnalysis {
  detected_count: number;
  confidence: number;
  notes: string;
  partially_visible: number;
  obstructions: boolean;
  image_quality: 'good' | 'fair' | 'poor';
  bounding_boxes: BoundingBox[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface IdentifiedProduct {
  product_id: string | null;
  product_name: string;
  detected_count: number;
  confidence: number;
  bounding_boxes: BoundingBox[];
  is_known: boolean;
}

export interface SceneAnalysis {
  products: IdentifiedProduct[];
  total_items: number;
  scene_description: string;
  image_quality: 'good' | 'fair' | 'poor';
  timestamp: string;
}

export interface MovementDetection {
  product_id: string | null;
  product_name: string;
  previous_count: number;
  current_count: number;
  difference: number;
  movement_type: MovementType;
  confidence: number;
}

export interface QuickMovement {
  operator: '+' | '-' | '=' | '!';
  quantity: number;
  productQuery: string;
  matched_product?: Product;
}

export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  movementsToday: number;
  movementsTrend: number;
  lowStockAlerts: number;
}

export interface UserSettings {
  business_name: string;
  timezone: string;
  audio_language: string;
  audio_auto_confirm: boolean;
  audio_confidence_threshold: number;
  video_quality: 'high' | 'medium' | 'low';
  video_auto_adjust: boolean;
  alerts_low_stock: boolean;
  alerts_verification: boolean;
  alerts_unusual: boolean;
  alerts_inactive: boolean;
  alerts_push: boolean;
  low_stock_threshold: number;
}
