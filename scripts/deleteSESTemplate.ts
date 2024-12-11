import {
  DeleteTemplateCommand,
  SESClient,
} from 'https://esm.sh/@aws-sdk/client-ses@3.687.0';
import { getAWSSESClientConfig } from '../utils/get-aws-ses-client-config.ts';

const client = new SESClient(getAWSSESClientConfig());

const template = 'orderSuccess';
const deleteTemplateCommand = new DeleteTemplateCommand({
  TemplateName: template,
});
const createTemplateResponse = await client.send(deleteTemplateCommand);
console.log(
  `delete template ${template} response: ${
    JSON.stringify(createTemplateResponse)
  }`,
);
