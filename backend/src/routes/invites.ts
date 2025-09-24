import express from 'express'
import { supabase } from '../config/supabase'

const router = express.Router()

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
      .select('id, name, users')

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
            return res.json({
              valid: true,
              organizationId: org.id,
              organizationName: org.name
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
    const { email, organizationId, adminUserId } = req.body

    if (!email || !organizationId || !adminUserId) {
      return res.status(400).json({ error: 'Email, organization ID, and admin user ID are required' })
    }

    console.log('Inviting user:', { email, organizationId, adminUserId })

    // First, verify that the requesting user is an admin of the organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('admin, users')
      .eq('id', organizationId)
      .single()

    if (orgError) {
      console.error('Error fetching organization:', orgError)
      return res.status(500).json({ error: 'Failed to fetch organization' })
    }

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    // Check if the requesting user is the admin
    if (organization.admin !== adminUserId) {
      return res.status(403).json({ error: 'Only organization admins can invite users' })
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

    // Update the organization with the new users list (PostgreSQL array format)
    const { error: updateError } = await supabase
      .from('organizations')
      .update({ users: usersList }) // Pass array directly, not JSON string
      .eq('id', organizationId)

    if (updateError) {
      console.error('Error updating organization users:', updateError)
      return res.status(500).json({ error: 'Failed to invite user' })
    }

    console.log(`Successfully invited ${email} to organization ${organizationId}`)
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
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('admin, users')
      .eq('id', organizationId)
      .single()

    if (orgError) {
      console.error('Error fetching organization:', orgError)
      return res.status(500).json({ error: 'Failed to fetch organization' })
    }

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    // Check if the requesting user is the admin
    if (organization.admin !== adminUserId) {
      return res.status(403).json({ error: 'Only organization admins can remove invitations' })
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

    // Update the organization with the updated users list (PostgreSQL array format)
    const { error: updateError } = await supabase
      .from('organizations')
      .update({ users: usersList }) // Pass array directly, not JSON string
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

export default router
