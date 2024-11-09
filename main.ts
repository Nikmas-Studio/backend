import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { requestId } from 'hono/request-id';
import { asyncLocalStorage } from './context.ts';
import { AuthController } from './controllers/auth.ts';
import { AuthDenoKVRepository } from './models/auth/deno-kv-repository.ts';
import { ReaderDenoKVRepository } from './models/reader/deno-kv-repository.ts';
import { LoginDTOSchema } from './route-payload-dtos/login.ts';
import {
  ValidateAuthTokenDTOSchema,
} from './route-payload-dtos/validate-auth-token.ts';
import { TestEmailService } from './services/email/test-email-service.ts';
import { logInfo } from './utils/logger.ts';

const app = new Hono();

const kv = await Deno.openKv();

const readerRepository = new ReaderDenoKVRepository(kv);
const authRepository = new AuthDenoKVRepository(kv);
// const emailService = new AWSSESEmailService();
const emailService = new TestEmailService();

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

app.post('/login', zValidator('json', LoginDTOSchema), (c) => {
  return authController.login(c, c.req.valid('json'));
});

app.post(
  '/validate-auth-token',
  zValidator('json', ValidateAuthTokenDTOSchema),
  (c) => {
    return authController.validateAuthToken(c);
  },
);

Deno.serve(app.fetch);
