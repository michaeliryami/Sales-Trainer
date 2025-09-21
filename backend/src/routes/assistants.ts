import { Router } from 'express'
import { vapiService, CreateAssistantRequest } from '../services/vapi'

const router = Router()

// POST /api/assistants - Create a new VAPI assistant
router.post('/', async (req, res): Promise<void> => {
  try {
    const { template, accountType }: CreateAssistantRequest = req.body

    // Validate required fields
    if (!template || !accountType) {
      res.status(400).json({
        error: 'Missing required fields',
        required: ['template', 'accountType']
      })
      return
    }

    // Validate template
    const validTemplates = ['skeptical-cfo', 'busy-entrepreneur', 'concerned-parent', 'price-shopper']
    if (!validTemplates.includes(template)) {
      res.status(400).json({
        error: 'Invalid template',
        validOptions: validTemplates
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

    console.log('Updating VAPI assistant with template:', { template, accountType })

    const assistant = await vapiService.updateAssistant({
      template,
      accountType
    })

    res.status(200).json({
      success: true,
      assistant,
      message: `Assistant updated successfully with ${template} template`
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
