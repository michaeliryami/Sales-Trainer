import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../config/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Error in getSession:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', {
          event,
          userEmail: session?.user?.email,
          sessionExists: !!session,
          accessToken: session?.access_token ? 'present' : 'missing'
        })
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      console.log('Validating invite for email:', email)
      
      // First, validate if the email is invited to any organization
      const inviteResponse = await fetch('/api/invites/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!inviteResponse.ok) {
        return { error: { message: 'Failed to validate invitation. Please try again.' } }
      }

      const inviteData = await inviteResponse.json()
      
      if (!inviteData.valid) {
        return { 
          error: { 
            message: 'This email address has not been invited to join any organization. Please contact your administrator for an invitation.' 
          } 
        }
      }

      console.log('Email validated for organization:', inviteData.organizationName)

      // Proceed with signup if email is invited
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            display_name: displayName || '',
            full_name: displayName || '',
            organization_id: inviteData.organizationId // Store org ID in user metadata
          }
        }
      })
      
      console.log('SignUp response:', { data, error })
      
      // Return the response as-is - we'll handle the success case in the component
      return { data, error }
    } catch (error) {
      console.error('Error in signUp:', error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      console.log('Sign in response:', { 
        user: data.user?.email, 
        session: data.session ? 'present' : 'null', 
        error: error?.message 
      })
      
      if (error) {
        console.error('Sign in error:', error)
      }
      
      return { data, error }
    } catch (error) {
      console.error('Error in signIn:', error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error('Error in signOut:', error)
      return { error }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email)
      return { data, error }
    } catch (error) {
      console.error('Error in resetPassword:', error)
      return { error }
    }
  }

  // Debug function to check current auth state
  const debugAuthState = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('Current auth state:', {
        session: session ? 'present' : 'null',
        user: session?.user?.email || 'no user',
        error: error?.message || 'no error'
      })
      return { session, error }
    } catch (error) {
      console.error('Error checking auth state:', error)
      return { session: null, error }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
