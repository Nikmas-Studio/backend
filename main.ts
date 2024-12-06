import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { requestId } from 'hono/request-id';
import { asyncLocalStorage } from './context.ts';
import { AuthController } from './controllers/auth.ts';
import { BooksController } from './controllers/books.ts';
import { LogErrorController } from './controllers/log-error.ts';
import { PurchaseBookController } from './controllers/purchase-book.ts';
import { ReadersController } from './controllers/readers.ts';
import { removeUnconfirmedReaders } from './cron/remove-unconfirmed-readers.ts';
import { AuthDenoKvRepository } from './models/auth/deno-kv-repository.ts';
import { BookDenoKvRepository } from './models/book/deno-kv-repository.ts';
import { ReaderDenoKvRepository } from './models/reader/deno-kv-repository.ts';
import { SubscriptionDenoKvRepository } from './models/subscription/deno-kv-repository.ts';
import { LogErrorDTOSchema } from './routes-dtos/log-error.ts';
import { LoginDTOSchema } from './routes-dtos/login.ts';
import { PaymentSuccessAuthenticatedDTOSchema } from './routes-dtos/payment-success-authenticated.ts';
import { PaymentSuccessGuestDTOSchema } from './routes-dtos/payment-success-guest.ts';
import { PaymentSuccessWayforpayDTOSchema } from './routes-dtos/payment-success-wayforpay.ts';
import { PurchaseBookAuthenticatedDTOSchema } from './routes-dtos/purchase-book-authenticated.ts';
import { PurchaseBookGuestDTOSchema } from './routes-dtos/purchase-book-guest.ts';
import { UpdateReaderFullNameDTOSchema } from './routes-dtos/update-reader-full-name.ts';
import {
  ValidateAuthTokenDTOSchema,
} from './routes-dtos/validate-auth-token.ts';
import { AWSSESEmailService } from './services/email/aws-ses-email-service.ts';
import { WayforpayPaymentService } from './services/payment/wayforpay-payment-service.ts';
import { logDebug } from './utils/logger.ts';
import { cors } from 'hono/cors'

const app = new Hono();

const denoKv = await Deno.openKv();

const readerRepository = new ReaderDenoKvRepository(denoKv);
const authRepository = new AuthDenoKvRepository(denoKv);
const bookRepository = new BookDenoKvRepository(denoKv);
const subscriptionRepository = new SubscriptionDenoKvRepository(denoKv);

const emailService = new AWSSESEmailService();
const paymentService = new WayforpayPaymentService();

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

const logErrorController = new LogErrorController();

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
  '/payment-success-guest',
  (c) => {
    return purchaseBookController.paymentSuccess(c);
  },
);

app.post(
  '/payment-success-authenticated',
  (c) => {
    return purchaseBookController.paymentSuccess(c);
  },
);

app.post(
  '/payment-success-wayforpay',
  zValidator('json', PaymentSuccessWayforpayDTOSchema),
  (c) => {
    return purchaseBookController.paymentSuccess(c, c.req.valid('json'));
  },
);

app.get('/books/:uri/access', (c) => {
  return booksController.checkAccessToBook(c);
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

app.post('/log-error', zValidator('json', LogErrorDTOSchema), (c) => {
  return logErrorController.logError(c, c.req.valid('json'));
});

Deno.cron(
  'remove unconfirmed readers',
  '0 0 1 * *', // Run on the first of the month at midnight
  () => removeUnconfirmedReaders(readerRepository),
);

Deno.serve(app.fetch);
