-- Function to get most ordered food items
CREATE OR REPLACE FUNCTION get_most_ordered_food_items(item_limit INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  image_url TEXT,
  total_orders BIGINT,
  total_quantity BIGINT,
  total_revenue NUMERIC,
  restaurant_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fi.id,
    fi.name,
    fi.image_url,
    COUNT(DISTINCT oi.order_id) as total_orders,
    SUM(oi.quantity) as total_quantity,
    SUM(oi.price * oi.quantity) as total_revenue,
    COALESCE(r.name, 'Unknown') as restaurant_name
  FROM food_items fi
  LEFT JOIN order_items oi ON fi.id = oi.food_item_id
  LEFT JOIN restaurants r ON fi.restaurant_id = r.id
  WHERE oi.id IS NOT NULL
  GROUP BY fi.id, fi.name, fi.image_url, r.name
  ORDER BY total_orders DESC, total_revenue DESC
  LIMIT item_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get most ordered restaurants
CREATE OR REPLACE FUNCTION get_most_ordered_restaurants(restaurant_limit INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  image_url TEXT,
  total_orders BIGINT,
  total_revenue NUMERIC,
  average_order_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.image_url,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_revenue,
    COALESCE(AVG(o.total_amount), 0) as average_order_value
  FROM restaurants r
  LEFT JOIN orders o ON r.id = o.restaurant_id
  WHERE o.id IS NOT NULL AND o.status != 'cancelled'
  GROUP BY r.id, r.name, r.image_url
  ORDER BY total_orders DESC, total_revenue DESC
  LIMIT restaurant_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get revenue by date
CREATE OR REPLACE FUNCTION get_revenue_by_date(days_back INT DEFAULT 30)
RETURNS TABLE (
  date DATE,
  revenue NUMERIC,
  order_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.created_at::DATE as date,
    COALESCE(SUM(o.total_amount), 0) as revenue,
    COUNT(o.id) as order_count
  FROM orders o
  WHERE o.created_at >= CURRENT_DATE - days_back
    AND o.status != 'cancelled'
  GROUP BY o.created_at::DATE
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get order status distribution
CREATE OR REPLACE FUNCTION get_order_status_distribution()
RETURNS TABLE (
  status TEXT,
  count BIGINT,
  percentage NUMERIC
) AS $$
DECLARE
  total_orders BIGINT;
BEGIN
  SELECT COUNT(*) INTO total_orders FROM orders;
  
  RETURN QUERY
  SELECT 
    o.status::TEXT,
    COUNT(o.id) as count,
    CASE 
      WHEN total_orders > 0 THEN ROUND((COUNT(o.id)::NUMERIC / total_orders * 100), 2)
      ELSE 0
    END as percentage
  FROM orders o
  GROUP BY o.status
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get category analytics
CREATE OR REPLACE FUNCTION get_category_analytics()
RETURNS TABLE (
  id UUID,
  name TEXT,
  total_orders BIGINT,
  total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    COUNT(DISTINCT oi.order_id) as total_orders,
    COALESCE(SUM(oi.price * oi.quantity), 0) as total_revenue
  FROM categories c
  LEFT JOIN food_items fi ON c.id = fi.category_id
  LEFT JOIN order_items oi ON fi.id = oi.food_item_id
  WHERE oi.id IS NOT NULL
  GROUP BY c.id, c.name
  ORDER BY total_orders DESC, total_revenue DESC;
END;
$$ LANGUAGE plpgsql;