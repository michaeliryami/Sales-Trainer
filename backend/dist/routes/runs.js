"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    try {
        console.log('Creating new training run:', req.body);
        const newRun = {
            id: `run_${Date.now()}`,
            status: 'created',
            createdAt: new Date().toISOString(),
            ...req.body
        };
        res.status(201).json({
            success: true,
            data: newRun,
            message: 'Training run created successfully'
        });
    }
    catch (error) {
        console.error('Error creating training run:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create training run'
        });
    }
});
router.get('/', async (req, res) => {
    try {
        const runs = [
            {
                id: 'run_1',
                status: 'completed',
                createdAt: '2024-01-01T00:00:00Z',
                duration: 1200
            },
            {
                id: 'run_2',
                status: 'in_progress',
                createdAt: '2024-01-02T00:00:00Z',
                duration: null
            }
        ];
        res.json({
            success: true,
            data: runs,
            count: runs.length
        });
    }
    catch (error) {
        console.error('Error fetching training runs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch training runs'
        });
    }
});
exports.default = router;
//# sourceMappingURL=runs.js.map