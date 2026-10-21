import { describe, expect, it } from 'vitest'
import { demoSeed } from '../../data/demoSeed'
import { generateAIHandoff } from './generate'

describe('AI handoff', () => {
  it('generates the seven portable files with current state and raw CSV', () => {
    const files = generateAIHandoff(demoSeed)
    expect(Object.keys(files)).toEqual(['coach_update.md', 'athlete_profile.md', 'AI_CONTEXT.md', 'recent_sessions.md', 'sets.csv', 'workouts.csv', 'exercises.csv', 'ai_handoff_prompt.md'])
    expect(files['AI_CONTEXT.md']).toContain('Synthetic demo athlete')
    expect(files['recent_sessions.md']).toContain('Barbell Bench Press')
    expect(files['sets.csv'].split('\n')).toHaveLength(demoSeed.sets.length + 1)
    expect(files['coach_update.md']).toContain('四周基础力量阶段')
  })
})
