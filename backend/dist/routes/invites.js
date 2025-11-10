"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = require("../config/supabase");
const router = express_1.default.Router();
async function isUserAdmin(userId, organizationId) {
    const { data: profile, error } = await supabase_1.supabase
        .from('profiles')
        .select('role, org')
        .eq('id', userId)
        .eq('org', organizationId)
        .single();
    if (error || !profile)
        return false;
    return profile.role === 'admin';
}
router.post('/validate', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        console.log('Validating invite for email:', email);
        const { data: organizations, error } = await supabase_1.supabase
            .from('organizations')
            .select('id, name, users, invited_roles');
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
                        const invitedRoles = org.invited_roles || {};
                        const role = invitedRoles[email] || 'employee';
                        return res.json({
                            valid: true,
                            organizationId: org.id,
                            organizationName: org.name,
                            role: role
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
        const { email, organizationId, adminUserId, role = 'employee' } = req.body;
        if (!email || !organizationId || !adminUserId) {
            return res.status(400).json({ error: 'Email, organization ID, and admin user ID are required' });
        }
        if (!['admin', 'employee'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Must be admin or employee' });
        }
        console.log('Inviting user:', { email, organizationId, adminUserId, role });
        const isAdmin = await isUserAdmin(adminUserId, organizationId);
        if (!isAdmin) {
            return res.status(403).json({ error: 'Only organization admins can invite users' });
        }
        const { data: organization, error: orgError } = await supabase_1.supabase
            .from('organizations')
            .select('users, invited_roles')
            .eq('id', organizationId)
            .single();
        if (orgError) {
            console.error('Error fetching organization:', orgError);
            return res.status(500).json({ error: 'Failed to fetch organization' });
        }
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
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
        const invitedRoles = organization.invited_roles || {};
        invitedRoles[email] = role;
        console.log('Updated invited_roles:', invitedRoles);
        const { error: updateError } = await supabase_1.supabase
            .from('organizations')
            .update({
            users: usersList,
            invited_roles: invitedRoles
        })
            .eq('id', organizationId);
        if (updateError) {
            console.error('Error updating organization users:', updateError);
            return res.status(500).json({ error: 'Failed to invite user' });
        }
        console.log(`Successfully invited ${email} to organization ${organizationId} with role ${role}`);
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
        const isAdmin = await isUserAdmin(adminUserId, organizationId);
        if (!isAdmin) {
            return res.status(403).json({ error: 'Only organization admins can remove invitations' });
        }
        const { data: organization, error: orgError } = await supabase_1.supabase
            .from('organizations')
            .select('users, invited_roles')
            .eq('id', organizationId)
            .single();
        if (orgError) {
            console.error('Error fetching organization:', orgError);
            return res.status(500).json({ error: 'Failed to fetch organization' });
        }
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
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
        const invitedRoles = organization.invited_roles || {};
        if (invitedRoles[email]) {
            delete invitedRoles[email];
        }
        const { error: updateError } = await supabase_1.supabase
            .from('organizations')
            .update({
            users: usersList,
            invited_roles: invitedRoles
        })
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
router.delete('/user', async (req, res) => {
    try {
        const { userId, organizationId, adminUserId } = req.body;
        if (!userId || !organizationId || !adminUserId) {
            return res.status(400).json({ error: 'User ID, organization ID, and admin user ID are required' });
        }
        console.log('Removing user from organization:', { userId, organizationId, adminUserId });
        const isAdmin = await isUserAdmin(adminUserId, organizationId);
        if (!isAdmin) {
            return res.status(403).json({ error: 'Only organization admins can remove users' });
        }
        if (userId === adminUserId) {
            return res.status(400).json({ error: 'Cannot remove yourself from the organization' });
        }
        const { data: admins, error: adminCheckError } = await supabase_1.supabase
            .from('profiles')
            .select('id')
            .eq('org', organizationId)
            .eq('role', 'admin');
        if (adminCheckError) {
            console.error('Error checking admins:', adminCheckError);
            return res.status(500).json({ error: 'Failed to check organization admins' });
        }
        const { data: userToRemove, error: userCheckError } = await supabase_1.supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .eq('org', organizationId)
            .single();
        if (userCheckError) {
            console.error('Error checking user role:', userCheckError);
            return res.status(500).json({ error: 'Failed to check user role' });
        }
        if (userToRemove?.role === 'admin' && admins && admins.length <= 1) {
            return res.status(400).json({ error: 'Cannot remove the last admin from the organization' });
        }
        const { error: updateError } = await supabase_1.supabase
            .from('profiles')
            .update({ org: null })
            .eq('id', userId)
            .eq('org', organizationId);
        if (updateError) {
            console.error('Error removing user from organization:', updateError);
            return res.status(500).json({ error: 'Failed to remove user' });
        }
        console.log(`Successfully removed user ${userId} from organization ${organizationId}`);
        return res.json({
            success: true,
            message: `Successfully removed user from organization`,
            removedUserId: userId
        });
    }
    catch (error) {
        console.error('Error removing user:', error);
        return res.status(500).json({ error: 'Failed to remove user' });
    }
});
router.patch('/role', async (req, res) => {
    try {
        const { userId, organizationId, adminUserId, newRole } = req.body;
        if (!userId || !organizationId || !adminUserId || !newRole) {
            return res.status(400).json({ error: 'User ID, organization ID, admin user ID, and new role are required' });
        }
        if (!['admin', 'employee'].includes(newRole)) {
            return res.status(400).json({ error: 'Invalid role. Must be admin or employee' });
        }
        console.log('Updating user role:', { userId, organizationId, adminUserId, newRole });
        const isAdmin = await isUserAdmin(adminUserId, organizationId);
        if (!isAdmin) {
            return res.status(403).json({ error: 'Only organization admins can change user roles' });
        }
        if (newRole === 'employee') {
            const { data: admins, error: adminCheckError } = await supabase_1.supabase
                .from('profiles')
                .select('id')
                .eq('org', organizationId)
                .eq('role', 'admin');
            if (adminCheckError) {
                console.error('Error checking admins:', adminCheckError);
                return res.status(500).json({ error: 'Failed to check organization admins' });
            }
            if (admins && admins.length <= 1) {
                return res.status(400).json({ error: 'Cannot demote the last admin in the organization' });
            }
        }
        const { error: updateError } = await supabase_1.supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)
            .eq('org', organizationId);
        if (updateError) {
            console.error('Error updating user role:', updateError);
            return res.status(500).json({ error: 'Failed to update user role' });
        }
        console.log(`Successfully updated user ${userId} role to ${newRole}`);
        return res.json({
            success: true,
            message: `Successfully updated user role to ${newRole}`,
            userId,
            newRole
        });
    }
    catch (error) {
        console.error('Error updating user role:', error);
        return res.status(500).json({ error: 'Failed to update user role' });
    }
});
exports.default = router;
//# sourceMappingURL=invites.js.map