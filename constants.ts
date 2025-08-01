export const AUTH_TOKEN_TTL = 30 * 60 * 1000; // 30 minutes (in milliseconds)
export const LOGIN_LINK_TEMPLATE_NAME = 'loginLink';
export const ONE_TIME_PURCHASE_SUCCESS_TEMPLATE_NAME = 'orderSuccess';
export const SUBSCRIPTION_SUCCESS_TEMPLATE_NAME = 'subscriptionSuccess';
export const PAYMENT_LINK_TEMPLATE_NAME = 'paymentLink';
export const DEMO_LINK_TEMPLATE_NAME = 'demoLink';
export const STUDIO_EMAIL = '"Nikmas Studio" <team@nikmas.studio>';
export const MAX_READER_SESSIONS = 3;
export const REUSE_DETECTION_THRESHOLD = 5 * 60 * 1000; // 5 minute (in milliseconds)
export const SESSION_ID_COOKIE_NAME = 'session_id';
export const SESSION_ACCESS_TOKEN_COOKIE_NAME = 'session_access_token';
export const SESSION_MAX_AGE_SECONDS = 34560000; // 400 days (in seconds)
export const SESSION_MAX_AGE_MILLISECONDS = SESSION_MAX_AGE_SECONDS * 1000; // 400 days (in milliseconds)
export const SESSION_ACCESS_TOKEN_TTL = 15 * 60 * 1000; // 15 minutes (in milliseconds)
export const CAPTCHA_VERIFICATION_URL =
  'https://www.google.com/recaptcha/api/siteverify';
export const UNCONFIRMED_READER_TTL = 27; // in days
export const PEDNDING_SUBSCRIPTION_TTL = 27; // in days
export const READER_FULL_NAME_MAX_LENGTH = 50;

// payment
export const MERCHANT_ACCOUNT = 'MERCHANT_ACCOUNT';
export const MERCHANT_PASSWORD = 'MERCHANT_PASSWORD';
export const MERCHANT_SECRET_KEY = 'MERCHANT_SECRET_KEY';
export const MERCHANT_DOMAIN_NAME = 'nikmas.studio';
export const ORDER_LIFETIME = 15 * 60; // 15 minutes (in seconds)
export const CURRENCY = 'USD';
export const DEFAULT_PAYMENT_SYSTEM = 'card';
export const PAYMENT_SYSTEMS = 'card;googlePay;applePay';
export const WAYFORPAY_GENERATE_PAYMENT_LINK_URL =
  'https://secure.wayforpay.com/pay';
export const WAYFORPAY_REGULAR_API_URL = 'https://api.wayforpay.com/regularApi';
export const MAX_TRANSLATION_FRAGMENT_LENGTH = 500;
export const BOOK_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES_URI =
  'book-master-english-with-sherlock-holmes';

export const BOOK_MASTER_GIT_AND_GITHUB_URI = 'book-master-git-and-github';

export const TRANSLATION_CREDITS_TO_GRANT_ON_UPDATE_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES =
  10;

export const BOOKS_WITHOUT_REGULAR_PAYMENT = [
  BOOK_MASTER_GIT_AND_GITHUB_URI,
];

export const PIXEL_ID = '1174635817619006';

export const DEFAULT_PROMO_CODE_DISCOUNT = 3.5;
export const IT_CLUB_PROMO_CODE_DISCOUNT = 7;
export const DEFAULT_BOOK_PRICE = 23;

export const AIRTABLE_BASE_ID = 'appnxQX53kC9bRUcY';

export const MAX_NUMBER_OF_TRANSLATION_QUALITY_CHECKS = 3;

// email
export const SENDPULSE_AUTH_URL =
  'https://api.sendpulse.com/oauth/access_token';
export const SENDPULSE_ADDRESSBOOK_ID = 322969;
export const SENDPULSE_DEMO_MASTER_ENGLISH_WITH_SHERLOCK_HOLMES_TAG_ID = 2566;

// translation
export const LANGUAGE_MAPPINGS: Record<string, string> = {
  'French': 'FR',
  'Spanish': 'ES',
  'Portuguese (Portugal)': 'PT-PT',
  'Portuguese (Brazil)': 'PT-BR',
  'Italian': 'IT',
  'German': 'DE',
  'Dutch': 'NL',
  'Danish': 'DA',
  'Finnish': 'FI',
  'Norwegian (Bokmål)': 'NB',
  'Swedish': 'SV',
  'Ukrainian': 'UK',
  'Russian': 'RU',
  'Estonian': 'ET',
  'Latvian': 'LV',
  'Lithuanian': 'LT',
  'Slovenian': 'SL',
  'Polish': 'PL',
  'Czech': 'CS',
  'Slovak': 'SK',
  'Hungarian': 'HU',
  'Romanian': 'RO',
  'Bulgarian': 'BG',
  'Greek': 'EL',
  'Turkish': 'TR',
  'Arabic': 'AR',
  'Hebrew': 'HE',
  'Japanese': 'JA',
  'Korean': 'KO',
  'Chinese (Simplified)': 'ZH-HANS',
  'Chinese (Traditional)': 'ZH-HANT',
  'Thai': 'TH',
  'Indonesian': 'ID',
  'Vietnamese': 'VI',
};
