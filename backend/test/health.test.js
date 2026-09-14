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

test('API health endpoint does not require external services', async () => {
  const response = await fetch(`http://localhost:${server.address().port}/api/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: 'ok',
    service: 'cinesense-backend',
  });
});

test('AI review route reports missing configuration without crashing', async () => {
  const originalApiKey = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;

  try {
    const response = await fetch(`http://localhost:${server.address().port}/api/critic`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Test movie' }),
    });

    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: 'AI review service is not configured' });
  } finally {
    if (originalApiKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = originalApiKey;
  }
});