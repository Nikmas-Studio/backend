import { Hono } from 'hono';
import { requestId } from 'hono/request-id';
import { asyncLocalStorage } from './context.ts';
import { AuthController } from './controllers/auth.ts';
import { AuthDenoKVRepository } from './models/auth/deno-kv-repository.ts';
import { ReaderDenoKVRepository } from './models/reader/deno-kv-repository.ts';
import { LoginPayload } from './payload-types.ts';
import { AWSSESEmailService } from './services/email/aws-ses-email-service.ts';
import { logInfo } from './utils/logger.ts';

const app = new Hono();

const kv = await Deno.openKv();

const readerRepository = new ReaderDenoKVRepository(kv);
const authRepository = new AuthDenoKVRepository(kv);
const emailService = new AWSSESEmailService();

const authController = new AuthController(
  authRepository,
  readerRepository,
  emailService,
);

app.use('*', requestId());
app.use('*', async (c, next) => {
  const id = c.get('requestId' as never);
  const start = performance.now();

  const requestUrl = new URL(c.req.url);
  const requestRelativeUrl = requestUrl.pathname + requestUrl.search;

  console.log(`[${id}] <-- ${c.req.method} ${requestRelativeUrl}`);

  await next();

  const end = performance.now();
  const elapsed = (end - start).toFixed(2);

  console.log(
    `[${id}] --> ${c.req.method} ${requestRelativeUrl} ${c.res.status} - ${elapsed}ms`,
  );
});

app.use((c, next) => {
  return asyncLocalStorage.run(new Map(), () => {
    asyncLocalStorage.getStore()!.set(
      'requestId',
      c.get('requestId' as never) as string,
    );
    return next();
  });
});

app.get('/', (c) => {
  logInfo(`hello world request`);
  return c.text('Hello, world!');
});

app.post('/login', async (c) => {
  const payload = await c.req.json<LoginPayload>();
  logInfo(`login request for ${payload.email}`);
  authController.login(payload.email);
});

Deno.serve(app.fetch);
