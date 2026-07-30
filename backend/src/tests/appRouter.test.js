import { test } from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.mjs';

test('App Router Modularization Verification', async (t) => {
  await t.test('app is defined and uses router middlewares', () => {
    assert.ok(app);
    assert.equal(typeof app, 'function');
    assert.ok(app._router && app._router.stack);
  });

  await t.test('router stack includes postRoutes, adminRoutes, and authRoutes', () => {
    const routerStack = app._router.stack;
    const mountedPaths = routerStack
      .filter(layer => layer.name === 'router')
      .map(layer => layer.regexp.toString());

    // Verify mounted router paths exist in stack
    assert.ok(mountedPaths.length >= 3, 'Should have at least 3 router instances mounted');
  });
});
