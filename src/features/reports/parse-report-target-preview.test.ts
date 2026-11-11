import { describe, expect, it } from 'vitest'
import { TARGET_ID, buildReport } from '@/features/reports/reports.test-fixtures'
import { parseReportTargetPreview } from './parse-report-target-preview'

describe('parseReportTargetPreview', () => {
  it('reads a list snapshot', () => {
    const preview = parseReportTargetPreview(
      buildReport({
        targetType: 'list',
        targetSnapshot: {
          title: 'Birthday',
          description: 'My wishes',
          listStatus: 'archived',
          owner: { username: 'alice' },
          tags: [{ name: 'urgent' }],
        },
      }),
    )
    expect(preview).toMatchObject({
      title: 'Birthday',
      description: 'My wishes',
      listStatus: 'archived',
      ownerName: 'alice',
      tags: ['urgent'],
    })
  })

  it('reads an item snapshot', () => {
    const preview = parseReportTargetPreview(
      buildReport({
        targetType: 'item',
        targetSnapshot: {
          name: 'Headphones',
          image: { urls: { sm: 'https://cdn.example.com/sm.webp' } },
          categories: [{ name: 'Electronics' }],
          sources: [{ sourceUrl: 'https://shop.example.com/1' }, { sourceUrl: null }],
        },
      }),
    )
    expect(preview).toMatchObject({
      title: 'Headphones',
      imageUrl: 'https://cdn.example.com/sm.webp',
      categories: ['Electronics'],
      sourceUrls: ['https://shop.example.com/1'],
    })
  })

  it('reads a user snapshot', () => {
    const preview = parseReportTargetPreview(
      buildReport({
        targetType: 'user',
        targetSnapshot: {
          username: 'bob',
          role: 'moderator',
          avatar: { urls: { sm: 'https://cdn.example.com/avatar.webp' } },
        },
      }),
    )
    expect(preview).toMatchObject({
      title: 'bob',
      role: 'moderator',
      imageUrl: 'https://cdn.example.com/avatar.webp',
    })
  })

  it('ignores missing or unexpected fields', () => {
    const preview = parseReportTargetPreview(
      buildReport({
        targetType: 'list',
        targetId: TARGET_ID,
        targetSnapshot: {
          title: 42,
          description: { text: 'nope' },
          image: 'not-an-object',
          owner: 'alice',
          listStatus: 'unknown',
          role: 'superadmin',
          tags: 'urgent',
          categories: [null, { name: 3 }],
        },
      }),
    )
    expect(preview).toEqual({
      title: TARGET_ID,
      description: null,
      imageUrl: null,
      ownerName: null,
      listStatus: null,
      role: null,
      tags: [],
      categories: [],
      sourceUrls: [],
    })
  })
})
