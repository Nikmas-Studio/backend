import { STATUS_CODE } from '@std/http';
import { Context, TypedResponse } from 'hono';
import { LogDTO } from '../routes-dtos/log-error.ts';
import { logError, logInfo } from '../utils/logger.ts';

export class LogErrorController {
  logError(c: Context, payload: LogDTO): TypedResponse {
    logError(payload.message);
    return c.json({
      message: 'error logged successfully',
    }, STATUS_CODE.OK);
  }

  logInfo(c: Context, payload: LogDTO): TypedResponse {
    logInfo(payload.message);
    return c.json({
      message: 'message logged successfully',
    }, STATUS_CODE.OK);
  }
}
