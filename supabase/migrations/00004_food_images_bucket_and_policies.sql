-- Aligns with src/config/storage.ts (STORAGE_BUCKET_NAME = 'food-images').
-- Public SELECT is required so <img src="..."> works for visitors (no JWT).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'food-images',
  'food-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = COALESCE(storage.buckets.file_size_limit, EXCLUDED.file_size_limit);

-- Allow anyone to read objects (needed for storefront / img tags)
DROP POLICY IF EXISTS "Public read food-images" ON storage.objects;
CREATE POLICY "Public read food-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'food-images');

-- Logged-in users can upload (admin panel uses Supabase session)
DROP POLICY IF EXISTS "Authenticated upload food-images" ON storage.objects;
CREATE POLICY "Authenticated upload food-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'food-images');

-- Authenticated users can update their uploads if needed
DROP POLICY IF EXISTS "Authenticated update food-images" ON storage.objects;
CREATE POLICY "Authenticated update food-images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'food-images')
  WITH CHECK (bucket_id = 'food-images');

DROP POLICY IF EXISTS "Authenticated delete food-images" ON storage.objects;
CREATE POLICY "Authenticated delete food-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'food-images');
