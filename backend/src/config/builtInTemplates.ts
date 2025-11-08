// Built-in template ID to name mapping
// This should match the template IDs from frontend/src/config/templateLibrary.ts

export const BUILT_IN_TEMPLATES: Record<string, string> = {
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
}

export function getTemplateName(templateId: any): string {
  // If it's null or undefined
  if (!templateId) return 'Unknown Template'
  
  // If it's a string (built-in template ID)
  if (typeof templateId === 'string' && isNaN(Number(templateId))) {
    return BUILT_IN_TEMPLATES[templateId] || 'Unknown Template'
  }
  
  // If it's a number, it needs to be looked up from database
  return null as any // Signal that DB lookup is needed
}

