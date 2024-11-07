import { Hono } from 'jsr:@hono/hono';

const app = new Hono();

app.get('/', (c) => c.text("Hello, Nikmas Studio! I'm Hono!"));

Deno.serve(app.fetch);
