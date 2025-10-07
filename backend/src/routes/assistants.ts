import { Router } from 'express'
import { vapiService, CreateAssistantRequest } from '../services/vapi'
import { supabase } from '../config/supabase'

const router = Router()

// POST /api/assistants - Create a new VAPI assistant
router.post('/', async (req, res): Promise<void> => {
  try {
    const { templateId, accountType, scriptContent } = req.body

    // Validate required fields
    if (!templateId || !accountType) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['templateId', 'accountType']
      })
      return
    }

    // Fetch template from Supabase
    const { data: template, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (error || !template) {
      res.status(404).json({
        error: 'Template not found',
        templateId
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

    console.log('Updating VAPI assistant with template:', { templateId, template: template.title, accountType })

    // If scriptContent is provided, use it to override the template script
    const templateWithScript = scriptContent ? { ...template, script: scriptContent } : template

    const assistant = await vapiService.updateAssistantWithTemplate({
      template: templateWithScript,
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
