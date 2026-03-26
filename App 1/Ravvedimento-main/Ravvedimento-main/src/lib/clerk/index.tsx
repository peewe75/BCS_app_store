// Stub per Clerk Authentication
// Da configurare dopo con le chiavi pubbliche di Clerk

import React from "react"

export interface User {
  id: string
  email: string
  name: string
}

export function getAuth() {
  console.log('[CLERK STUB] getAuth chiamato')
  return {
    userId: null,
    sessionId: null,
  }
}

export function currentUser(): Promise<User | null> {
  console.log('[CLERK STUB] currentUser chiamato')
  return Promise.resolve(null)
}

export function useUser() {
  console.log('[CLERK STUB] useUser chiamato')
  return {
    user: null,
    isLoaded: true,
    isSignedIn: false,
  }
}

export function SignInButton({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function SignOutButton({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function UserButton() {
  return <button>[Utente]</button>
}

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
