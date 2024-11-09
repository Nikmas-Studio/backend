import { SESClientConfig } from 'https://esm.sh/@aws-sdk/client-ses@3.687.0';

export function getAWSSESClientConfig(): SESClientConfig {
  return {
    region: Deno.env.get('AWS_REGION')!,
    credentials: {
      accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
      secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
    },
  };
}
