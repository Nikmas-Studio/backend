export const AUTH_TOKEN_TTL = 30 * 60 * 1000; // 30 minutes (in milliseconds)
export const LOGIN_LINK_TEMPLATE_NAME = 'loginLink';
export const ORDER_SUCCESS_TEMPLATE_NAME = 'orderSuccess';
export const PAYMENT_LINK_TEMPLATE_NAME = 'paymentLink';
export const STUDIO_EMAIL = '"Nikmas Studio" <team@nikmas.studio>';
export const MAX_READER_SESSIONS = 3;
export const REUSE_DETECTION_THRESHOLD = 5 * 60 * 1000; // 5 minute (in milliseconds)
export const IS_INVESTOR_AFTER_PURCHASE = true;
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
export const MERCHANT_SECRET_KEY = 'MERCHANT_SECRET_KEY';
export const MERCHANT_DOMAIN_NAME = 'nikmas.studio';
export const ORDER_LIFETIME = 15 * 60; // 15 minutes (in seconds)
export const CURRENCY = 'USD';
export const DEFAULT_PAYMENT_SYSTEM = 'card';
export const PAYMENT_SYSTEMS = 'card;googlePay;applePay';
export const WAYFORPAY_GENERATE_PAYMENT_LINK_URL =
  'https://secure.wayforpay.com/pay';
export const WAYFORPAY_SERVICE_URL =
  'https://api.nikmas.studio/payment-success-wayforpay';
