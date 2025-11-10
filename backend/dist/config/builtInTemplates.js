"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUILT_IN_TEMPLATES = void 0;
exports.getTemplateName = getTemplateName;
exports.BUILT_IN_TEMPLATES = {
    'objection-handling-pro': 'Objection Handling Pro',
    'cold-calling-basics': 'Cold Calling Basics',
    'discovery-deep-dive': 'Discovery Call Deep Dive',
    'closing-techniques': 'Closing Techniques Mastery',
    'referral-request': 'Referral Request Practice',
    'price-justification': 'Price Justification',
    'competitor-comparison': 'Competitor Comparison',
    'follow-up-mastery': 'Follow-Up Call Mastery',
    'budget-concerns': 'Budget Concerns Handler',
    'decision-maker-access': 'Decision Maker Access',
    'value-proposition': 'Value Proposition Builder',
    'urgency-creator': 'Urgency & Scarcity Creator'
};
function getTemplateName(templateId) {
    if (!templateId)
        return 'Unknown Template';
    if (typeof templateId === 'string' && isNaN(Number(templateId))) {
        return exports.BUILT_IN_TEMPLATES[templateId] || 'Unknown Template';
    }
    return null;
}
//# sourceMappingURL=builtInTemplates.js.map