/**
 * Vitest setup for store tests — dummy env so storeEnv() validates.
 * No real secrets; KV/DB/AI/Polar are mocked per test (never hit network).
 */
process.env['POLAR_ACCESS_TOKEN'] ||= 'test-polar-token'
process.env['POLAR_WEBHOOK_SECRET'] ||= 'test-webhook-secret'
process.env['POLAR_MODE'] ||= 'sandbox'
process.env['ACCESS_TOKEN_SECRET'] ||= 'test-access-secret-which-is-32+chars-long'
process.env['KEY_VAULT_SECRET'] ||= '0'.repeat(64)
process.env['DATABASE_URL'] ||= 'postgres://user:pass@localhost:5432/test'
process.env['KV_REST_API_URL'] ||= 'https://kv.test'
process.env['KV_REST_API_TOKEN'] ||= 'test-kv-token'
process.env['RESEND_API_KEY'] ||= 'test-resend-key'
process.env['BLOB_READ_WRITE_TOKEN'] ||= 'test-blob-token'
process.env['STORE_BASE_URL'] ||= 'https://store.test'
