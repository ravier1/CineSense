import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { app } from '../index.js';

let server;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('health endpoint responds locally', async () => {
  const response = await fetch(`http://localhost:${server.address().port}/`);

  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'CineSense Backend API is running.');
});