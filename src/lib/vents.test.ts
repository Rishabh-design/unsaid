import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import { vents } from './vents'

describe('Vent Space (on-device preview mode)', () => {
  beforeEach(async () => {
    await db.demoVents.clear()
    localStorage.setItem('unsaid-demo-seeded', '1')
  })

  it('posts, hugs, replies and deletes', async () => {
    expect(vents.live).toBe(false)
    const v = await vents.post('  heavy day  ')
    expect(v.body).toBe('heavy day')
    expect(v.isMine).toBe(true)

    await expect(vents.toggleHug(v.id)).rejects.toThrow(/own vent/)
    await db.demoVents.add({ id: 'other', body: 'someone else', createdAt: Date.now(), isMine: 0, hugCount: 0, huggedByMe: 0, replies: [] })
    const hug = await vents.toggleHug('other')
    expect(hug).toEqual({ hugged: true, hugCount: 1 })
    expect((await vents.toggleHug('other')).hugged).toBe(false)

    await vents.reply(v.id, 'you’re not alone')
    const detail = await vents.get(v.id)
    expect(detail?.replies).toHaveLength(1)
    expect(detail?.vent.replyCount).toBe(1)

    expect(await vents.mine()).toHaveLength(1)
    await vents.remove(v.id)
    expect(await vents.mine()).toHaveLength(0)
  })

  it('hides vents older than 24 hours', async () => {
    await db.demoVents.add({ id: 'old', body: 'old', createdAt: Date.now() - 25 * 3_600_000, isMine: 0, hugCount: 0, huggedByMe: 0, replies: [] })
    expect((await vents.feed()).map((v) => v.id)).not.toContain('old')
  })

  it('rate-limits to 5 vents an hour', async () => {
    for (let i = 0; i < 5; i++) await vents.post(`vent ${i}`)
    await expect(vents.post('one more')).rejects.toThrow(/breath/)
  })
})
