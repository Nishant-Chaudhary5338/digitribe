import { describe, it, expect } from 'vitest'
import { toViewModel } from '../../../lib/store/artifact-view-model'

describe('toViewModel', () => {
  it('extracts score + grade + dimensions + files from an Agent-Ready Kit shape', () => {
    const vm = toViewModel({
      overallScore: 50,
      grade: 'D',
      dimensions: [
        {
          key: 'crawlability',
          label: 'Crawlability',
          score: 100,
          status: 'good',
          findings: ['ok'],
        },
      ],
      files: [{ path: 'llms.txt', contents: '# X' }],
      topActions: ['do a', 'do b'],
    })
    expect(vm.score).toBe(50)
    expect(vm.grade).toBe('D')
    expect(vm.dimensions[0]?.key).toBe('crawlability')
    expect(vm.files[0]?.path).toBe('llms.txt')
    expect(vm.lists.find((l) => l.title === 'Top actions')?.items).toEqual(['do a', 'do b'])
  })

  it('reads postureScore/score variants', () => {
    expect(toViewModel({ postureScore: 80 }).score).toBe(80)
    expect(toViewModel({ score: 30 }).score).toBe(30)
  })

  it('uses summary as a headline and surfaces string lists', () => {
    const vm = toViewModel({ summary: 'covers 2 invariants', coveredInvariants: ['a', 'b'] })
    expect(vm.headline).toBe('covers 2 invariants')
    expect(vm.lists[0]).toEqual({ title: 'Covered invariants', items: ['a', 'b'] })
  })

  it('degrades gracefully for an unknown shape (raw kept, no crash)', () => {
    const vm = toViewModel({ hooks: [{ angle: 'x', hook: 'y' }] })
    expect(vm.score).toBeUndefined()
    expect(vm.dimensions).toEqual([])
    expect(vm.files).toEqual([])
    expect(vm.raw).toBeTruthy()
  })

  it('never throws on a non-object artifact', () => {
    expect(toViewModel(null).raw).toBeNull()
    expect(toViewModel('x').dimensions).toEqual([])
  })
})
