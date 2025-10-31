import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../config/supabase'
import { Profile, Organization, UserRole } from '../types/database'
import { useAuth } from './AuthContext'

interface ProfileContextType {
  profile: Profile | null
  organization: Organization | null
  userRole: UserRole
  loading: boolean
  refreshProfile: () => Promise<void>
  refreshOrganization: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}

interface ProfileProviderProps {
  children: React.ReactNode
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const { user, session } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('Fetching profile for user:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      console.log('Profile fetched:', data)
      return data as Profile
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      return null
    }
  }

  const fetchOrganization = async (orgId: number): Promise<Organization | null> => {
    try {
      console.log('Fetching organization for ID:', orgId)
      
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()

      if (error) {
        console.error('Error fetching organization:', error)
        return null
      }

      console.log('Organization fetched:', data)
      return data as Organization
    } catch (error) {
      console.error('Error in fetchOrganization:', error)
      return null
    }
  }

  const createProfile = async (user: User, organizationId?: number): Promise<Profile | null> => {
    try {
      console.log('Creating profile for user:', user.email)
      
      let orgId = organizationId

      // Always validate the user's invite to get the correct org ID
      if (user.email) {
        try {
          const response = await fetch('/api/invites/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: user.email }),
          })

          if (response.ok) {
            const inviteData = await response.json()
            if (inviteData.valid) {
              orgId = inviteData.organizationId
              console.log('User invited to organization:', inviteData.organizationName, 'ID:', orgId)
            } else {
              console.error('User email not found in any organization invite list')
              return null // Don't create profile if not invited
            }
          }
        } catch (inviteError) {
          console.error('Error validating invite during profile creation:', inviteError)
          return null
        }
      }

      if (!orgId) {
        console.error('No organization ID found for user')
        return null
      }
      
      const profileData = {
        id: user.id,
        display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || '',
        email: user.email || '',
        org: orgId
      }

      console.log('Profile data to insert:', profileData)

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        return null
      }

      console.log('Profile created:', data)
      return data as Profile
    } catch (error) {
      console.error('Error in createProfile:', error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      let userProfile = await fetchProfile(user.id)
      
      // If profile doesn't exist, create it
      if (!userProfile) {
        // Use organization_id from user metadata if available
        const orgId = user.user_metadata?.organization_id
        userProfile = await createProfile(user, orgId)
      }
      
      setProfile(userProfile)
      
      // Fetch organization immediately after profile is loaded
      if (userProfile?.org) {
        const org = await fetchOrganization(userProfile.org)
        setOrganization(org)
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshOrganization = async () => {
    if (!profile?.org) return

    try {
      const org = await fetchOrganization(profile.org)
      setOrganization(org)
    } catch (error) {
      console.error('Error refreshing organization:', error)
    }
  }

  // Fetch profile when user changes
  useEffect(() => {
    if (user && session) {
      refreshProfile()
    } else {
      setProfile(null)
      setOrganization(null)
      setLoading(false)
    }
  }, [user, session])

  // Note: Organization is now fetched within refreshProfile to avoid race conditions
  // This effect is kept for manual refreshes via refreshOrganization()
  useEffect(() => {
    // Skip if this is the initial load (loading is true) - organization will be fetched in refreshProfile
    if (loading) return
    
    if (profile?.org && !organization) {
      refreshOrganization()
    } else if (!profile?.org) {
      setOrganization(null)
    }
  }, [profile?.org, loading])

  // Calculate user role
  const userRole: UserRole = {
    isAdmin: !!(organization && profile && organization.admin === profile.id),
    organization,
    profile
  }

  const value: ProfileContextType = {
    profile,
    organization,
    userRole,
    loading,
    refreshProfile,
    refreshOrganization
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}
