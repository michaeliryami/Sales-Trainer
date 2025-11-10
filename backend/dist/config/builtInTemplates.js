"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUILT_IN_TEMPLATES = void 0;
exports.getTemplateName = getTemplateName;
exports.BUILT_IN_TEMPLATES = {
    'family-protector': 'The Family Protector',
    'busy-professional': 'The Busy Professional',
    'the-skeptic': 'The Skeptic',
    'whatever-guy': 'The "Whatever" Guy',
    'fixed-income': 'The Fixed-Income Person',
    'young-single': 'The Young Single Professional',
    'recent-widow': 'The Recent Widow/Widower',
    'recently-married': 'The Recently Married Couple',
    'small-business-owner': 'The Small Business Owner',
    'diabetic-leadgen': 'The Diabetic Lead',
    'veteran-lead': 'The Veteran',
    'cancer-survivor': 'The Cancer Survivor',
    'expecting-parents': 'The Expecting Parents',
    'blue-collar-worker': 'The Blue Collar Worker',
    'executive': 'The Executive',
    'divorcee': 'The Divorcee',
    'teacher': 'The Teacher',
    'nurse': 'The Healthcare Worker',
    'empty-nester': 'The Empty Nester',
    'objection-master': 'The Objection Master',
    'mlm-person': 'The MLM Person',
    'know-it-all': 'The Know-It-All',
    'conspiracy-theorist': 'The Conspiracy Theorist',
    'impulse-buyer': 'The Impulse Buyer',
    'elderly-confused': 'The Elderly Confused Lead',
    'chronic-shopper': 'The Chronic Shopper',
    'policy-flipper': 'The Policy Flipper',
    'passive-aggressive': 'The Passive-Aggressive Lead',
    'spouse-controller': 'The Controlled Spouse',
    'analysis-paralysis': 'The Analysis Paralysis',
    'bargain-hunter': 'The Extreme Bargain Hunter',
    'recently-fired': 'The Recently Unemployed',
    'trust-fund-kid': 'The Trust Fund Kid',
    'terminal-diagnosis': 'The Terminal Diagnosis',
    'debt-collector-dodger': 'The Debt-Dodger',
    'language-barrier': 'The Language Barrier Lead',
    'influencer': 'The Social Media Influencer',
    'emergency-room': 'The Emergency Room Call',
    'competitor-agent': 'The Competitor Shopping You',
    'ghost-lead': 'The Ghost (Never Answers)'
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