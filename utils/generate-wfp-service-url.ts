export function generateWfpServiceUrl(): string {
  return `${Deno.env.get('BACKEND_URL')}/payment-success-wayforpay`;
}
