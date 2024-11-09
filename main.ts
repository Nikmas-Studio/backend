import { Hono } from 'jsr:@hono/hono';
import { LoginPayload } from './payload-types.ts';
import { ReaderDenoKVRepository } from './models/reader/deno-kv-repository.ts';
import { AuthDenoKVRepository } from './models/auth/deno-kv-repository.ts';
import { AuthController } from './controllers/auth.ts';

const app = new Hono();

const kv = await Deno.openKv();

const readerRepository = new ReaderDenoKVRepository(kv);
const authRepository = new AuthDenoKVRepository(kv);

const authController = new AuthController(authRepository, readerRepository);

app.post('/login', async (c) => {
  const payload = await c.req.json<LoginPayload>();
  authController.login(payload.email);
});

Deno.serve(app.fetch);
