"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = require("../config/supabase");
const router = express_1.default.Router();
router.post('/check-emails', async (req, res) => {
    try {
        const { emails } = req.body;
        if (!emails || !Array.isArray(emails)) {
            return res.status(400).json({ error: 'Emails array is required' });
        }
        console.log('Checking profiles for emails:', emails);
        const { data: profiles, error } = await supabase_1.supabase
            .from('profiles')
            .select('email')
            .in('email', emails);
        if (error) {
            console.error('Error querying profiles:', error);
            return res.status(500).json({ error: 'Failed to check emails' });
        }
        console.log('Profiles found:', profiles);
        const existingEmails = (profiles || []).map(p => p.email);
        console.log('Existing emails in profiles:', existingEmails);
        const accepted = emails.filter(email => existingEmails.includes(email));
        const pending = emails.filter(email => !existingEmails.includes(email));
        console.log('Accepted emails:', accepted);
        console.log('Pending emails:', pending);
        return res.json({
            accepted,
            pending,
            total: emails.length,
            found: existingEmails.length
        });
    }
    catch (error) {
        console.error('Error in check-emails:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/organization/:orgId', async (req, res) => {
    try {
        const { orgId } = req.params;
        console.log('Fetching profiles for organization:', orgId);
        const { data: profiles, error } = await supabase_1.supabase
            .from('profiles')
            .select('id, display_name, email, role, created_at')
            .eq('org', orgId)
            .order('display_name', { ascending: true });
        if (error) {
            console.error('Error fetching organization profiles:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch organization profiles'
            });
        }
        console.log(`Found ${profiles?.length || 0} profiles for org ${orgId}`);
        return res.json({
            success: true,
            data: profiles || []
        });
    }
    catch (error) {
        console.error('Error in organization profiles:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=profiles.js.map