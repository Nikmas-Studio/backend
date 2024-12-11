export function generateWfpServiceUrl(): string {
  return `${Deno.env.get('FRONTEND_URL')}/api/payment-success-wayforpay`;
}
