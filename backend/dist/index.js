"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const environment_1 = require("./config/environment");
const runs_1 = __importDefault(require("./routes/runs"));
const webhooks_1 = __importDefault(require("./routes/webhooks"));
const assistants_1 = __importDefault(require("./routes/assistants"));
const templates_1 = __importDefault(require("./routes/templates"));
const invites_1 = __importDefault(require("./routes/invites"));
const profiles_1 = __importDefault(require("./routes/profiles"));
const ai_1 = __importDefault(require("./routes/ai"));
const export_1 = __importDefault(require("./routes/export"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const assignments_1 = __importDefault(require("./routes/assignments"));
const app = (0, express_1.default)();
const corsOptions = {
    origin: environment_1.config.corsOrigins.length > 0
        ? environment_1.config.corsOrigins
        : environment_1.config.isDevelopment
            ? '*'
            : false,
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
if (environment_1.config.isDevelopment) {
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    });
}
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        environment: environment_1.config.env,
        timestamp: new Date().toISOString()
    });
});
app.get('/api/config', (req, res) => {
    res.json({
        vapiPublicKey: environment_1.config.vapi.publicKey,
        environment: environment_1.config.env
    });
});
app.use('/api/runs', runs_1.default);
app.use('/api/webhooks', webhooks_1.default);
app.use('/api/assistants', assistants_1.default);
app.use('/api/templates', templates_1.default);
app.use('/api/invites', invites_1.default);
app.use('/api/profiles', profiles_1.default);
app.use('/api/ai', ai_1.default);
app.use('/api/export', export_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/assignments', assignments_1.default);
app.use((err, req, res, next) => {
    if (environment_1.config.isDevelopment) {
        console.error('❌ Error:', err.stack);
    }
    else {
        console.error('❌ Error:', err.message);
    }
    res.status(500).json({
        error: environment_1.config.isDevelopment ? err.message : 'Something went wrong!'
    });
});
app.use('*', (req, res) => {
    if (environment_1.config.isDevelopment) {
        console.log(`⚠️  404: ${req.method} ${req.originalUrl}`);
    }
    res.status(404).json({ error: 'Route not found' });
});
app.listen(environment_1.config.port, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Clozone API Server - ${environment_1.config.env.toUpperCase()}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`   Server: http://localhost:${environment_1.config.port}`);
    console.log(`   Health: http://localhost:${environment_1.config.port}/api/health`);
    console.log(`   Status: Ready to accept requests`);
    console.log(`${'='.repeat(60)}\n`);
});
//# sourceMappingURL=index.js.map