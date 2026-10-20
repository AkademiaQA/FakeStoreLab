import { readFileSync } from 'node:fs';
import { products, users, carts } from './data.js';

export function createSpec() {
  const spec = JSON.parse(readFileSync(new URL('../openapi/docs-data.json', import.meta.url), 'utf8'));
  spec.info = {
    title: 'FakeStore Lab API',
    version: '1.0.0',
    description: 'Educational, stateless API. POST/PUT/PATCH/DELETE return simulated results and NEVER change seed data. PUT replaces all editable fields; PATCH merges selected fields. Collection responses are arrays (default limit 10, maximum 100); pagination metadata is in X-Total-Count, X-Limit and X-Offset. Only DELETE requires a valid Bearer JWT obtained from POST /auth/login. All user credentials are fictional.',
  };
  spec.servers = [{ url: '/' }];
  spec.components.securitySchemes = { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Log in with anna.kowalska / Kawa!Rano2026. Token expires after one hour. Required only for DELETE.' } };
  const required = { Product: ['title', 'price', 'description', 'category', 'image'], User: ['username', 'email', 'password'], Cart: ['userId', 'products'] };
  const names = { products: 'Product', users: 'User', carts: 'Cart' };
  const schemas = spec.components.schemas;
  for (const [name, example] of Object.entries({ Product: products[0], User: users[0], Cart: carts[0] })) {
    schemas[name].examples = [structuredClone(example)];
  }
  schemas.Login.examples = [{ username: users[0].username, password: users[0].password }];
  schemas.Error = { type: 'object', required: ['error'], properties: { error: { type: 'object', properties: { status: { type: 'integer' }, message: { type: 'string' }, details: { type: 'array', items: { type: 'string' } } } } } };
  schemas.Product.properties.price.minimum = 0;
  schemas.Cart.properties.userId.minimum = 1;
  // Local, self-hosted illustrations are also valid image values.
  delete schemas.Product.properties.image.format;
  schemas.User.properties.email.format = 'email';
  for (const name of Object.keys(required)) {
    for (const property of Object.values(schemas[name].properties)) {
      if (property.type === 'string') property.minLength = 1;
    }
    schemas[name].properties.id = { type: 'integer', minimum: 1, readOnly: true };
    const properties = structuredClone(schemas[name].properties);
    properties.id = { type: 'integer', minimum: 1, description: 'Optional input ID. Ignored on POST; the URL ID wins on PUT/PATCH.' };
    schemas[`${name}Input`] = { type: 'object', required: required[name], additionalProperties: false, properties };
    schemas[`${name}Patch`] = { type: 'object', anyOf: required[name].map(field => ({ required: [field] })), additionalProperties: false, properties };
    if (name === 'Cart') {
      properties.products.items = { $ref: '#/components/schemas/ProductInput' };
      schemas.CartPatch.properties.products.items = { $ref: '#/components/schemas/ProductInput' };
    }
  }
  const parameter = (name, type = 'string', extra = {}) => ({ name, in: 'query', schema: { type, ...extra } });
  for (const [resource, schema] of Object.entries(names)) {
    const collection = spec.paths[`/${resource}`];
    collection.get.parameters = [
      parameter('q'), parameter('limit', 'integer', { minimum: 1, maximum: 100, default: 10 }),
      parameter('page', 'integer', { minimum: 1 }), parameter('offset', 'integer', { minimum: 0 }),
      parameter('sort', 'string', { enum: ['asc', 'desc'], default: 'asc' }),
      parameter('sortBy', 'string', { enum: Object.keys(schemas[schema].properties).filter(name => name !== 'products'), default: 'id' }),
      ...(resource === 'products' ? [parameter('category'), parameter('minPrice', 'number', { minimum: 0 }), parameter('maxPrice', 'number', { minimum: 0 })] : []),
      ...(resource === 'users' ? [parameter('username'), parameter('email')] : []),
      ...(resource === 'carts' ? [parameter('userId', 'integer', { minimum: 1 })] : []),
    ];
    collection.get.responses[200].headers = Object.fromEntries(['X-Total-Count', 'X-Limit', 'X-Offset'].map(name => [name, { schema: { type: 'integer' } }]));
    const single = spec.paths[`/${resource}/{id}`];
    single.patch = structuredClone(single.put);
    single.patch.summary = `Partially update ${resource} (simulated)`;
    delete single.delete.responses[200];
    single.delete.responses[204] = { description: 'Deletion simulated successfully. No response body; seed data is unchanged.' };
    single.delete.description = 'Requires a valid Bearer JWT. Returns 204 No Content without a body for both existing and nonexistent valid IDs, including repeated requests. Missing, invalid or expired token returns 401. Subsequent GET requests return unchanged seed data.';
    single.delete.security = [{ bearerAuth: [] }];
    single.delete.responses[401] = { description: 'Missing, invalid or expired Bearer token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } };
    for (const [operation, input] of [[collection.post, `${schema}Input`], [single.put, `${schema}Input`], [single.patch, `${schema}Patch`]]) {
      operation.requestBody.content['application/json'].schema = { $ref: `#/components/schemas/${input}` };
      operation.description = 'Simulated only. Subsequent GET requests return the unchanged seed data.';
    }
    collection.post.responses[201].headers = { Location: { description: 'Simulated resource URL; a subsequent GET returns 404.', schema: { type: 'string' } } };
  }
  spec.paths['/products/categories'] = { get: { tags: ['Products'], summary: 'List categories', responses: { 200: { description: 'Categories', content: { 'application/json': { schema: { type: 'array', items: { type: 'string' } } } } } } } };
  spec.paths['/products/category/{category}'] = { get: { ...structuredClone(spec.paths['/products'].get), summary: 'Products in a category', parameters: [{ name: 'category', in: 'path', required: true, schema: { type: 'string' } }, ...structuredClone(spec.paths['/products'].get.parameters)] } };
  schemas.Login.required = ['username', 'password'];
  for (const operations of Object.values(spec.paths)) {
    for (const operation of Object.values(operations)) {
      for (const status of [400, 404, 405, 413, 415, 500]) {
        operation.responses[status] = { description: { 400: 'Invalid input', 404: 'Not found', 405: 'Method not allowed', 413: 'Body exceeds 1 MB', 415: 'Expected application/json', 500: 'Internal server error' }[status], content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } };
      }
    }
  }
  spec.paths['/auth/login'].post.responses[401] = { description: 'Invalid demo credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } };
  for (const resource of Object.keys(names)) {
    delete spec.paths[`/${resource}/{id}`].delete.responses[404];
  }
  return spec;
}
