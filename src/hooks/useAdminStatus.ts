'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { isAdminRole } from '@/src/lib/auth/roles';
import { createClerkSupabaseBrowserClient, publicSupabase } from '@/src/lib/supabase/public';

export function useAdminStatus() {
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn, user } = useUser();
  const [profileIsAdmin, setProfileIsAdmin] = useState(false);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);

  const metadataIsAdmin = isAdminRole(user?.publicMetadata?.role);

  useEffect(() => {
    let cancelled = false;

    const loadRole = async () => {
      if (!isLoaded) {
        return;
      }

      if (!isSignedIn || !user?.id || metadataIsAdmin) {
        setProfileIsAdmin(false);
        setIsLoadingAdmin(false);
        return;
      }

      const client = createClerkSupabaseBrowserClient(getToken) ?? publicSupabase;
      if (!client) {
        setProfileIsAdmin(false);
        setIsLoadingAdmin(false);
        return;
      }

      setIsLoadingAdmin(true);

      const { data, error } = await client
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (cancelled) {
        return;
      }

      if (error) {
        console.error('Failed to load admin role from profile', error);
        setProfileIsAdmin(false);
      } else {
        setProfileIsAdmin(isAdminRole(data?.role));
      }

      setIsLoadingAdmin(false);
    };

    void loadRole();

    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, isSignedIn, metadataIsAdmin, user?.id]);

  return {
    isAdmin: metadataIsAdmin || profileIsAdmin,
    isLoadingAdmin,
  };
}
