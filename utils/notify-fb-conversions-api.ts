import { encodeHex } from '@std/encoding/hex';
import { CURRENCY } from '../constants.ts';
import { BookMainPrice } from '../models/book/types.ts';
import {
  ActionSource,
  ClientIpAddress,
  ClientUserAgent,
  EventId,
  EventName,
} from '../types/fb-conversions-api.ts';
import { Email, Phone } from '../types/global-types.ts';

export interface ConversionsApiNotificationPayload {
  eventName: EventName;
  actionSource: ActionSource;
  eventId: EventId;
  eventSourceUrl: URL;
  readerEmail: Email;
  readerPhone: Phone;
  readerIpAddress: ClientIpAddress;
  readerUserAgent: ClientUserAgent;
  bookPrice: BookMainPrice;
}

export async function notifyFbConversionsApi({
  eventName,
  actionSource,
  eventId,
  eventSourceUrl,
  readerEmail,
  readerPhone,
  readerIpAddress,
  readerUserAgent,
  bookPrice,
}: ConversionsApiNotificationPayload): Promise<void> {
  const eventTime = Math.floor(Date.now() / 1000);

  const hashedReaderEmailBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(readerEmail),
  );
  const hashedReaderEmail = encodeHex(hashedReaderEmailBuffer);

  const hashedReaderPhoneBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(readerPhone),
  );
  const hashedReaderPhone = encodeHex(hashedReaderPhoneBuffer);

  const payload = {
    'data': [
      {
        'event_name': eventName,
        'event_time': eventTime,
        'action_source': actionSource,
        'event_id': eventId,
        'event_source_url': eventSourceUrl.toString(),
        'user_data': {
          'em': [
            hashedReaderEmail,
          ],
          'ph': [
            hashedReaderPhone,
          ],
          'client_ip_address': readerIpAddress,
          'client_user_agent': readerUserAgent,
        },
        'custom_data': {
          'currency': CURRENCY,
          'value': bookPrice,
        },
        'original_event_data': {
          'event_name': eventName,
          'event_time': eventTime,
        },
      },
    ],
  };

  const accessToken = Deno.env.get('CONVERSIONS_API_ACCESS_TOKEN');

  await fetch(
    `https://graph.facebook.com/v21.0/3555681048062939/events?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );
}
