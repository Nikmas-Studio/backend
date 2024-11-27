import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';
import { STATUS_CODE } from '@std/http';
import { HTTPException } from 'hono/http-exception';
import { logError, logInfo } from './logger.ts';
import { Env } from '../global-types.ts';

export async function verifyCaptcha(token: string): Promise<void> {
  const credentials = JSON.parse(
    atob(Deno.env.get('GOOGLE_APPLICATION_CREDENTIALS_BASE64')!),
  );

  const client = new RecaptchaEnterpriseServiceClient({
    credentials,
  });

  const projectID = Deno.env.get('GCLOUD_PROJECT')!;
  const projectPath = client.projectPath(projectID);

  const request = {
    assessment: {
      event: {
        token,
        siteKey: Deno.env.get('ENV') === Env.DEVELOPMENT
          ? Deno.env.get('RECAPTCHA_TEST_SITE_KEY')!
          : Deno.env.get('RECAPTCHA_SITE_KEY')!,
      },
    },
    parent: projectPath,
  };

  let tokenIsValid = false;
  let tokenInvalidReason: string | undefined;

  try {
    const [response] = await client.createAssessment(request);

    const tokenProperties = response.tokenProperties;

    if (tokenProperties === undefined || tokenProperties === null) {
      logError('token properties are undefined or null');
      throw new HTTPException(STATUS_CODE.InternalServerError);
    }

    if (tokenProperties.valid === undefined || tokenProperties.valid === null) {
      logError('token properties valid field is undefined or null');
      throw new HTTPException(STATUS_CODE.InternalServerError);
    }

    tokenIsValid = tokenProperties.valid;
    tokenInvalidReason = tokenProperties.invalidReason?.toString();
  } catch (error) {
    logError(
      `server error during captcha verification: ${JSON.stringify(error)}`,
    );
    throw new HTTPException(STATUS_CODE.InternalServerError);
  }

  if (!tokenIsValid) {
    logError(
      `the CreateAssessment call failed because the token was: ${tokenInvalidReason}`,
    );
    throw new HTTPException(STATUS_CODE.BadRequest, {
      message: 'Invalid captcha token',
    });
  } else {
    logInfo('Captcha token is valid');
  }
}
