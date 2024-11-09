import { asyncLocalStorage } from '../context.ts';

export function logInfo(message: string): void {
  const requestId = asyncLocalStorage.getStore()!.get('requestId');
  console.info(`[${requestId}] ${message}`);
}

export function logError(message: string): void {
  const requestId = asyncLocalStorage.getStore()!.get('requestId');
  console.error(`[${requestId}] ${message}`);
}

export function logDebug(message: string): void {
  const requestId = asyncLocalStorage.getStore()!.get('requestId');
  console.debug(`[${requestId}] ${message}`);
}
