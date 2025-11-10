"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
if (process.env.NODE_ENV === 'production') {
    console.log('✅ Running in PRODUCTION - using environment variables from hosting platform');
}
else {
    const envPath = path_1.default.resolve(process.cwd(), '.env');
    const result = dotenv_1.default.config({ path: envPath });
    if (result.error) {
        console.error('❌ Failed to load .env file from:', envPath);
        console.error('Error:', result.error.message);
        console.error('\nMake sure you have a .env file in the backend folder!');
        process.exit(1);
    }
    console.log('✅ Environment variables loaded from:', envPath);
}
//# sourceMappingURL=setup-env.js.map