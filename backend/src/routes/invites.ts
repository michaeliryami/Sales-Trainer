import express from 'express'
import { supabase } from '../config/supabase'
import { sendInvitationEmail } from '../services/email'

const router = express.Router()

// Check if user is an admin of the organization
async function isUserAdmin(userId: string, organizationId: number): Promise<boolean> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, org')
    .eq('id', userId)
    .eq('org', organizationId)
    .single()
  
  if (error || !profile) return false
  return profile.role === 'admin'
}

// Validate if an email is invited to any organization
router.post('/validate', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    console.log('Validating invite for email:', email)

    // Get all organizations and check if email is in any users list
    const { data: organizations, error } = await supabase
      .from('organizations')
      .select('id, name, users, invited_roles')

    if (error) {
      console.error('Error fetching organizations:', error)
      return res.status(500).json({ error: 'Failed to validate invitation' })
    }

    // Check each organization's users list
    for (const org of organizations || []) {
      if (org.users) {
        let usersList: string[] = []
        
        try {
          // Parse the users field - PostgreSQL returns arrays directly
          if (Array.isArray(org.users)) {
            // PostgreSQL array - use directly
            usersList = org.users
          } else if (typeof org.users === 'string') {
            // Handle edge case where it might be stored as JSON string
            usersList = JSON.parse(org.users)
          }

          // Check if the email exists in this organization's users list
          if (usersList.includes(email)) {
            console.log(`Email ${email} found in organization ${org.name} (ID: ${org.id})`)
            
            // Get the invited role for this email, default to 'employee'
            const invitedRoles = org.invited_roles || {}
            const role = invitedRoles[email] || 'employee'
            
            return res.json({
              valid: true,
              organizationId: org.id,
              organizationName: org.name,
              role: role
            })
          }
        } catch (parseError) {
          console.error('Error parsing users list for org', org.id, ':', parseError)
          // Continue checking other organizations
        }
      }
    }

    console.log(`Email ${email} not found in any organization's invite list`)
    return res.json({ valid: false })

  } catch (error) {
    console.error('Error validating invite:', error)
    return res.status(500).json({ error: 'Failed to validate invitation' })
  }
})

// Invite a user to an organization
router.post('/invite', async (req, res) => {
  try {
    const { email, organizationId, adminUserId, role = 'employee' } = req.body

    if (!email || !organizationId || !adminUserId) {
      return res.status(400).json({ error: 'Email, organization ID, and admin user ID are required' })
    }

    if (!['admin', 'employee'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin or employee' })
    }

    console.log('Inviting user:', { email, organizationId, adminUserId, role })

    // First, verify that the requesting user is an admin of the organization
    const isAdmin = await isUserAdmin(adminUserId, organizationId)
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only organization admins can invite users' })
    }

    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('users, invited_roles, name')
      .eq('id', organizationId)
      .single()

    if (orgError) {
      console.error('Error fetching organization:', orgError)
      return res.status(500).json({ error: 'Failed to fetch organization' })
    }

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    // Fetch admin profile for inviter name
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('display_name, email')
      .eq('id', adminUserId)
      .single()

    if (adminError) {
      console.error('Error fetching admin profile:', adminError)
      return res.status(500).json({ error: 'Failed to fetch admin profile' })
    }

    // Parse existing users list - PostgreSQL returns arrays directly
    let usersList: string[] = []
    console.log('Organization users field:', organization.users, 'Type:', typeof organization.users)
    
    if (organization.users) {
      if (Array.isArray(organization.users)) {
        usersList = [...organization.users] // Create a copy of the array
        console.log('Using PostgreSQL array:', usersList)
      } else if (typeof organization.users === 'string') {
        // Handle edge case where it might be stored as JSON string
        try {
          usersList = JSON.parse(organization.users)
          console.log('Parsed users list from JSON string:', usersList)
        } catch (parseError) {
          console.error('Error parsing JSON string:', parseError)
          usersList = []
        }
      }
    }
    
    console.log('Current users list before adding new user:', usersList)

    // Check if user is already invited
    if (usersList.includes(email)) {
      return res.status(400).json({ error: 'User is already invited to this organization' })
    }

    // Add the new email to the users list
    usersList.push(email)
    console.log('Updated users list after adding new user:', usersList)

    // Update invited_roles mapping
    const invitedRoles = organization.invited_roles || {}
    invitedRoles[email] = role
    console.log('Updated invited_roles:', invitedRoles)

    // Update the organization with the new users list and role mapping (PostgreSQL array format)
    const { error: updateError } = await supabase
      .from('organizations')
      .update({ 
        users: usersList,
        invited_roles: invitedRoles
      })
      .eq('id', organizationId)

    if (updateError) {
      console.error('Error updating organization users:', updateError)
      return res.status(500).json({ error: 'Failed to invite user' })
    }

    console.log(`Successfully invited ${email} to organization ${organizationId} with role ${role}`)

    // Send invitation email
    try {
      const inviterName = adminProfile?.display_name || adminProfile?.email || 'Your team'
      const inviteUrl = `https://app.clozone.ai/auth?invite=${encodeURIComponent(email)}&org=${organizationId}`
      
      await sendInvitationEmail({
        to: email,
        organizationName: organization.name || 'the organization',
        inviterName: inviterName,
        role: role as 'admin' | 'employee',
        inviteUrl: inviteUrl
      })

      console.log(`✅ Invitation email sent to ${email}`)
    } catch (emailError) {
      // Log error but don't fail the invitation - it was already created
      console.error('❌ Failed to send invitation email:', emailError)
      // Continue with success response since the DB update succeeded
    }

    return res.json({ 
      success: true, 
      message: `Successfully invited ${email}`,
      invitedEmail: email
    })

  } catch (error) {
    console.error('Error inviting user:', error)
    return res.status(500).json({ error: 'Failed to invite user' })
  }
})

// Remove/cancel a user invitation
router.delete('/invite', async (req, res) => {
  try {
    const { email, organizationId, adminUserId } = req.body

    if (!email || !organizationId || !adminUserId) {
      return res.status(400).json({ error: 'Email, organization ID, and admin user ID are required' })
    }

    console.log('Removing invite for user:', { email, organizationId, adminUserId })

    // First, verify that the requesting user is an admin of the organization
    const isAdmin = await isUserAdmin(adminUserId, organizationId)
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only organization admins can remove invitations' })
    }

    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('users, invited_roles')
      .eq('id', organizationId)
      .single()

    if (orgError) {
      console.error('Error fetching organization:', orgError)
      return res.status(500).json({ error: 'Failed to fetch organization' })
    }

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    // Parse existing users list - PostgreSQL returns arrays directly
    let usersList: string[] = []
    if (organization.users) {
      if (Array.isArray(organization.users)) {
        usersList = [...organization.users] // Create a copy of the array
      } else if (typeof organization.users === 'string') {
        // Handle edge case where it might be stored as JSON string
        try {
          usersList = JSON.parse(organization.users)
        } catch (parseError) {
          console.error('Error parsing JSON string:', parseError)
          return res.status(500).json({ error: 'Failed to parse users list' })
        }
      }
    }

    // Check if user is in the list
    if (!usersList.includes(email)) {
      return res.status(400).json({ error: 'User is not invited to this organization' })
    }

    // Remove the email from the users list
    usersList = usersList.filter(userEmail => userEmail !== email)

    // Also remove from invited_roles mapping if present
    const invitedRoles = organization.invited_roles || {}
    if (invitedRoles[email]) {
      delete invitedRoles[email]
    }

    // Update the organization with the updated users list (PostgreSQL array format)
    const { error: updateError } = await supabase
      .from('organizations')
      .update({ 
        users: usersList,
        invited_roles: invitedRoles
      })
      .eq('id', organizationId)

    if (updateError) {
      console.error('Error updating organization users:', updateError)
      return res.status(500).json({ error: 'Failed to remove invitation' })
    }

    console.log(`Successfully removed invitation for ${email} from organization ${organizationId}`)
    return res.json({ 
      success: true, 
      message: `Successfully removed invitation for ${email}`,
      removedEmail: email
    })

  } catch (error) {
    console.error('Error removing invitation:', error)
    return res.status(500).json({ error: 'Failed to remove invitation' })
  }
})

// Remove a user from the organization (for existing users with profiles)
router.delete('/user', async (req, res) => {
  try {
    const { userId, organizationId, adminUserId } = req.body

    if (!userId || !organizationId || !adminUserId) {
      return res.status(400).json({ error: 'User ID, organization ID, and admin user ID are required' })
    }

    console.log('Removing user from organization:', { userId, organizationId, adminUserId })

    // Verify that the requesting user is an admin
    const isAdmin = await isUserAdmin(adminUserId, organizationId)
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only organization admins can remove users' })
    }

    // Prevent removing yourself
    if (userId === adminUserId) {
      return res.status(400).json({ error: 'Cannot remove yourself from the organization' })
    }

    // Check if this is the last admin
    const { data: admins, error: adminCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('org', organizationId)
      .eq('role', 'admin')

    if (adminCheckError) {
      console.error('Error checking admins:', adminCheckError)
      return res.status(500).json({ error: 'Failed to check organization admins' })
    }

    // If removing an admin and they're the last one, prevent it
    const { data: userToRemove, error: userCheckError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .eq('org', organizationId)
      .single()

    if (userCheckError) {
      console.error('Error checking user role:', userCheckError)
      return res.status(500).json({ error: 'Failed to check user role' })
    }

    if (userToRemove?.role === 'admin' && admins && admins.length <= 1) {
      return res.status(400).json({ error: 'Cannot remove the last admin from the organization' })
    }

    // Delete user's profile from the profiles table
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
      .eq('org', organizationId)

    if (deleteProfileError) {
      console.error('Error deleting user profile:', deleteProfileError)
      return res.status(500).json({ error: 'Failed to delete user profile' })
    }

    // Delete user from Supabase Auth (requires service role key)
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteAuthError) {
      console.error('Error deleting user from auth:', deleteAuthError)
      // Don't fail the whole operation if auth delete fails - profile is already deleted
      console.warn('User profile deleted but auth deletion failed - user may be orphaned')
    }

    console.log(`Successfully removed user ${userId} from organization ${organizationId} (profile and auth deleted)`)
    return res.json({ 
      success: true, 
      message: `Successfully removed user from organization and deleted account`,
      removedUserId: userId
    })

  } catch (error) {
    console.error('Error removing user:', error)
    return res.status(500).json({ error: 'Failed to remove user' })
  }
})

// Update user role (promote to admin or demote to employee)
router.patch('/role', async (req, res) => {
  try {
    const { userId, organizationId, adminUserId, newRole } = req.body

    if (!userId || !organizationId || !adminUserId || !newRole) {
      return res.status(400).json({ error: 'User ID, organization ID, admin user ID, and new role are required' })
    }

    if (!['admin', 'employee'].includes(newRole)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin or employee' })
    }

    console.log('Updating user role:', { userId, organizationId, adminUserId, newRole })

    // Verify that the requesting user is an admin
    const isAdmin = await isUserAdmin(adminUserId, organizationId)
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only organization admins can change user roles' })
    }

    // If demoting an admin, check if they're the last admin
    if (newRole === 'employee') {
      const { data: admins, error: adminCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('org', organizationId)
        .eq('role', 'admin')

      if (adminCheckError) {
        console.error('Error checking admins:', adminCheckError)
        return res.status(500).json({ error: 'Failed to check organization admins' })
      }

      if (admins && admins.length <= 1) {
        return res.status(400).json({ error: 'Cannot demote the last admin in the organization' })
      }
    }

    // Update the user's role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .eq('org', organizationId)

    if (updateError) {
      console.error('Error updating user role:', updateError)
      return res.status(500).json({ error: 'Failed to update user role' })
    }

    console.log(`Successfully updated user ${userId} role to ${newRole}`)
    return res.json({ 
      success: true, 
      message: `Successfully updated user role to ${newRole}`,
      userId,
      newRole
    })

  } catch (error) {
    console.error('Error updating user role:', error)
    return res.status(500).json({ error: 'Failed to update user role' })
  }
})

export default router
