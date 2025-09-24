"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = require("../config/supabase");
const router = express_1.default.Router();
router.post('/validate', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        console.log('Validating invite for email:', email);
        const { data: organizations, error } = await supabase_1.supabase
            .from('organizations')
            .select('id, name, users');
        if (error) {
            console.error('Error fetching organizations:', error);
            return res.status(500).json({ error: 'Failed to validate invitation' });
        }
        for (const org of organizations || []) {
            if (org.users) {
                let usersList = [];
                try {
                    if (Array.isArray(org.users)) {
                        usersList = org.users;
                    }
                    else if (typeof org.users === 'string') {
                        usersList = JSON.parse(org.users);
                    }
                    if (usersList.includes(email)) {
                        console.log(`Email ${email} found in organization ${org.name} (ID: ${org.id})`);
                        return res.json({
                            valid: true,
                            organizationId: org.id,
                            organizationName: org.name
                        });
                    }
                }
                catch (parseError) {
                    console.error('Error parsing users list for org', org.id, ':', parseError);
                }
            }
        }
        console.log(`Email ${email} not found in any organization's invite list`);
        return res.json({ valid: false });
    }
    catch (error) {
        console.error('Error validating invite:', error);
        return res.status(500).json({ error: 'Failed to validate invitation' });
    }
});
router.post('/invite', async (req, res) => {
    try {
        const { email, organizationId, adminUserId } = req.body;
        if (!email || !organizationId || !adminUserId) {
            return res.status(400).json({ error: 'Email, organization ID, and admin user ID are required' });
        }
        console.log('Inviting user:', { email, organizationId, adminUserId });
        const { data: organization, error: orgError } = await supabase_1.supabase
            .from('organizations')
            .select('admin, users')
            .eq('id', organizationId)
            .single();
        if (orgError) {
            console.error('Error fetching organization:', orgError);
            return res.status(500).json({ error: 'Failed to fetch organization' });
        }
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        if (organization.admin !== adminUserId) {
            return res.status(403).json({ error: 'Only organization admins can invite users' });
        }
        let usersList = [];
        console.log('Organization users field:', organization.users, 'Type:', typeof organization.users);
        if (organization.users) {
            if (Array.isArray(organization.users)) {
                usersList = [...organization.users];
                console.log('Using PostgreSQL array:', usersList);
            }
            else if (typeof organization.users === 'string') {
                try {
                    usersList = JSON.parse(organization.users);
                    console.log('Parsed users list from JSON string:', usersList);
                }
                catch (parseError) {
                    console.error('Error parsing JSON string:', parseError);
                    usersList = [];
                }
            }
        }
        console.log('Current users list before adding new user:', usersList);
        if (usersList.includes(email)) {
            return res.status(400).json({ error: 'User is already invited to this organization' });
        }
        usersList.push(email);
        console.log('Updated users list after adding new user:', usersList);
        const { error: updateError } = await supabase_1.supabase
            .from('organizations')
            .update({ users: usersList })
            .eq('id', organizationId);
        if (updateError) {
            console.error('Error updating organization users:', updateError);
            return res.status(500).json({ error: 'Failed to invite user' });
        }
        console.log(`Successfully invited ${email} to organization ${organizationId}`);
        return res.json({
            success: true,
            message: `Successfully invited ${email}`,
            invitedEmail: email
        });
    }
    catch (error) {
        console.error('Error inviting user:', error);
        return res.status(500).json({ error: 'Failed to invite user' });
    }
});
router.delete('/invite', async (req, res) => {
    try {
        const { email, organizationId, adminUserId } = req.body;
        if (!email || !organizationId || !adminUserId) {
            return res.status(400).json({ error: 'Email, organization ID, and admin user ID are required' });
        }
        console.log('Removing invite for user:', { email, organizationId, adminUserId });
        const { data: organization, error: orgError } = await supabase_1.supabase
            .from('organizations')
            .select('admin, users')
            .eq('id', organizationId)
            .single();
        if (orgError) {
            console.error('Error fetching organization:', orgError);
            return res.status(500).json({ error: 'Failed to fetch organization' });
        }
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        if (organization.admin !== adminUserId) {
            return res.status(403).json({ error: 'Only organization admins can remove invitations' });
        }
        let usersList = [];
        if (organization.users) {
            if (Array.isArray(organization.users)) {
                usersList = [...organization.users];
            }
            else if (typeof organization.users === 'string') {
                try {
                    usersList = JSON.parse(organization.users);
                }
                catch (parseError) {
                    console.error('Error parsing JSON string:', parseError);
                    return res.status(500).json({ error: 'Failed to parse users list' });
                }
            }
        }
        if (!usersList.includes(email)) {
            return res.status(400).json({ error: 'User is not invited to this organization' });
        }
        usersList = usersList.filter(userEmail => userEmail !== email);
        const { error: updateError } = await supabase_1.supabase
            .from('organizations')
            .update({ users: usersList })
            .eq('id', organizationId);
        if (updateError) {
            console.error('Error updating organization users:', updateError);
            return res.status(500).json({ error: 'Failed to remove invitation' });
        }
        console.log(`Successfully removed invitation for ${email} from organization ${organizationId}`);
        return res.json({
            success: true,
            message: `Successfully removed invitation for ${email}`,
            removedEmail: email
        });
    }
    catch (error) {
        console.error('Error removing invitation:', error);
        return res.status(500).json({ error: 'Failed to remove invitation' });
    }
});
exports.default = router;
//# sourceMappingURL=invites.js.map