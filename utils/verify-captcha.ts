import { STATUS_CODE } from '@std/http';
import { HTTPException } from 'hono/http-exception';
import { logError, logInfo } from './logger.ts';

export async function verifyCaptcha(token: string): Promise<void> {
  const projectID = Deno.env.get('GCLOUD_PROJECT')!;
  const apiKey = Deno.env.get('RECAPTCHA_API_KEY')!;
  const siteKey = Deno.env.get('RECAPTCHA_SITE_KEY')!;

  let tokenIsValid = false;
  let tokenInvalidReasons;

  try {
    console.log('siteKey', siteKey);
    console.log('apiKey', apiKey);
    const response = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/${projectID}/assessments?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: {
            token,
            siteKey,
          },
        }),
      },
    );

    const responseData = await response.json();

    const tokenProperties = responseData.tokenProperties;

    if (tokenProperties === undefined || tokenProperties === null) {
      logError('token properties are undefined or null');
      throw new HTTPException(STATUS_CODE.InternalServerError);
    }

    if (tokenProperties.valid === undefined || tokenProperties.valid === null) {
      logError('token properties valid field is undefined or null');
      throw new HTTPException(STATUS_CODE.InternalServerError);
    }

    tokenIsValid = tokenProperties.valid;
    tokenInvalidReasons = responseData.riskAnalysis.reasons;
  } catch (error) {
    logError(
      `server error during captcha verification: ${JSON.stringify(error)}`,
    );
    throw new HTTPException(STATUS_CODE.InternalServerError);
  }

  if (!tokenIsValid) {
    logError(
      `the CreateAssessment call failed because the token was: ${
        JSON.stringify(tokenInvalidReasons)
      }`,
    );
    throw new HTTPException(STATUS_CODE.BadRequest, {
      message: 'Invalid captcha token',
    });
  } else {
    logInfo('Captcha token is valid');
  }
}
