import {
  CreateTemplateCommand,
  SESClient,
} from 'https://esm.sh/@aws-sdk/client-ses@3.687.0';
import { getAWSSESClientConfig } from '../utils/get-aws-ses-client-config.ts';

const client = new SESClient(getAWSSESClientConfig());

// const input = {
//   Template: {
//     TemplateName: 'loginLink',
//     SubjectPart: 'Link to your library',
//     HtmlPart: `
//       <p>Here's a link to access your library:</p>
//       <p>
//         <a href="{{link}}" target="_blank">
//           {{link}}
//         </a>
//       </p>
//       <p>If you haven't initiated this request, just disregard this message.</p>
//       <p>© Nikmas Studio, {{year}}</p>
//     `,
//   },
// };

const input = {
  Template: {
    TemplateName: 'paymentLink',
    SubjectPart: 'Your payment link for the Early Access',
    HtmlPart: `
      <p>Here's your payment link for the Early Access to the Interactive E-Book «Master Git & GitHub: From Everyday Tasks to Deep Waters»:</p>
      <p>
        <a href="{{link}}" target="_blank">
          {{link}}
        </a>
      </p>
      <p>If you haven't initiated this request, just disregard this message.</p>
      <p>© Nikmas Studio, {{year}}</p>
    `,
  },
};

const createTemplateCommand = new CreateTemplateCommand(input);
const createTemplateResponse = await client.send(createTemplateCommand);
console.log('create template response:', createTemplateResponse);
