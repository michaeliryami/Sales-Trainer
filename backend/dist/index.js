"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
console.log('Environment variables loaded:', {
    SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Missing',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing',
    VAPI_API_KEY: process.env.VAPI_API_KEY ? 'Set' : 'Missing'
});
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const runs_1 = __importDefault(require("./routes/runs"));
const webhooks_1 = __importDefault(require("./routes/webhooks"));
const assistants_1 = __importDefault(require("./routes/assistants"));
const templates_1 = __importDefault(require("./routes/templates"));
const invites_1 = __importDefault(require("./routes/invites"));
const profiles_1 = __importDefault(require("./routes/profiles"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.get('/api/config', (req, res) => {
    res.json({
        vapiPublicKey: process.env.VAPI_PUBLIC_KEY || process.env.VAPI_API_KEY
    });
});
app.use('/api/runs', runs_1.default);
app.use('/api/webhooks', webhooks_1.default);
app.use('/api/assistants', assistants_1.default);
app.use('/api/templates', templates_1.default);
app.use('/api/invites', invites_1.default);
app.use('/api/profiles', profiles_1.default);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
//# sourceMappingURL=index.js.map