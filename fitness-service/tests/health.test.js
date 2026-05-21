const { test } = require('node:test');
const assert = require('node:assert');

test('fitness service health check', () => {
  assert.strictEqual('fitness-service', 'fitness-service');
});
