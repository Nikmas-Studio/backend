import { LogErrorDTO } from '../routes-dtos/log-error.ts';
import { Context, TypedResponse } from 'hono';
import { logError } from '../utils/logger.ts';
import { STATUS_CODE } from '@std/http';

export class LogErrorController {
  logError(c: Context, payload: LogErrorDTO): TypedResponse {
    logError(payload.error);
    return c.json({
      message: 'error logged successfully',
    }, STATUS_CODE.OK);
  }
}