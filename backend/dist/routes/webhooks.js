"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post('/vapi', async (req, res) => {
    try {
        console.log('VAPI webhook received:', {
            headers: req.headers,
            body: req.body,
            timestamp: new Date().toISOString()
        });
        const webhookData = {
            id: `webhook_${Date.now()}`,
            type: req.body.type || 'unknown',
            processed: true,
            receivedAt: new Date().toISOString(),
            data: req.body
        };
        res.status(200).json({
            success: true,
            message: 'Webhook processed successfully',
            webhookId: webhookData.id
        });
    }
    catch (error) {
        console.error('Error processing VAPI webhook:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process webhook'
        });
    }
});
router.get('/vapi', (req, res) => {
    res.json({
        success: true,
        message: 'VAPI webhook endpoint is active',
        endpoint: '/api/webhooks/vapi',
        methods: ['POST']
    });
});
exports.default = router;
//# sourceMappingURL=webhooks.js.map