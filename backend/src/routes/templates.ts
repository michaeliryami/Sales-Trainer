import { Router } from 'express'
import { supabase, Template } from '../config/supabase'

const router = Router()

// Template creation interface
interface TemplateCreateData {
  title: string
  description: string
  insuranceType: string
  difficulty: string
  script: string
}

// Create new template
router.post('/', async (req, res): Promise<void> => {
  try {
    const { title, description, insuranceType, difficulty, script, org, userId } = req.body

    // Validate required fields
    if (!title || !description || !insuranceType || !difficulty || !script) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'description', 'insuranceType', 'difficulty', 'script']
      })
      return
    }

    // Create new template in Supabase
    const insertData = {
      title,
      description,
      difficulty,
      type: insuranceType,
      script,
      org: org ? Number(org) : null,
      user_id: userId || null // Set user_id to track who created this template
    }

    const { data: newTemplate, error: insertError } = await supabase
      .from('templates')
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error('Supabase error:', insertError)
      throw new Error(`Database error: ${insertError.message}`)
    }

    console.log(`Created new template: ${title} (${insuranceType}, ${difficulty})`)

    res.status(201).json({
      success: true,
      template: {
        ...newTemplate,
        // Don't send the full script content in the response
        script: script.substring(0, 200) + (script.length > 200 ? '...' : '')
      }
    })

  } catch (error) {
    console.error('Error creating template:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get all templates
router.get('/', async (req, res): Promise<void> => {
  try {
    const { userId } = req.query

    // Fetch templates based on user permissions
    // - Templates with user_id = null are visible to everyone (built-in/shared)
    // - Templates with user_id set are only visible to that specific user
    let query = supabase
      .from('templates')
      .select('*')

    if (userId) {
      // Get templates that are either shared (user_id is null) OR created by this user
      query = query.or(`user_id.is.null,user_id.eq.${userId}`)
    } else {
      // If no userId provided, only return shared templates
      query = query.is('user_id', null)
    }

    const { data: templates, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    const templateSummaries = templates.map(template => ({
      id: template.id,
      title: template.title,
      description: template.description,
      insuranceType: template.type, // Map 'type' back to 'insuranceType'
      difficulty: template.difficulty,
      createdAt: template.created_at,
      user_id: template.user_id,
      // Include truncated script preview
      scriptPreview: template.script.substring(0, 150) + (template.script.length > 150 ? '...' : '')
    }))

    res.json({
      success: true,
      templates: templateSummaries,
      total: templates.length
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get specific template by ID
router.get('/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params
    
    const { data: template, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({
          error: 'Template not found',
          id
        })
        return
      }
      console.error('Supabase error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    res.json({
      success: true,
      template: {
        ...template,
        insuranceType: template.type // Map 'type' back to 'insuranceType'
      }
    })
  } catch (error) {
    console.error('Error fetching template:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Update template
router.put('/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params
    const { title, description, insuranceType, difficulty, script } = req.body

    const updateBody = {
      title,
      description,
      type: insuranceType,
      difficulty,
      script
    }

    const { data: updatedTemplate, error } = await supabase
      .from('templates')
      .update(updateBody)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(error.message)
    }

    res.json({ success: true, template: updatedTemplate })
  } catch (error) {
    console.error('Error updating template:', error)
    res.status(500).json({ error: 'Failed to update template' })
  }
})


// Delete template
router.delete('/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params
    
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log(`Deleted template with ID: ${id}`)

    res.json({
      success: true,
      message: 'Template deleted successfully',
      deletedTemplateId: id
    })

  } catch (error) {
    console.error('Error deleting template:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router
