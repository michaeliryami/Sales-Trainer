"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const detectEnvironment = () => {
    if (process.env.NODE_ENV === 'production') {
        return 'production';
    }
    if (process.env.NODE_ENV === 'development') {
        return 'development';
    }
    const port = process.env.PORT || '3002';
    if (port === '3002') {
        return 'development';
    }
    return 'production';
};
const env = detectEnvironment();
const isDevelopment = env === 'development';
const isProduction = env === 'production';
const parseCorsOrigins = () => {
    if (process.env.CORS_ORIGINS) {
        return process.env.CORS_ORIGINS.split(',').map(origin => origin.trim());
    }
    if (isDevelopment) {
        return ['http://localhost:3000', 'http://localhost:3001'];
    }
    return [];
};
const validateConfig = () => {
    const required = [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_KEY',
        'OPENAI_API_KEY',
        'VAPI_API_KEY'
    ];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
        console.error('Please check your .env file');
        process.exit(1);
    }
};
validateConfig();
exports.config = {
    env,
    isDevelopment,
    isProduction,
    port: parseInt(process.env.PORT || '3002', 10),
    corsOrigins: parseCorsOrigins(),
    logLevel: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    supabase: {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
        serviceKey: process.env.SUPABASE_SERVICE_KEY,
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
    },
    vapi: {
        apiKey: process.env.VAPI_API_KEY,
        publicKey: process.env.VAPI_PUBLIC_KEY || process.env.VAPI_API_KEY,
    },
};
console.log('🔧 Environment Configuration:');
console.log(`   Environment: ${exports.config.env}`);
console.log(`   Port: ${exports.config.port}`);
console.log(`   CORS Origins: ${exports.config.corsOrigins.join(', ') || 'None (will reject all cross-origin requests)'}`);
console.log(`   Log Level: ${exports.config.logLevel}`);
console.log(`   Supabase: ${exports.config.supabase.url}`);
console.log(`   OpenAI: ${exports.config.openai.apiKey ? '✓ Configured' : '✗ Missing'}`);
console.log(`   VAPI: ${exports.config.vapi.apiKey ? '✓ Configured' : '✗ Missing'}`);
//# sourceMappingURL=environment.js.map