-- Add visual profile fields to products for AI identification
ALTER TABLE products ADD COLUMN IF NOT EXISTS visual_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reference_image_url TEXT;

-- Update stock_summary view to include new fields
CREATE OR REPLACE VIEW stock_summary AS
SELECT
  p.id AS product_id,
  p.name,
  p.category,
  p.unit,
  p.min_stock,
  p.image_url,
  p.aliases,
  p.visual_description,
  p.reference_image_url,
  get_current_stock(p.id) AS current_stock,
  (SELECT created_at FROM stock_movements WHERE product_id = p.id ORDER BY created_at DESC LIMIT 1) AS last_movement,
  get_current_stock(p.id) <= p.min_stock AS is_low_stock
FROM products p
WHERE p.is_active = true;
