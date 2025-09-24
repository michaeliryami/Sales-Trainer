"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
let _supabase = null;
function getSupabaseClient() {
    if (_supabase) {
        return _supabase;
    }
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase environment variables missing:', {
            SUPABASE_URL: supabaseUrl ? 'Set' : 'Missing',
            SUPABASE_ANON_KEY: supabaseKey ? 'Set' : 'Missing'
        });
        throw new Error('Missing Supabase environment variables. Please check SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
    }
    _supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    return _supabase;
}
exports.supabase = new Proxy({}, {
    get(target, prop) {
        const client = getSupabaseClient();
        return client[prop];
    }
});
exports.default = exports.supabase;
//# sourceMappingURL=supabase.js.map