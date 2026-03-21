import React, { createContext, useContext } from 'react';
import {
  useAuth as useClerkAuth,
  useUser,
  useClerk,
} from '@clerk/clerk-react';

interface AuthContextType {
  userId: string | null | undefined;
  isSignedIn: boolean | undefined;
  isLoaded: boolean;
  isAdmin: boolean;
  userEmail: string | null | undefined;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider is a no-op wrapper kept for backward compatibility.
// The actual auth is provided by <ClerkProvider> in index.tsx.
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useAuth = (): AuthContextType => {
  const { isSignedIn, isLoaded, userId } = useClerkAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  const isAdmin = (user?.publicMetadata?.role as string | undefined) === 'admin';
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  return {
    userId,
    isSignedIn,
    isLoaded,
    isAdmin,
    userEmail,
    logout: () => signOut(),
  };
};

// Legacy export for backward compatibility with pages that use useAuthContext
export const useAuthContext = useAuth;

export default AuthContext;
