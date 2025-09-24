"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vapi_1 = require("../services/vapi");
const supabase_1 = require("../config/supabase");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    try {
        const { templateId, accountType, scriptContent } = req.body;
        if (!templateId || !accountType) {
            res.status(400).json({
                error: 'Missing required fields',
                required: ['templateId', 'accountType']
            });
            return;
        }
        const { data: template, error } = await supabase_1.supabase
            .from('templates')
            .select('*')
            .eq('id', templateId)
            .single();
        if (error || !template) {
            res.status(404).json({
                error: 'Template not found',
                templateId
            });
            return;
        }
        const validAccountTypes = ['employee', 'manager', 'admin'];
        if (!validAccountTypes.includes(accountType)) {
            res.status(400).json({
                error: 'Invalid account type',
                validOptions: validAccountTypes
            });
            return;
        }
        console.log('Updating VAPI assistant with template:', { templateId, template: template.title, accountType });
        const templateWithScript = scriptContent ? { ...template, script: scriptContent } : template;
        const assistant = await vapi_1.vapiService.updateAssistantWithTemplate({
            template: templateWithScript,
            accountType
        });
        res.status(200).json({
            success: true,
            assistant,
            message: `Assistant updated successfully with ${template.title} template`
        });
    }
    catch (error) {
        console.error('Error in POST /api/assistants:', error);
        res.status(500).json({
            error: 'Failed to update assistant',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/:id/call', async (req, res) => {
    try {
        const { id: assistantId } = req.params;
        if (!assistantId) {
            res.status(400).json({
                error: 'Assistant ID is required'
            });
            return;
        }
        console.log('Creating web call with assistant:', assistantId);
        let call;
        try {
            call = await vapi_1.vapiService.createWebCall(assistantId);
        }
        catch (webCallError) {
            console.log('Web call failed, trying regular call without phone number:', webCallError);
            call = await vapi_1.vapiService.createCall(assistantId);
        }
        res.status(201).json({
            success: true,
            call,
            message: 'Call session created successfully'
        });
    }
    catch (error) {
        console.error('Error in POST /api/assistants/:id/call:', error);
        res.status(500).json({
            error: 'Failed to create call session',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=assistants.js.map