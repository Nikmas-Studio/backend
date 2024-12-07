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
//       <p>Here's a&nbsp;link to&nbsp;access your&nbsp;library:</p>
//       <p>
//         <a href="{{link}}" target="_blank">
//           {{link}}
//         </a>
//       </p>
//       <p>If you haven't initiated this&nbsp;request, just disregard this&nbsp;message: someone might&nbsp;have&nbsp;entered your&nbsp;email by&nbsp;mistake.</p>
//       <p>© Nikmas&nbsp;Studio, {{year}}</p>
//     `,
//   },
// };

const input = {
  Template: {
    TemplateName: 'paymentLink',
    SubjectPart: 'Your payment link for the Early Access',
    HtmlPart: `
      <p>Here's your&nbsp;payment link for&nbsp;the&nbsp;Early Access to&nbsp;the&nbsp;Interactive E-Book <strong>«Master Git & GitHub: From&nbsp;Everyday&nbsp;Tasks to&nbsp;Deep&nbsp;Waters»</strong>:</p>
      <p>
        <a href="{{link}}" target="_blank">
          {{link}}
        </a>
      </p>
      <p>If you haven't initiated this&nbsp;request, just disregard this&nbsp;message: someone might&nbsp;have&nbsp;entered your&nbsp;email by&nbsp;mistake.</p>
      <p>© Nikmas Studio, {{year}}</p>
    `,
  },
};

// const input = {
//   Template: {
//     TemplateName: 'orderSuccess',
//     SubjectPart: 'Thanks for your order!',
//     HtmlPart: `
//       <h1>Your&nbsp;order has&nbsp;been&nbsp;successfully completed!</h1>

//       <p>
//         You now have lifetime access to&nbsp;the&nbsp;Interactive E-Book
//         <strong>«Master Git & GitHub: From&nbsp;Everyday&nbsp;Tasks to&nbsp;Deep&nbsp;Waters»</strong>:
//       </p>

//       <ul>
//         <li>Access your&nbsp;library with&nbsp;this&nbsp;email: {{readerEmail}}.</li>

//         <li>Read the&nbsp;book as&nbsp;we gradually publish new sections.</li>

//         <li>
//           Enjoy your&nbsp;investor status:
//           <ul>
//             <li>
//               A&nbsp;20% lifetime discount on&nbsp;all studio books that&nbsp;will&nbsp;ever be&nbsp;published.
//             </li>

//             <li>
//               The&nbsp;investor badge, available in&nbsp;the&nbsp;profile window on&nbsp;the&nbsp;<a href="https://nikmas.studio">nikmas.studio</a>
//               website when you click the&nbsp;profile icon in&nbsp;the&nbsp;top-right corner.
//             </li>
//           </ul>
//         </li>

//         <li>
//           You're enrolled <a href="https://www.instagram.com/nikmas.studio">in&nbsp;the&nbsp;second part of&nbsp;the&nbsp;contest</a> in&nbsp;honor
//           of&nbsp;the&nbsp;company launch, with&nbsp;a&nbsp;chance to&nbsp;win one of&nbsp;ten free lifetime access
//           passes to&nbsp;all studio books that&nbsp;will&nbsp;ever be&nbsp;published. To&nbsp;maximize your
//           chances of&nbsp;winning, join the&nbsp;first part of&nbsp;the&nbsp;contest as&nbsp;well.
//         </li>

//         <li>
//           You helped speed&nbsp;up the&nbsp;release of&nbsp;new sections of&nbsp;the&nbsp;book,
//           useful and&nbsp;convenient features for&nbsp;reading and&nbsp;better assimilation of&nbsp;the&nbsp;material,
//           and&nbsp;also supported the&nbsp;development of&nbsp;other&nbsp;books.
//         </li>
//       </ul>

//       <p>
//         To&nbsp;stay updated on&nbsp;everything happening around The&nbsp;Studio and&nbsp;find&nbsp;out
//         when new sections of&nbsp;the&nbsp;book are&nbsp;released, follow us on&nbsp;social&nbsp;media:
//       </p>

//       <ul>
//         <li><a href="https://t.me/nikmas_studio">Telegram</a></li>
//         <li><a href="https://www.instagram.com/nikmas.studio/">Instagram</a></li>
//         <li><a href="https://www.facebook.com/nikmas.studio">Facebook</a></li>
//         <li><a href="https://www.linkedin.com/company/nikmas-studio">LinkedIn</a></li>
//       </ul>

//       <p>© Nikmas&nbsp;Studio, {{year}}</p>
//     `,
//   },
// };

const createTemplateCommand = new CreateTemplateCommand(input);
const createTemplateResponse = await client.send(createTemplateCommand);
console.log('create template response:', createTemplateResponse);
