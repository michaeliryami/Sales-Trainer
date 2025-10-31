// Built-in Rubric Library for Life Insurance Sales Training

export interface RubricCategory {
  name: string
  description: string
  weight: number // percentage (e.g., 30 for 30%)
  maxScore: 10
}

export interface BuiltInRubric {
  id: string
  title: string
  description: string
  categories: RubricCategory[]
  isBuiltIn: true
}

// The General Life Insurance Sales Rubric
export const GENERAL_LIFE_INSURANCE_RUBRIC: BuiltInRubric = {
  id: 'general-life-insurance',
  title: 'General Life Insurance Sales Rubric',
  description: 'Comprehensive evaluation rubric for life insurance sales calls based on industry best practices',
  isBuiltIn: true,
  categories: [
    {
      name: 'Tonality & Emotional Control',
      description: 'Voice energy, tempo, confidence, conviction',
      weight: 35,
      maxScore: 10
    },
    {
      name: 'Framing & Control',
      description: 'Maintains alpha frame, leads conversation, pattern interrupts',
      weight: 20,
      maxScore: 10
    },
    {
      name: 'Rapport & Mirror Matching',
      description: 'Builds trust, mirrors tone, creates likability',
      weight: 15,
      maxScore: 10
    },
    {
      name: 'Objection Handling',
      description: 'Calm, reframes objections, loops effectively',
      weight: 12,
      maxScore: 10
    },
    {
      name: 'Straight Line Structure',
      description: 'Logical flow, qualification, assumptive close',
      weight: 8,
      maxScore: 10
    },
    {
      name: 'Listening & Empathy',
      description: 'Active listening, emotional labeling, summarizing',
      weight: 5,
      maxScore: 10
    },
    {
      name: 'Closing Language',
      description: 'Assumptive close, urgency, confidence',
      weight: 3,
      maxScore: 10
    },
    {
      name: 'Product Knowledge',
      description: 'Simplifies complexity, clear benefit articulation',
      weight: 2,
      maxScore: 10
    }
  ]
}

// Example of additional rubrics that admins can see as templates
export const ADDITIONAL_RUBRICS: BuiltInRubric[] = [
  {
    id: 'beginner-friendly',
    title: 'Beginner-Friendly Rubric',
    description: 'Simplified rubric focusing on core fundamentals for new agents',
    isBuiltIn: true,
    categories: [
      {
        name: 'Communication Clarity',
        description: 'Clear speech, proper pace, understandable language',
        weight: 40,
        maxScore: 10
      },
      {
        name: 'Active Listening',
        description: 'Demonstrates listening, asks questions, acknowledges customer',
        weight: 30,
        maxScore: 10
      },
      {
        name: 'Product Knowledge',
        description: 'Understands basic products, can explain benefits',
        weight: 20,
        maxScore: 10
      },
      {
        name: 'Professionalism',
        description: 'Polite, respectful, appropriate tone',
        weight: 10,
        maxScore: 10
      }
    ]
  },
  {
    id: 'advanced-closer',
    title: 'Advanced Closer Rubric',
    description: 'High-level evaluation for experienced agents focused on closing',
    isBuiltIn: true,
    categories: [
      {
        name: 'Frame Control',
        description: 'Maintains dominant frame, leads conversation, controls pace',
        weight: 25,
        maxScore: 10
      },
      {
        name: 'Advanced Objection Handling',
        description: 'Reframes complex objections, uses advanced techniques, stays calm',
        weight: 25,
        maxScore: 10
      },
      {
        name: 'Closing Mastery',
        description: 'Multiple closing techniques, assumptive language, creates urgency',
        weight: 20,
        maxScore: 10
      },
      {
        name: 'Tonality & Influence',
        description: 'Expert voice control, emotional intelligence, persuasive tonality',
        weight: 15,
        maxScore: 10
      },
      {
        name: 'Qualification & Discovery',
        description: 'Uncovers pain points, qualifies effectively, builds need',
        weight: 10,
        maxScore: 10
      },
      {
        name: 'Rapport Building',
        description: 'Quick rapport, mirrors effectively, creates trust',
        weight: 5,
        maxScore: 10
      }
    ]
  }
]

export const ALL_BUILT_IN_RUBRICS = [
  GENERAL_LIFE_INSURANCE_RUBRIC,
  ...ADDITIONAL_RUBRICS
]

// Helper function to calculate weighted score
export function calculateWeightedScore(categoryScores: { [categoryName: string]: number }, rubric: BuiltInRubric): number {
  let totalScore = 0
  
  rubric.categories.forEach(category => {
    const score = categoryScores[category.name] || 0
    const weightedScore = (score / category.maxScore) * category.weight
    totalScore += weightedScore
  })
  
  return Math.round(totalScore * 10) / 10 // Round to 1 decimal place
}

// Helper function to get category breakdown
export function getCategoryBreakdown(categoryScores: { [categoryName: string]: number }, rubric: BuiltInRubric) {
  return rubric.categories.map(category => {
    const score = categoryScores[category.name] || 0
    const weightedScore = (score / category.maxScore) * category.weight
    return {
      name: category.name,
      score,
      maxScore: category.maxScore,
      weight: category.weight,
      weightedScore: Math.round(weightedScore * 10) / 10
    }
  })
}

