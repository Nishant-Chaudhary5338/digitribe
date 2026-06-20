import { describe, it, expect, vi, beforeEach } from 'vitest'

const h = vi.hoisted(() => ({
  insertReturning: vi.fn(async (): Promise<{ id: string }[]> => [{ id: 'pu1' }]),
  updateSet: vi.fn(async (_v: unknown) => {}),
  selectReturning: vi.fn(
    async (): Promise<{ id: string; accessJti: string | null }[]> => [
      { id: 'pu1', accessJti: 'jti1' },
    ]
  ),
  mintToken: vi.fn(async () => 'PAYLOAD.SIG'),
  issueLicense: vi.fn(async () => 'LIC-KEY'),
  revokeToken: vi.fn(async () => {}),
  revokeLicensesForPurchase: vi.fn(async () => {}),
  sendReceipt: vi.fn(async () => {}),
  product: { delivery: 'in-browser', runsPerPurchase: 3, name: 'P' },
}))

vi.mock('../../../server/store/db/client', () => ({
  db: () => ({
    insert: () => ({
      values: () => ({ onConflictDoNothing: () => ({ returning: h.insertReturning }) }),
    }),
    update: () => ({ set: (v: unknown) => ({ where: () => h.updateSet(v) }) }),
    select: () => ({ from: () => ({ where: () => ({ limit: h.selectReturning }) }) }),
  }),
}))
vi.mock('../../../lib/store/access', () => ({
  mintToken: h.mintToken,
  revokeToken: h.revokeToken,
  tokenJti: () => 'jti1',
}))
vi.mock('../../../lib/store/license', () => ({
  issueLicense: h.issueLicense,
  revokeLicensesForPurchase: h.revokeLicensesForPurchase,
}))
vi.mock('../../../lib/store/products', () => ({ getProduct: () => h.product }))
vi.mock('../../../lib/store/email', () => ({ sendReceipt: h.sendReceipt }))
vi.mock('../../../lib/store/env', () => ({
  storeEnv: () => ({ STORE_BASE_URL: 'https://s.test' }),
}))
vi.mock('@vercel/kv', () => ({
  kv: { set: async () => 'OK', del: async () => 1, get: async () => null },
}))

import { fulfilOrderPaid, fulfilRefund } from '../../../lib/store/fulfilment'

beforeEach(() => {
  vi.clearAllMocks()
  h.product.delivery = 'in-browser'
  h.insertReturning.mockResolvedValue([{ id: 'pu1' }])
  h.selectReturning.mockResolvedValue([{ id: 'pu1', accessJti: 'jti1' }])
})

describe('webhook fulfilment', () => {
  it('in-browser order.paid mints a token and persists accessJti durably', async () => {
    const r = await fulfilOrderPaid(
      { orderId: 'o1', slug: 'p', email: 'e@x.co', totalCents: 2900 },
      1000
    )
    expect(r.token).toBeDefined()
    expect(h.mintToken).toHaveBeenCalledOnce()
    expect(h.updateSet).toHaveBeenCalledWith({ accessJti: 'jti1' })
    expect(h.sendReceipt).toHaveBeenCalledOnce()
  })

  it('download-license order.paid issues a license, never a token', async () => {
    h.product.delivery = 'download-license'
    const r = await fulfilOrderPaid(
      { orderId: 'o2', slug: 'p', email: 'e@x.co', totalCents: 4900 },
      1000
    )
    expect(r.licenseKey).toBe('LIC-KEY')
    expect(r.token).toBeUndefined()
    expect(h.mintToken).not.toHaveBeenCalled()
    expect(h.issueLicense).toHaveBeenCalledOnce()
  })

  it('a duplicate webhook (no new purchase row) fulfils nothing', async () => {
    h.insertReturning.mockResolvedValueOnce([])
    const r = await fulfilOrderPaid(
      { orderId: 'o1', slug: 'p', email: 'e@x.co', totalCents: 2900 },
      1000
    )
    expect(r).toEqual({})
    expect(h.mintToken).not.toHaveBeenCalled()
  })

  it('refund revokes the token via the durable accessJti (not KV)', async () => {
    await fulfilRefund({ orderId: 'o1' })
    expect(h.revokeLicensesForPurchase).toHaveBeenCalledWith('pu1')
    expect(h.revokeToken).toHaveBeenCalledWith('jti1')
  })
})
