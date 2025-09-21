"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vapi_1 = require("../services/vapi");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    try {
        const { persona, difficulty, insuranceType } = req.body;
        if (!persona || !difficulty || !insuranceType) {
            res.status(400).json({
                error: 'Missing required fields',
                required: ['persona', 'difficulty', 'insuranceType']
            });
            return;
        }
        const validDifficulties = ['easy', 'medium', 'hard', 'expert'];
        if (!validDifficulties.includes(difficulty)) {
            res.status(400).json({
                error: 'Invalid difficulty level',
                validOptions: validDifficulties
            });
            return;
        }
        const validInsuranceTypes = ['life', 'health', 'auto', 'home', 'business', 'disability'];
        if (!validInsuranceTypes.includes(insuranceType)) {
            res.status(400).json({
                error: 'Invalid insurance type',
                validOptions: validInsuranceTypes
            });
            return;
        }
        console.log('Creating VAPI assistant with:', { persona, difficulty, insuranceType });
        const assistant = await vapi_1.vapiService.createAssistant({
            persona,
            difficulty,
            insuranceType
        });
        res.status(201).json({
            success: true,
            assistant,
            message: 'Assistant created successfully'
        });
    }
    catch (error) {
        console.error('Error in POST /api/assistants:', error);
        res.status(500).json({
            error: 'Failed to create assistant',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/:id/call', async (req, res) => {
    try {
        const { id: assistantId } = req.params;
        const { phoneNumber } = req.body;
        if (!assistantId) {
            res.status(400).json({
                error: 'Assistant ID is required'
            });
            return;
        }
        console.log('Creating call with assistant:', assistantId);
        const call = await vapi_1.vapiService.createCall(assistantId, phoneNumber);
        res.status(201).json({
            success: true,
            call,
            message: 'Call created successfully'
        });
    }
    catch (error) {
        console.error('Error in POST /api/assistants/:id/call:', error);
        res.status(500).json({
            error: 'Failed to create call',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=assistants.js.map