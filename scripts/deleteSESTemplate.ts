import {
  DeleteTemplateCommand,
  SESClient,
} from 'https://esm.sh/@aws-sdk/client-ses@3.687.0';
import { getAWSSESClientConfig } from '../utils/get-aws-ses-client-config.ts';

const client = new SESClient(getAWSSESClientConfig());

const deleteTemplateCommand = new DeleteTemplateCommand({
  TemplateName: 'paymentLink',
});
const createTemplateResponse = await client.send(deleteTemplateCommand);
console.log('delete template response:', createTemplateResponse);
