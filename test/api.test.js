import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../server.js';
import { collections } from '../src/data.js';
import { handleApi } from '../src/api.js';

let server;
let base;
let token;
before(async () => {
  server = createApp();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
  token = (await request('/auth/login', 'POST', { username: 'anna.kowalska', password: 'Kawa!Rano2026' })).body.token;
});
after(async () => { await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); });

async function request(path, method = 'GET', body, authorization) {
  const response = await fetch(base + path, {
    method,
    headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(authorization !== undefined ? { Authorization: authorization } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  return { status: response.status, body: response.status === 204 ? undefined : JSON.parse(text), text, headers: response.headers };
}

test('health reports no persistence', async () => {
  assert.deepEqual((await request('/health')).body, { status: 'ok', persistence: false });
});

test('realistic fixtures have consistent categories, images, carts and working individual credentials', async () => {
  const accounts = (await request('/users?limit=100')).body;
  assert.equal(accounts.length, 12);
  assert.equal(new Set(accounts.map(user => user.username)).size, 12);
  assert.equal(new Set(accounts.map(user => user.email)).size, 12);
  assert.equal(new Set(accounts.map(user => user.password)).size, 12);
  for (const user of accounts) {
    assert.match(user.username, /^[a-z]+\.[a-z]+$/);
    assert.ok(user.email.endsWith('@example.com'));
    assert.ok(user.password.length >= 12);
    const login = await request('/auth/login', 'POST', { username: user.username, password: user.password });
    assert.equal(login.status, 200);
    assert.equal((await request(`/users/${user.id}`, 'DELETE', undefined, `Bearer ${login.body.token}`)).status, 204);
    assert.equal((await request('/auth/login', 'POST', { username: user.username, password: 'Incorrect!Password' })).status, 401);
  }
  assert.equal((await request('/auth/login', 'POST', { username: 'demo', password: 'demo123' })).status, 401);
  const products = (await request('/products?limit=100')).body;
  assert.equal(products.length, 24);
  for (const category of ['laptops', 'desktops', 'monitors', 'accessories']) {
    assert.equal(products.filter(product => product.category === category).length, 6);
  }
  for (const image of new Set(products.map(product => product.image))) {
    assert.equal((await fetch(base + image)).status, 200);
  }
  for (const cart of (await request('/carts?limit=100')).body) {
    assert.ok(accounts.some(user => user.id === cart.userId));
    for (const product of cart.products) {
      assert.deepEqual(product, products.find(item => item.id === product.id));
    }
  }
});

test('only DELETE requires a valid signed Bearer token, including for missing IDs', async () => {
  const [header, payload, signature] = token.split('.');
  const changedPayload = Buffer.from(JSON.stringify({ sub: '1', demo: true, exp: 9_999_999_999 })).toString('base64url');
  const changedSignature = (signature[0] === 'A' ? 'B' : 'A') + signature.slice(1);
  for (const resource of Object.keys(collections)) {
    for (const id of [1, 999]) {
      for (const authorization of [undefined, 'Basic demo', 'Bearer invalid', `Bearer ${header}.${changedPayload}.${signature}`, `Bearer ${header}.${payload}.${changedSignature}`, `Bearer ${header}.${payload}`]) {
        const result = await request(`/${resource}/${id}`, 'DELETE', undefined, authorization);
        assert.equal(result.status, 401);
        assert.equal(result.body.error.status, 401);
        assert.equal(result.headers.get('www-authenticate'), 'Bearer realm="FakeStoreLab"');
      }
      assert.equal((await request(`/${resource}/${id}`, 'DELETE', undefined, `bearer ${token}`)).status, 204);
    }
    assert.equal((await request(`/${resource}/1`, 'GET', undefined, 'Bearer invalid')).status, 200);
  }
});

test('an expired but correctly signed token is rejected', async t => {
  const clock = t.mock.method(Date, 'now', () => 0);
  let expired;
  try {
    expired = handleApi('POST', '/auth/login', new URLSearchParams(), { username: 'anna.kowalska', password: 'Kawa!Rano2026' }).body.token;
  } finally { clock.mock.restore(); }
  assert.equal((await request('/products/1', 'DELETE', undefined, `Bearer ${expired}`)).status, 401);
  assert.equal((await request('/products/999', 'DELETE', undefined, `Bearer ${expired}`)).status, 401);
});

for (const resource of Object.keys(collections)) {
  test(`${resource}: complete CRUD is stateless; PUT differs from PATCH`, async () => {
    const seed = (await request(`/${resource}/1`)).body;
    const { id, ...input } = seed;
    const created = await request(`/${resource}`, 'POST', { ...input, id: 999 });
    assert.equal(created.status, 201);
    assert.ok(created.body.id >= 1_000_000 && created.body.id < 2_000_000_000);
    assert.deepEqual(created.body, { ...input, id: created.body.id });
    assert.equal(created.headers.get('x-simulated'), 'true');
    assert.equal((await request(created.headers.get('location'))).status, 404);
    const field = resource === 'products' ? { price: 12.5 } : resource === 'users' ? { username: 'changed' } : { userId: 2 };
    const patched = await request(`/${resource}/1`, 'PATCH', { ...field, id: 987 });
    assert.equal(patched.status, 200);
    assert.deepEqual(patched.body, { ...seed, ...field });
    assert.equal((await request(`/${resource}/1`, 'PUT', field)).status, 400);
    const replaced = await request(`/${resource}/1`, 'PUT', { ...input, ...field, id: 987 });
    assert.equal(replaced.status, 200);
    assert.deepEqual(replaced.body, { ...input, ...field, id: 1 });
    const deleted = await request(`/${resource}/1`, 'DELETE', undefined, `Bearer ${token}`);
    assert.equal(deleted.status, 204);
    assert.equal(deleted.text, '');
    assert.equal(deleted.headers.get('content-type'), null);
    assert.equal(deleted.headers.get('x-simulated'), 'true');
    for (const targetId of [1, 999, 999]) {
      const repeated = await request(`/${resource}/${targetId}`, 'DELETE', undefined, `Bearer ${token}`);
      assert.equal(repeated.status, 204);
      assert.equal(repeated.text, '');
      assert.equal(repeated.headers.get('content-type'), null);
      assert.equal(repeated.headers.get('x-simulated'), 'true');
    }
    assert.equal((await request(`/${resource}/999`)).status, 404);
    assert.deepEqual((await request(`/${resource}/1`)).body, seed);
    assert.equal((await request(`/${resource}?limit=100`)).body.length, collections[resource].length);
  });
}

test('default pagination and count headers', async () => {
  const result = await request('/products');
  assert.equal(result.body.length, 10);
  assert.equal(result.headers.get('x-total-count'), '24');
  assert.equal(result.headers.get('x-limit'), '10');
  assert.equal(result.headers.get('x-offset'), '0');
  const page = await request('/products?page=2&limit=5');
  const offset = await request('/products?offset=5&limit=5');
  assert.deepEqual(page.body, offset.body);
  assert.deepEqual(page.body.map(item => item.id), [6, 7, 8, 9, 10]);
  assert.equal(page.headers.get('x-offset'), '5');
  assert.deepEqual((await request('/products?page=999')).body, []);
});

test('search, inclusive price filters, category and sorting compose before pagination', async () => {
  const result = await request('/products?q=LAPTOP&minPrice=2299&maxPrice=4999&sortBy=price&sort=desc&limit=2');
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('x-total-count'), '4');
  assert.deepEqual(result.body.map(item => item.price), [4999, 4199]);
  const inclusive = await request('/products?minPrice=3499&maxPrice=3499');
  assert.equal(inclusive.body.length, 1);
  const category = await request('/products/category/laptops?limit=100');
  assert.equal(category.body.length, 6);
  assert.ok(category.body.every(item => item.category === 'laptops'));
  assert.deepEqual(category.body, (await request('/products?category=LAPTOPS&limit=100')).body);
  assert.equal((await request('/products/category/%6Captops')).body.length, 6);
  assert.equal((await request('/products/categories')).body.length, 4);
  assert.deepEqual((await request('/products?q=not-a-real-product')).body, []);
  assert.deepEqual((await request('/products?q=userId')).body, []);
  assert.equal((await request('/carts?q=Northstar%20Air%2014')).body.length, 1);
});

test('user and cart query filters work', async () => {
  assert.equal((await request('/users?username=ANNA.KOWALSKA')).body[0].id, 1);
  assert.equal((await request('/users?email=ANNA.KOWALSKA%40example.com')).body[0].id, 1);
  assert.ok((await request('/carts?userId=2')).body.every(cart => cart.userId === 2));
});

test('query validation returns structured errors', async () => {
  for (const query of ['limit=0', 'limit=101', 'limit=1.2', 'limit=', 'page=0', 'offset=-1', 'page=1&offset=0', 'sort=wrong', 'sortBy=nope', 'foo=1', 'limit=2&limit=3', 'minPrice=-1', 'minPrice=abc', 'minPrice=50&maxPrice=10', 'page=9007199254740991&limit=100']) {
    const result = await request(`/products?${query}`);
    assert.equal(result.status, 400, query);
    assert.equal(result.body.error.status, 400);
    assert.equal(typeof result.body.error.message, 'string');
    assert.ok(Array.isArray(result.body.error.details));
  }
  assert.equal((await request('/carts?userId=0')).status, 400);
});

test('body and path validation', async () => {
  const seed = collections.products[0];
  for (const body of [null, [], 'text', {}, { ...seed, price: -1 }, { ...seed, title: ' ' }, { ...seed, extra: true }, { ...seed, image: 'javascript:alert(1)' }]) {
    assert.equal((await request('/products', 'POST', body)).status, 400);
  }
  for (const id of ['0', '-1', 'abc', '1.5', '99999999999999999']) assert.equal((await request(`/products/${id}`)).status, 400);
  assert.equal((await request('/products/999')).status, 404);
  assert.equal((await request('/products/1', 'PATCH', {})).status, 400);
  assert.equal((await request('/products/1', 'PATCH', { id: 2 })).status, 400);
  assert.equal((await request('/products/1', 'PATCH', { description: 'partial' })).status, 200);
  assert.equal((await request('/users', 'POST', { username: 'test', password: 'test', email: 'bad' })).status, 400);
  assert.equal((await request('/carts', 'POST', { userId: 1, products: [{ id: 1 }] })).status, 400);
  assert.equal((await request('/carts', 'POST', { userId: 1, products: [] })).status, 201);
  assert.equal((await request('/products?limit=2', 'POST', seed)).status, 400);
  assert.equal((await request('/products/1?q=a')).status, 400);
});

test('POST generates different IDs without retaining objects', async () => {
  const results = await Promise.all(Array.from({ length: 12 }, () => request('/products', 'POST', collections.products[0])));
  assert.equal(new Set(results.map(result => result.body.id)).size, 12);
  assert.equal((await request('/products?limit=100')).body.length, 24);
});

test('invalid JSON, content type, oversized payload, and method errors', async () => {
  const badJson = await fetch(base + '/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(badJson.status, 400);
  const noType = await fetch(base + '/products', { method: 'POST', body: '{}' });
  assert.equal(noType.status, 415);
  const oversized = await fetch(base + '/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'x'.repeat(1_048_577) }) });
  assert.equal(oversized.status, 413);
  assert.equal((await request('/products', 'DELETE')).status, 405);
  assert.equal((await request('/products/1', 'POST', {})).status, 405);
  assert.equal((await request('/products/categories', 'DELETE')).status, 405);
  assert.equal((await request('/auth/login')).status, 405);
  assert.equal((await request('/not-an-endpoint')).status, 404);
  const encoding = await fetch(base + '/products/%ZZ');
  assert.equal(encoding.status, 400);
});

test('demo login returns an expiring JWT, invalid credentials return 401', async () => {
  const result = await request('/auth/login', 'POST', { username: 'anna.kowalska', password: 'Kawa!Rano2026' });
  assert.equal(result.status, 200);
  assert.equal(result.body.token.split('.').length, 3);
  const payload = JSON.parse(Buffer.from(result.body.token.split('.')[1], 'base64url').toString());
  assert.equal(payload.sub, '1');
  assert.equal(payload.demo, true);
  assert.ok(payload.exp > Date.now() / 1000);
  assert.equal((await request('/auth/login', 'POST', { username: 'anna.kowalska', password: 'wrong' })).status, 401);
  assert.equal((await request('/auth/login', 'POST', {})).status, 400);
});

test('CORS, HEAD and preflight allow external API clients', async () => {
  const options = await fetch(base + '/products', { method: 'OPTIONS', headers: { Origin: 'https://example.com', 'Access-Control-Request-Method': 'PATCH' } });
  assert.equal(options.status, 204);
  assert.equal(options.headers.get('access-control-allow-origin'), '*');
  assert.ok(options.headers.get('access-control-allow-methods').includes('PATCH'));
  assert.ok(options.headers.get('access-control-expose-headers').includes('X-Total-Count'));
  const head = await fetch(base + '/products', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.equal(head.headers.get('x-total-count'), '24');
});

test('OpenAPI exposes every CRUD method, strict PUT and partial PATCH', async () => {
  const { body: spec } = await request('/openapi.json');
  assert.equal(spec.openapi, '3.1.0');
  for (const [resource, schema] of [['products', 'Product'], ['users', 'User'], ['carts', 'Cart']]) {
    assert.ok(spec.paths[`/${resource}/{id}`].patch);
    assert.equal(spec.paths[`/${resource}/{id}`].delete.responses[200], undefined);
    assert.equal(spec.paths[`/${resource}/{id}`].delete.responses[204].content, undefined);
    assert.equal(spec.paths[`/${resource}/{id}`].delete.responses[404], undefined);
    assert.deepEqual(spec.paths[`/${resource}/{id}`].delete.security, [{ bearerAuth: [] }]);
    assert.ok(spec.paths[`/${resource}/{id}`].delete.responses[401]);
    for (const method of ['get', 'put', 'patch']) assert.equal(spec.paths[`/${resource}/{id}`][method].security, undefined);
    assert.ok(spec.components.schemas[`${schema}Input`].required.length > 0);
    assert.equal(spec.components.schemas[`${schema}Patch`].required, undefined);
    assert.ok(spec.paths[`/${resource}`].get.parameters.some(item => item.name === 'page'));
  }
  const visit = value => {
    if (!value || typeof value !== 'object') return;
    if (value.$ref) {
      const resolved = value.$ref.slice(2).split('/').reduce((object, key) => object?.[key], spec);
      assert.ok(resolved, value.$ref);
    }
    Object.values(value).forEach(visit);
  };
  visit(spec);
  assert.deepEqual((await request('/docs-data.json')).body, spec);
});

test('website, assets and direct documentation routes are served', async () => {
  for (const path of ['/', '/docs', '/playground', '/styles.css', '/tokens.css', '/app.js', '/favicon.svg', '/images/product-0.svg']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    assert.ok((await response.text()).length > 0);
  }
  const response = await fetch(base + '/docs');
  assert.ok(response.headers.get('content-type').includes('text/html'));
  assert.ok(response.headers.get('content-security-policy').includes("default-src 'self'"));
  assert.equal((await fetch(base + '/package.json')).status, 404);
  assert.equal((await fetch(base + '/%2e%2e%2fpackage.json')).status, 404);
});
