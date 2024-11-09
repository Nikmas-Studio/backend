import { asyncLocalStorage } from '../context.ts';

export function logMessage(message: string): void {
  const requestId = asyncLocalStorage.getStore()!.get('requestId');
  console.log(`[${requestId}] ${message}`);
}
