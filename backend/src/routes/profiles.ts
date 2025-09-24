import express from 'express'
import { supabase } from '../config/supabase'

const router = express.Router()

// Check which emails have profiles (bypasses RLS)
router.post('/check-emails', async (req, res) => {
  try {
    const { emails } = req.body

    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ error: 'Emails array is required' })
    }

    console.log('Checking profiles for emails:', emails)

    // Query profiles table with service role (bypasses RLS)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('email')
      .in('email', emails)

    if (error) {
      console.error('Error querying profiles:', error)
      return res.status(500).json({ error: 'Failed to check emails' })
    }

    console.log('Profiles found:', profiles)

    // Get all existing emails from the query result
    const existingEmails = (profiles || []).map(p => p.email)
    console.log('Existing emails in profiles:', existingEmails)

    // Categorize emails
    const accepted = emails.filter(email => existingEmails.includes(email))
    const pending = emails.filter(email => !existingEmails.includes(email))

    console.log('Accepted emails:', accepted)
    console.log('Pending emails:', pending)

    return res.json({
      accepted,
      pending,
      total: emails.length,
      found: existingEmails.length
    })

  } catch (error) {
    console.error('Error in check-emails:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
