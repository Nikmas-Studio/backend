import { encodeHex } from '@std/encoding/hex';
import {
  ActionSource,
  ClientIpAddress,
  ClientUserAgent,
  EventName,
} from '../types/fb-conversions-api.ts';
import { Email } from '../types/global-types.ts';
import { PIXEL_ID } from '../constants.ts';

export interface ConversionsApiNotificationPayload {
  actionSource: ActionSource;
  eventSourceUrl: URL;
  readerEmail: Email;
  readerIpAddress: ClientIpAddress;
  readerUserAgent: ClientUserAgent;
}

export async function notifyFbConversionsApiOfDemoAccess({
  actionSource,
  eventSourceUrl,
  readerEmail,
  readerIpAddress,
  readerUserAgent,
}: ConversionsApiNotificationPayload): Promise<void> {
  const eventTime = Math.floor(Date.now() / 1000);

  const hashedReaderEmailBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(readerEmail),
  );
  const hashedReaderEmail = encodeHex(hashedReaderEmailBuffer);

  const payload = {
    'data': [
      {
        'event_name': EventName.DEMO_ACCESS,
        'event_time': eventTime,
        'action_source': actionSource,
        'event_source_url': eventSourceUrl.toString(),
        'user_data': {
          'em': [
            hashedReaderEmail,
          ],
          'client_ip_address': readerIpAddress,
          'client_user_agent': readerUserAgent,
        },
        'original_event_data': {
          'event_name': EventName.DEMO_ACCESS,
          'event_time': eventTime,
        },
      },
    ],
  };

  const accessToken = Deno.env.get('CONVERSIONS_API_ACCESS_TOKEN');

  await fetch(
    `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );
}
