import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../config/supabase'
import { Profile, Organization, UserRole } from '../types/database'
import { useAuth } from './AuthContext'
import apiFetch from '../utils/api'

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
  const { user, session, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      if (import.meta.env.DEV) console.log('Fetching profile for user:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (import.meta.env.DEV) console.error('Error fetching profile:', error)
        return null
      }

      if (import.meta.env.DEV) console.log('Profile fetched:', data)
      return data as Profile
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error in fetchProfile:', error)
      return null
    }
  }

  const fetchOrganization = async (orgId: number): Promise<Organization | null> => {
    try {
      if (import.meta.env.DEV) console.log('Fetching organization for ID:', orgId)
      
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()

      if (error) {
        if (import.meta.env.DEV) console.error('Error fetching organization:', error)
        return null
      }

      if (import.meta.env.DEV) console.log('Organization fetched:', data)
      return data as Organization
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error in fetchOrganization:', error)
      return null
    }
  }

  const createProfile = async (user: User, organizationId?: number): Promise<Profile | null> => {
    try {
      if (import.meta.env.DEV) console.log('Creating profile for user:', user.email)
      
      let orgId = organizationId
      let assignedRole: 'admin' | 'employee' = 'employee'

      // Always validate the user's invite to get the correct org ID and role
      if (user.email) {
        try {
          const response = await apiFetch('/api/invites/validate', {
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
              assignedRole = inviteData.role || 'employee'
              if (import.meta.env.DEV) console.log('User invited to organization:', inviteData.organizationName, 'ID:', orgId, 'Role:', assignedRole)
            } else {
              if (import.meta.env.DEV) console.error('User email not found in any organization invite list')
              return null // Don't create profile if not invited
            }
          }
        } catch (inviteError) {
          if (import.meta.env.DEV) console.error('Error validating invite during profile creation:', inviteError)
          return null
        }
      }

      if (!orgId) {
        if (import.meta.env.DEV) console.error('No organization ID found for user')
        return null
      }
      
      const profileData = {
        id: user.id,
        display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || '',
        email: user.email || '',
        org: orgId,
        role: assignedRole
      }

      if (import.meta.env.DEV) console.log('Profile data to insert:', profileData)

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single()

      if (error) {
        if (import.meta.env.DEV) console.error('Error creating profile:', error)
        return null
      }

      if (import.meta.env.DEV) console.log('Profile created:', data)
      
      // Remove the user's email from the organization's invite list now that they have a profile
      if (user.email && orgId) {
        try {
          const { data: org } = await supabase
            .from('organizations')
            .select('users, invited_roles')
            .eq('id', orgId)
            .single()
          
          if (org && org.users) {
            // Parse the users list - it's stored as TEXT in JSON format like '["email1", "email2"]'
            let usersList: string[] = []
            if (typeof org.users === 'string') {
              usersList = JSON.parse(org.users)
            } else if (Array.isArray(org.users)) {
              usersList = org.users
            }
            
            // Remove this user's email from the invite list
            const updatedUsersList = usersList.filter((email: string) => email !== user.email)
            
            // Also remove from invited_roles
            const invitedRoles = org.invited_roles || {}
            if (invitedRoles[user.email]) {
              delete invitedRoles[user.email]
            }
            
            // Update organization - convert array back to JSON string for TEXT column
            await supabase
              .from('organizations')
              .update({ 
                users: updatedUsersList,  // Supabase will automatically convert array to JSON string
                invited_roles: invitedRoles
              })
              .eq('id', orgId)
            
            if (import.meta.env.DEV) console.log('Removed user email from organization invite list:', user.email)
          }
        } catch (cleanupError) {
          if (import.meta.env.DEV) console.error('Error cleaning up invite list:', cleanupError)
          // Don't fail profile creation if cleanup fails
        }
      }
      
      return data as Profile
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error in createProfile:', error)
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
      // If profile exists but org is NULL, update it with the correct org from invite
      else if (!userProfile.org && user.email) {
        if (import.meta.env.DEV) console.log('Profile exists but org is NULL, checking for invite...')
        try {
          const response = await apiFetch('/api/invites/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: user.email }),
          })

          if (response.ok) {
            const inviteData = await response.json()
            if (inviteData.valid) {
              if (import.meta.env.DEV) console.log('Found invite, updating profile with org:', inviteData.organizationId)
              
              // Update the profile with the org
              const { data: updatedProfile, error: updateError } = await supabase
                .from('profiles')
                .update({ 
                  org: inviteData.organizationId,
                  role: inviteData.role || 'employee'
                })
                .eq('id', user.id)
                .select()
                .single()

              if (!updateError && updatedProfile) {
                userProfile = updatedProfile as Profile
                if (import.meta.env.DEV) console.log('Profile updated with org:', updatedProfile)
                
                // Remove from invite list
                const { data: org } = await supabase
                  .from('organizations')
                  .select('users, invited_roles')
                  .eq('id', inviteData.organizationId)
                  .single()
                
                if (org && org.users) {
                  let usersList: string[] = []
                  if (typeof org.users === 'string') {
                    usersList = JSON.parse(org.users)
                  } else if (Array.isArray(org.users)) {
                    usersList = org.users
                  }
                  
                  const updatedUsersList = usersList.filter((email: string) => email !== user.email)
                  const invitedRoles = org.invited_roles || {}
                  if (invitedRoles[user.email]) {
                    delete invitedRoles[user.email]
                  }
                  
                  await supabase
                    .from('organizations')
                    .update({ 
                      users: updatedUsersList,
                      invited_roles: invitedRoles
                    })
                    .eq('id', inviteData.organizationId)
                  
                  if (import.meta.env.DEV) console.log('Removed user from invite list')
                }
              }
            }
          }
        } catch (inviteError) {
          if (import.meta.env.DEV) console.error('Error checking invite for existing profile:', inviteError)
        }
      }
      
      setProfile(userProfile)
      
      // Fetch organization immediately after profile is loaded
      if (userProfile?.org) {
        const org = await fetchOrganization(userProfile.org)
        setOrganization(org)
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error refreshing profile:', error)
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
      if (import.meta.env.DEV) console.error('Error refreshing organization:', error)
    }
  }

  // Fetch profile when user changes
  useEffect(() => {
    // CRITICAL: Don't set loading=false until auth is fully loaded
    // This prevents premature redirects on page refresh
    if (authLoading) {
      setLoading(true)
      return
    }
    
    if (user && session) {
      setLoading(true)
      refreshProfile()
    } else {
      setProfile(null)
      setOrganization(null)
      setLoading(false)
    }
  }, [user, session, authLoading])

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

  // Calculate user role based on profile.role field
  const userRole: UserRole = {
    isAdmin: !!(profile && profile.role === 'admin'),
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
