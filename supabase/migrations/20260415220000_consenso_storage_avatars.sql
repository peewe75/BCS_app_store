-- ============================================================
-- MIGRATION: Create avatars storage bucket for Consenso in BCS
-- Target project: knuuqldetklmsrtvggtk (BCS / ultrabot.space)
-- Date: 2026-04-15
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('avatars', 'avatars', true, 2097152)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'avatars_insert_own_folder'
  ) THEN
    CREATE POLICY avatars_insert_own_folder
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'avatars'
      AND (auth.jwt()->>'sub') = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'avatars_delete_own_folder'
  ) THEN
    CREATE POLICY avatars_delete_own_folder
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'avatars'
      AND (auth.jwt()->>'sub') = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'avatars_public_read'
  ) THEN
    CREATE POLICY avatars_public_read
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');
  END IF;
END;
$$;
