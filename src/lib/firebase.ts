// Firebase is being phased out in favour of:
//   Auth     → Clerk   (configured in src/index.tsx)
//   Database → Supabase (src/lib/supabase.ts)
//
// This file is kept temporarily because some legacy pages may still
// reference it. It will be deleted when Phase 3 migration is complete.
//
// DO NOT add new Firebase imports elsewhere in the project.

export const db = null;
export const auth = null;
