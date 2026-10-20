import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';
import { ApiError, handleApi } from './src/api.js';
import { createSpec } from './src/openapi.js';

const publicDir = fileURLToPath(new URL('./public/', import.meta.url));
const tokensPath = new URL('./design/design/tokens.css', import.meta.url);
const spec = createSpec();
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };

async function parseBody(req) {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) return undefined;
  if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new ApiError(415, 'Content-Type must be application/json.');
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1_048_576) throw new ApiError(413, 'Request body exceeds 1 MB.');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new ApiError(400, 'Invalid JSON body.'); }
}

export function createApp() {
  return createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, X-Limit, X-Offset, X-Simulated, Location');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    const json = (status, body, headers = {}) => {
      if (status === 204) {
        res.writeHead(status, headers);
        res.end();
        return;
      }
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
      res.end(req.method === 'HEAD' ? undefined : JSON.stringify(body));
    };
    try {
      const url = new URL(req.url, 'http://localhost');
      const pathname = decodeURIComponent(url.pathname).replace(/\/+$/, '') || '/';
      if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
      const method = req.method === 'HEAD' ? 'GET' : req.method;
      if (pathname === '/health' && method === 'GET') { json(200, { status: 'ok', persistence: false }); return; }
      if (['/openapi.json', '/docs-data.json'].includes(pathname) && method === 'GET') { json(200, spec); return; }
      if (/^\/(products|users|carts|auth)(\/|$)/.test(pathname)) {
        const result = handleApi(method, pathname, url.searchParams, await parseBody(req), req.headers.authorization);
        json(result.status, result.body, result.headers);
        return;
      }
      if (method !== 'GET') throw new ApiError(405, 'Method not allowed.');
      const file = ['/', '/docs', '/playground'].includes(pathname) ? resolve(publicDir, 'index.html')
        : pathname === '/tokens.css' ? tokensPath : resolve(publicDir, `.${pathname}`);
      if (typeof file === 'string' && !file.startsWith(publicDir.endsWith(sep) ? publicDir : publicDir + sep)) throw new ApiError(404, 'Not found.');
      let content;
      try { content = await readFile(file); }
      catch (error) {
        if (['ENOENT', 'ENOTDIR'].includes(error.code)) throw new ApiError(404, 'Not found.');
        throw error;
      }
      res.writeHead(200, { 'Content-Type': mime[extname(pathname === '/tokens.css' ? 'tokens.css' : String(file))] ?? 'application/octet-stream' });
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch (error) {
      if (error instanceof URIError) { json(400, { error: { status: 400, message: 'Invalid URL encoding.', details: [] } }); return; }
      if (!(error instanceof ApiError)) console.error('Unhandled request error:', error);
      const status = error instanceof ApiError ? error.status : 500;
      if (status === 401) res.setHeader('WWW-Authenticate', 'Bearer realm="FakeStoreLab"');
      json(status, { error: { status, message: status === 500 ? 'Internal server error.' : error.message, details: error.details ?? [] } });
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT must be an integer between 0 and 65535.');
  createApp().listen(port, '0.0.0.0', () => console.log(`FakeStore Lab listening on http://0.0.0.0:${port}`));
}
