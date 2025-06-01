import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { asyncLocalStorage } from './context.ts';
import { AuthController } from './controllers/auth.ts';
import { BooksController } from './controllers/books.ts';
import { LogErrorController } from './controllers/log-error.ts';
import { OrdersController } from './controllers/orders.ts';
import { PurchaseBookController } from './controllers/purchase-book.ts';
import { ReadersController } from './controllers/readers.ts';
import { TranslationController } from './controllers/translation.ts';
import { removeExpiredPendingSubscriptions } from './cron/remove-expired-pending-subscriptions.ts';
import { removeUnconfirmedReaders } from './cron/remove-unconfirmed-readers.ts';
import { AuthDenoKvRepository } from './models/auth/deno-kv-repository.ts';
import { BookDenoKvRepository } from './models/book/deno-kv-repository.ts';
import { ReaderDenoKvRepository } from './models/reader/deno-kv-repository.ts';
import { SubscriptionDenoKvRepository } from './models/subscription/deno-kv-repository.ts';
import { LogDTOSchema } from './routes-dtos/log-error.ts';
import { LoginDTOSchema } from './routes-dtos/login.ts';
import { PurchaseBookAuthenticatedDTOSchema } from './routes-dtos/purchase-book-authenticated.ts';
import { PurchaseBookGuestDTOSchema } from './routes-dtos/purchase-book-guest.ts';
import { TranslateDTOSchema } from './routes-dtos/translate.ts';
import { UpdateReaderFullNameDTOSchema } from './routes-dtos/update-reader-full-name.ts';
import {
  ValidateAuthTokenDTOSchema,
} from './routes-dtos/validate-auth-token.ts';
import { VerifyOrderIdDTOSchema } from './routes-dtos/verify-order-id.ts';
import { AWSSESEmailService } from './services/email/aws-ses-email-service.ts';
import { WayforpayPaymentService } from './services/payment/wayforpay-payment-service.ts';
import { OpenaiDeeplTranslationService } from './services/translation/openai-deepl-translation-service.ts';
import { logDebug } from './utils/logger.ts';
import { TranslationDenoKvRepository } from './models/translation/deno-kv-repository.ts';

const app = new Hono();

const denoKv = await Deno.openKv();

const readerRepository = new ReaderDenoKvRepository(denoKv);
const authRepository = new AuthDenoKvRepository(denoKv);
const bookRepository = new BookDenoKvRepository(denoKv);
const subscriptionRepository = new SubscriptionDenoKvRepository(denoKv);
const translationRepository = new TranslationDenoKvRepository(denoKv);

const emailService = new AWSSESEmailService();
const paymentService = new WayforpayPaymentService();
const translationService = new OpenaiDeeplTranslationService();

const authController = new AuthController(
  authRepository,
  readerRepository,
  emailService,
);

const purchaseBookController = new PurchaseBookController(
  readerRepository,
  authRepository,
  paymentService,
  bookRepository,
  subscriptionRepository,
  emailService,
);

const booksController = new BooksController(
  authRepository,
  subscriptionRepository,
  bookRepository,
  readerRepository,
);

const readersController = new ReadersController(
  readerRepository,
  authRepository,
);

const translationController = new TranslationController(
  translationService,
  translationRepository,
);

const ordersController = new OrdersController(subscriptionRepository);

const logController = new LogErrorController();

app.use(
  '*',
  cors({
    origin: [
      'https://secure.wayforpay.com',
      'https://wayforpay.com',
    ],
  }),
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

app.get('/health-check', (c) => {
  return c.json({ status: 'ok' });
});

app.post('/login', zValidator('json', LoginDTOSchema), (c) => {
  return authController.login(c, c.req.valid('json'));
});

app.post(
  '/auth-token/validate',
  zValidator('json', ValidateAuthTokenDTOSchema),
  (c) => {
    return authController.validateAuthToken(c, c.req.valid('json'));
  },
);

app.post(
  '/purchase-book-guest',
  zValidator('json', PurchaseBookGuestDTOSchema),
  (c) => {
    logDebug('purchase book guest start');
    return purchaseBookController.purchaseBook(c, c.req.valid('json'));
  },
);

app.post(
  '/purchase-book-authenticated',
  zValidator('json', PurchaseBookAuthenticatedDTOSchema),
  (c) => {
    return purchaseBookController.purchaseBook(c, c.req.valid('json'));
  },
);

app.post(
  '/payment-success',
  (c) => {
    return purchaseBookController.paymentSuccess(c);
  },
);

app.post(
  '/payment-success-wayforpay',
  (c) => {
    return purchaseBookController.paymentSuccess(c);
  },
);

app.get('/books/:uri/access', (c) => {
  return booksController.checkAccessToBook(c);
});

app.post('/orders/verify', zValidator('json', VerifyOrderIdDTOSchema), (c) => {
  return ordersController.verifyOrder(c, c.req.valid('json'));
});

app.get('/session', (c) => {
  return authController.getSession(c);
});

app.patch(
  '/readers/full-name',
  zValidator('json', UpdateReaderFullNameDTOSchema),
  (c) => {
    return readersController.updateReaderFullName(c, c.req.valid('json'));
  },
);

app.post('/logout', (c) => {
  return authController.logout(c);
});

app.post('/log-error', zValidator('json', LogDTOSchema), (c) => {
  return logController.logError(c, c.req.valid('json'));
});

app.post('/log-info', zValidator('json', LogDTOSchema), (c) => {
  return logController.logInfo(c, c.req.valid('json'));
});

app.post('/translate', zValidator('json', TranslateDTOSchema), (c) => {
  return translationController.translate(c, c.req.valid('json'));
});

Deno.cron(
  'remove unconfirmed readers',
  '0 0 1 * *', // Run on the first of the month at midnight
  () => removeUnconfirmedReaders(readerRepository),
);

Deno.cron(
  'remove expired pending subscriptions',
  '0 0 1 * *', // Run on the first of the month at midnight
  () => removeExpiredPendingSubscriptions(subscriptionRepository),
);

Deno.serve(app.fetch);
