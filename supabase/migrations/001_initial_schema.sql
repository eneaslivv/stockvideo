-- StockAI Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  unit TEXT NOT NULL DEFAULT 'unidad',
  image_url TEXT,
  aliases TEXT[] DEFAULT '{}',
  min_stock INTEGER DEFAULT 0,
  barcode TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock movements table
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('entry', 'exit', 'loss', 'adjustment')),
  quantity INTEGER NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('audio', 'video', 'manual', 'quick')),
  raw_input TEXT,
  confidence FLOAT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock verifications table
CREATE TABLE stock_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  detected_quantity INTEGER NOT NULL,
  system_quantity INTEGER NOT NULL,
  difference INTEGER GENERATED ALWAYS AS (detected_quantity - system_quantity) STORED,
  confidence FLOAT NOT NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'adjusted', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to calculate current stock
CREATE OR REPLACE FUNCTION get_current_stock(p_product_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(
    SUM(CASE
      WHEN type = 'entry' THEN quantity
      WHEN type = 'adjustment' THEN quantity
      ELSE -quantity
    END), 0
  )::INTEGER
  FROM stock_movements
  WHERE product_id = p_product_id;
$$ LANGUAGE sql STABLE;

-- Stock summary view
CREATE OR REPLACE VIEW stock_summary AS
SELECT
  p.id AS product_id,
  p.name,
  p.category,
  p.unit,
  p.min_stock,
  p.image_url,
  p.aliases,
  get_current_stock(p.id) AS current_stock,
  (SELECT created_at FROM stock_movements WHERE product_id = p.id ORDER BY created_at DESC LIMIT 1) AS last_movement,
  get_current_stock(p.id) <= p.min_stock AS is_low_stock
FROM products p
WHERE p.is_active = true;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_active ON products(user_id, is_active);
CREATE INDEX idx_movements_product ON stock_movements(product_id);
CREATE INDEX idx_movements_user ON stock_movements(user_id);
CREATE INDEX idx_movements_created ON stock_movements(created_at DESC);
CREATE INDEX idx_movements_type ON stock_movements(type);
CREATE INDEX idx_verifications_product ON stock_verifications(product_id);
CREATE INDEX idx_verifications_status ON stock_verifications(status);

-- Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_verifications ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

-- Stock movements policies
CREATE POLICY "Users can view own movements"
  ON stock_movements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own movements"
  ON stock_movements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own movements"
  ON stock_movements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own movements"
  ON stock_movements FOR DELETE
  USING (auth.uid() = user_id);

-- Stock verifications policies
CREATE POLICY "Users can view own verifications"
  ON stock_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own verifications"
  ON stock_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verifications"
  ON stock_verifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable realtime for stock_movements
ALTER PUBLICATION supabase_realtime ADD TABLE stock_movements;
