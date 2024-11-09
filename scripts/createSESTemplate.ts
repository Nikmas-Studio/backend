import {
  CreateTemplateCommand,
  SESClient,
} from 'https://esm.sh/@aws-sdk/client-ses@3.687.0';
import { getAWSSESClientConfig } from '../utils/get-aws-ses-client-config.ts';

const client = new SESClient(getAWSSESClientConfig());

const input = {
  Template: {
    TemplateName: 'loginLink',
    SubjectPart: 'Link to your library',
    HtmlPart: `
      <p>Here is a link to your library:</p>
      <p>
        <a href="{{link}}" target="_blank">
          {{link}}
        </a>
      </p>
      <p>© Nikmas Studio, 2024</p>
    `,
  },
};


const createTemplateCommand = new CreateTemplateCommand(input);
const createTemplateResponse = await client.send(createTemplateCommand);
console.log('create template response:', createTemplateResponse);
