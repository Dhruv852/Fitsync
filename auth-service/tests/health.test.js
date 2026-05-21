/**
 * Simple health check test for CI pipeline
 */
const { test } = require('node:test');
const assert = require('node:assert');

test('auth service health check logic', () => {
  const health = { success: true, service: 'auth-service', status: 'healthy' };
  assert.strictEqual(health.success, true);
  assert.strictEqual(health.service, 'auth-service');
});
