import { Router } from 'express'
import { vapiService, CreateAssistantRequest } from '../services/vapi'
import { supabase } from '../config/supabase'

const router = Router()

// POST /api/assistants - Create a new VAPI assistant
router.post('/', async (req, res): Promise<void> => {
  try {
    const { templateId, accountType, scriptContent, templateTitle, insuranceType } = req.body

    // Validate required fields
    if (!templateId || !accountType) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['templateId', 'accountType']
      })
      return
    }

    // Validate account type
    const validAccountTypes = ['employee', 'manager', 'admin']
    if (!validAccountTypes.includes(accountType)) {
      res.status(400).json({
        error: 'Invalid account type',
        validOptions: validAccountTypes
      })
      return
    }

    let template: any

    // If scriptContent is provided directly (for built-in templates), use it
    if (scriptContent) {
      template = {
        id: templateId,
        title: templateTitle || 'Custom Template',
        script: scriptContent,
        type: insuranceType || 'life' // Use provided insurance type or default to life
      }
      console.log('Using built-in template:', { templateId, title: template.title, type: template.type, accountType })
    } else {
      // Otherwise fetch from database (for custom templates)
      const { data: dbTemplate, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (error || !dbTemplate) {
        res.status(404).json({
          error: 'Template not found',
          templateId
        })
        return
      }
      
      template = dbTemplate
      console.log('Using database template:', { templateId, template: template.title, accountType })
    }

    const assistant = await vapiService.updateAssistantWithTemplate({
      template,
      accountType
    })

    res.status(200).json({
      success: true,
      assistant,
      message: `Assistant updated successfully with ${template.title} template`
    })

  } catch (error) {
    console.error('Error in POST /api/assistants:', error)
    res.status(500).json({
      error: 'Failed to update assistant',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// POST /api/assistants/:id/call - Create a web call with an assistant
router.post('/:id/call', async (req, res): Promise<void> => {
  try {
    const { id: assistantId } = req.params

    if (!assistantId) {
      res.status(400).json({
        error: 'Assistant ID is required'
      })
      return
    }

    console.log('Creating web call with assistant:', assistantId)

    // Try web call first, fallback to regular call if needed
    let call
    try {
      call = await vapiService.createWebCall(assistantId)
    } catch (webCallError) {
      console.log('Web call failed, trying regular call without phone number:', webCallError)
      // If web call fails, try creating a regular call session
      call = await vapiService.createCall(assistantId)
    }

    res.status(201).json({
      success: true,
      call,
      message: 'Call session created successfully'
    })

  } catch (error) {
    console.error('Error in POST /api/assistants/:id/call:', error)
    res.status(500).json({
      error: 'Failed to create call session',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// DELETE /api/assistants/:id - Delete an assistant
router.delete('/:id', async (req, res): Promise<void> => {
  try {
    const { id: assistantId } = req.params

    if (!assistantId) {
      res.status(400).json({
        error: 'Assistant ID is required'
      })
      return
    }

    console.log('Deleting assistant:', assistantId)

    await vapiService.deleteAssistant(assistantId)

    res.status(200).json({
      success: true,
      message: 'Assistant deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE /api/assistants/:id:', error)
    res.status(500).json({
      error: 'Failed to delete assistant',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router

// GET /api/assistants/call/:callId - Fetch VAPI call details (including transcript)
router.get('/call/:callId', async (req, res): Promise<void> => {
  try {
    const { callId } = req.params

    if (!callId) {
      res.status(400).json({ error: 'callId is required' })
      return
    }

    const call = await vapiService.getCall(callId)
    res.status(200).json({ success: true, call })
  } catch (error) {
    console.error('Error in GET /api/assistants/call/:callId:', error)
    res.status(500).json({
      error: 'Failed to fetch call details',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
