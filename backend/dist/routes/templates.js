"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../config/supabase");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    try {
        const { title, description, insuranceType, difficulty, script, org } = req.body;
        if (!title || !description || !insuranceType || !difficulty || !script) {
            res.status(400).json({
                error: 'Missing required fields',
                required: ['title', 'description', 'insuranceType', 'difficulty', 'script']
            });
            return;
        }
        const insertData = {
            title,
            description,
            difficulty,
            type: insuranceType,
            script,
            org: org ? Number(org) : null
        };
        const { data: newTemplate, error: insertError } = await supabase_1.supabase
            .from('templates')
            .insert(insertData)
            .select()
            .single();
        if (insertError) {
            console.error('Supabase error:', insertError);
            throw new Error(`Database error: ${insertError.message}`);
        }
        console.log(`Created new template: ${title} (${insuranceType}, ${difficulty})`);
        res.status(201).json({
            success: true,
            template: {
                ...newTemplate,
                script: script.substring(0, 200) + (script.length > 200 ? '...' : '')
            }
        });
    }
    catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/', async (req, res) => {
    try {
        const { data: templates, error } = await supabase_1.supabase
            .from('templates')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Supabase error:', error);
            throw new Error(`Database error: ${error.message}`);
        }
        const templateSummaries = templates.map(template => ({
            id: template.id,
            title: template.title,
            description: template.description,
            insuranceType: template.type,
            difficulty: template.difficulty,
            createdAt: template.created_at,
            scriptPreview: template.script.substring(0, 150) + (template.script.length > 150 ? '...' : '')
        }));
        res.json({
            success: true,
            templates: templateSummaries,
            total: templates.length
        });
    }
    catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: template, error } = await supabase_1.supabase
            .from('templates')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                res.status(404).json({
                    error: 'Template not found',
                    id
                });
                return;
            }
            console.error('Supabase error:', error);
            throw new Error(`Database error: ${error.message}`);
        }
        res.json({
            success: true,
            template: {
                ...template,
                insuranceType: template.type
            }
        });
    }
    catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, insuranceType, difficulty, script } = req.body;
        const updateBody = {
            title,
            description,
            type: insuranceType,
            difficulty,
            script
        };
        const { data: updatedTemplate, error } = await supabase_1.supabase
            .from('templates')
            .update(updateBody)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('Supabase error:', error);
            throw new Error(error.message);
        }
        res.json({ success: true, template: updatedTemplate });
    }
    catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({ error: 'Failed to update template' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase_1.supabase
            .from('templates')
            .delete()
            .eq('id', id);
        if (error) {
            console.error('Supabase error:', error);
            throw new Error(`Database error: ${error.message}`);
        }
        console.log(`Deleted template with ID: ${id}`);
        res.json({
            success: true,
            message: 'Template deleted successfully',
            deletedTemplateId: id
        });
    }
    catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=templates.js.map