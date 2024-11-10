export const AUTH_TOKEN_TIME_TO_LIVE = 30 * 60 * 1000; // 30 minutes (in milliseconds)
export const LOGIN_LINK_TEMPLATE_NAME = 'loginLink';
export const PAYMENT_LINK_TEMPLATE_NAME = 'paymentLink';
export const STUDIO_EMAIL = '"Nikmas Studio" <team@nikmas.studio>';
export const MAX_READER_SESSIONS = 3;
export const IS_INVESTOR_BY_DEFAULT = true;

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
