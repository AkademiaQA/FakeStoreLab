import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { collections, categories, users } from './data.js';

export class ApiError extends Error {
  constructor(status, message, details = []) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

if (process.env.JWT_SECRET !== undefined && Buffer.byteLength(process.env.JWT_SECRET) < 32) {
  throw new Error('JWT_SECRET must contain at least 32 bytes.');
}
const key = process.env.JWT_SECRET ?? randomBytes(32);
function requireToken(authorization) {
  const match = typeof authorization === 'string' && authorization.match(/^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i);
  if (!match) throw new ApiError(401, 'A valid Bearer token is required for DELETE.');
  const [header, payload, signature] = match[1].split('.');
  const expected = createHmac('sha256', key).update(`${header}.${payload}`).digest();
  const received = Buffer.from(signature, 'base64url');
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) throw new ApiError(401, 'Invalid or expired Bearer token.');
  let metadata;
  let claims;
  try {
    metadata = JSON.parse(Buffer.from(header, 'base64url').toString('utf8'));
    claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch { throw new ApiError(401, 'Invalid or expired Bearer token.'); }
  if (!metadata || metadata.alg !== 'HS256' || metadata.typ !== 'JWT' || !claims || claims.demo !== true
    || !Number.isSafeInteger(claims.exp) || claims.exp <= Math.floor(Date.now() / 1000)
    || !users.some(user => String(user.id) === claims.sub)) {
    throw new ApiError(401, 'Invalid or expired Bearer token.');
  }
}
const fields = {
  products: { title: 'string', price: 'number', description: 'string', category: 'string', image: 'string' },
  users: { username: 'string', email: 'string', password: 'string' },
  carts: { userId: 'integer', products: 'array' },
};
const commonParams = ['q', 'sort', 'sortBy', 'limit', 'offset', 'page'];
const resourceParams = {
  products: ['category', 'minPrice', 'maxPrice'],
  users: ['username', 'email'],
  carts: ['userId'],
};
const bad = (message, details) => { throw new ApiError(400, message, details); };

function containsText(value, query) {
  if (value && typeof value === 'object') return Object.values(value).some(item => containsText(item, query));
  return String(value).toLowerCase().includes(query);
}

function numberParam(query, name, minimum, integer = true) {
  if (!query.has(name)) return undefined;
  const raw = query.get(name);
  const value = Number(raw);
  if (!raw.trim() || !Number.isFinite(value) || (integer && !Number.isSafeInteger(value)) || value < minimum) {
    bad(`Invalid query parameter: ${name}`, [`${name} must be ${integer ? 'an integer' : 'a number'} >= ${minimum}.`]);
  }
  return value;
}

function validate(resource, body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) bad('Body must be a JSON object.');
  const schema = fields[resource];
  const errors = [];
  for (const name of Object.keys(body)) {
    if (name !== 'id' && !Object.hasOwn(schema, name)) errors.push(`Unknown field: ${name}.`);
  }
  if (Object.hasOwn(body, 'id') && (!Number.isSafeInteger(body.id) || body.id < 1)) errors.push('id must be a positive integer.');
  for (const [name, type] of Object.entries(schema)) {
    if (!Object.hasOwn(body, name)) {
      if (!partial) errors.push(`${name} is required.`);
      continue;
    }
    const value = body[name];
    if (type === 'array' ? !Array.isArray(value) : type === 'integer' ? !Number.isSafeInteger(value) || value < 1 : typeof value !== type) {
      errors.push(`${name} must be ${type}.`);
    } else if (type === 'string' && !value.trim()) errors.push(`${name} must not be empty.`);
  }
  if (partial && !Object.keys(body).some(name => Object.hasOwn(schema, name))) errors.push('Provide at least one editable field.');
  if (typeof body.price === 'number' && (!Number.isFinite(body.price) || body.price < 0)) errors.push('price must be a finite number >= 0.');
  if (typeof body.email === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push('email must be a valid email address.');
  if (typeof body.image === 'string') {
    try {
      const url = new URL(body.image, 'https://example.com');
      if (!['http:', 'https:'].includes(url.protocol)) errors.push('image must be an HTTP(S) URL or relative path.');
    } catch { errors.push('image must be a valid URL or relative path.'); }
  }
  if (resource === 'carts' && Array.isArray(body.products)) {
    body.products.forEach((product, index) => {
      try { validate('products', product); }
      catch (error) {
        if (!(error instanceof ApiError)) throw error;
        errors.push(`products[${index}]: ${error.details.join(' ') || error.message}`);
      }
    });
  }
  if (errors.length) bad('Validation failed.', errors);
}

function list(resource, query, source = collections[resource]) {
  const allowed = [...commonParams, ...resourceParams[resource]];
  for (const name of query.keys()) {
    if (!allowed.includes(name)) bad(`Unknown query parameter: ${name}`);
    if (query.getAll(name).length > 1) bad(`Duplicate query parameter: ${name}`);
  }
  const limit = numberParam(query, 'limit', 1) ?? 10;
  if (limit > 100) bad('limit must not exceed 100.');
  if (query.has('page') && query.has('offset')) bad('Use page or offset, not both.');
  const page = numberParam(query, 'page', 1);
  const offset = numberParam(query, 'offset', 0) ?? ((page ?? 1) - 1) * limit;
  if (!Number.isSafeInteger(offset)) bad('Pagination offset is too large.');
  const min = numberParam(query, 'minPrice', 0, false);
  const max = numberParam(query, 'maxPrice', 0, false);
  if (min !== undefined && max !== undefined && min > max) bad('minPrice must not exceed maxPrice.');
  const userId = numberParam(query, 'userId', 1);
  const sort = query.get('sort') ?? 'asc';
  const sortBy = query.get('sortBy') ?? 'id';
  if (!['asc', 'desc'].includes(sort)) bad('sort must be asc or desc.');
  if (!['id', ...Object.keys(fields[resource]).filter(name => name !== 'products')].includes(sortBy)) bad('Invalid sortBy field.');
  let result = source.filter(item => {
    if (query.has('q') && !containsText(item, query.get('q').toLowerCase())) return false;
    for (const name of ['category', 'username', 'email']) {
      if (query.has(name) && item[name].toLowerCase() !== query.get(name).toLowerCase()) return false;
    }
    return (min === undefined || item.price >= min) && (max === undefined || item.price <= max) && (userId === undefined || item.userId === userId);
  });
  result = result.toSorted((a, b) => {
    const compare = typeof a[sortBy] === 'number' ? a[sortBy] - b[sortBy] : a[sortBy].localeCompare(b[sortBy]);
    return (sort === 'asc' ? 1 : -1) * compare;
  });
  return {
    status: 200,
    body: result.slice(offset, offset + limit),
    headers: { 'X-Total-Count': String(result.length), 'X-Limit': String(limit), 'X-Offset': String(offset) },
  };
}

export function handleApi(method, pathname, query, body, authorization) {
  if (pathname === '/auth/login') {
    if (method !== 'POST') throw new ApiError(405, 'Method not allowed.');
    if (!body || typeof body.username !== 'string' || typeof body.password !== 'string') bad('username and password are required.');
    const user = users.find(item => item.username === body.username && item.password === body.password);
    if (!user) throw new ApiError(401, 'Invalid demo credentials.');
    const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
    const unsigned = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: String(user.id), demo: true, exp: Math.floor(Date.now() / 1000) + 3600 })}`;
    return { status: 200, body: { token: `${unsigned}.${createHmac('sha256', key).update(unsigned).digest('base64url')}` } };
  }
  if (pathname === '/products/categories') {
    if (method !== 'GET') throw new ApiError(405, 'Method not allowed.');
    if (query.size) bad('Categories do not accept query parameters.');
    return { status: 200, body: categories };
  }
  const categoryMatch = pathname.match(/^\/products\/category\/([^/]+)$/);
  if (categoryMatch) {
    if (method !== 'GET') throw new ApiError(405, 'Method not allowed.');
    return list('products', query, collections.products.filter(product => product.category === categoryMatch[1]));
  }
  const match = pathname.match(/^\/(products|carts|users)(?:\/([^/]+))?$/);
  if (!match) throw new ApiError(404, 'Endpoint not found.');
  const [, resource, rawId] = match;
  if (method === 'DELETE' && rawId !== undefined) requireToken(authorization);
  if (rawId === undefined) {
    if (method === 'GET') return list(resource, query);
    if (method !== 'POST') throw new ApiError(405, 'Use GET or POST on a collection.');
    if (query.size) bad('Write operations do not accept query parameters.');
    validate(resource, body);
    const id = randomInt(1_000_000, 2_000_000_000);
    return { status: 201, body: { ...body, id }, headers: { Location: `/${resource}/${id}`, 'X-Simulated': 'true' } };
  }
  if (!/^[1-9]\d*$/.test(rawId) || !Number.isSafeInteger(Number(rawId))) bad('id must be a positive integer.');
  if (query.size) bad('Single resources do not accept query parameters.');
  const id = Number(rawId);
  if (method === 'DELETE') return { status: 204, headers: { 'X-Simulated': 'true' } };
  const original = collections[resource].find(item => item.id === id);
  if (!original) throw new ApiError(404, `${resource} resource not found.`);
  if (method === 'GET') return { status: 200, body: original };
  if (!['PUT', 'PATCH', 'DELETE'].includes(method)) throw new ApiError(405, 'Use GET, PUT, PATCH or DELETE on a resource.');
  validate(resource, body, method === 'PATCH');
  return { status: 200, body: { ...(method === 'PATCH' ? original : {}), ...body, id }, headers: { 'X-Simulated': 'true' } };
}
