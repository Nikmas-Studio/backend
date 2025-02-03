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
//       <div style="max-width:600px">
//         <p>Here's a&nbsp;link to&nbsp;access your&nbsp;library:</p>
//         <p>
//           <a href="{{link}}" target="_blank">
//             {{link}}
//           </a>
//         </p>
//         <p>If you haven't initiated this&nbsp;request, just disregard this&nbsp;message: someone might&nbsp;have&nbsp;entered your&nbsp;email by&nbsp;mistake.</p>
//         <p>© Nikmas&nbsp;Studio, {{year}}</p>
//       </div>
//     `,
//   },
// };

// const input = {
//   Template: {
//     TemplateName: 'paymentLink',
//     SubjectPart: 'Your payment link for the Early Access',
//     HtmlPart: `
//      <div style="max-width:600px">
//         <p>Here's your&nbsp;payment link for&nbsp;the&nbsp;Early Access to&nbsp;the&nbsp;Interactive E-Book <strong>«Master Git & GitHub: From&nbsp;Everyday&nbsp;Tasks to&nbsp;Deep&nbsp;Waters»:</strong></p>
//         <p>
//           <a href="{{link}}" target="_blank">
//             {{link}}
//           </a>
//         </p>
//         <p>If you haven't initiated this&nbsp;request, just disregard this&nbsp;message: someone might&nbsp;have&nbsp;entered your&nbsp;email by&nbsp;mistake.</p>
//         <p>© Nikmas Studio, {{year}}</p>
//       </div>
//     `,
//   },
// };

const input = {
  Template: {
    TemplateName: 'orderSuccess',
    SubjectPart: 'Thanks for your order!',
    HtmlPart: `
      <div style="max-width:600px">
        <h1>Your&nbsp;order has&nbsp;been&nbsp;successfully completed!</h1>

        <p style="margin-bottom:0">
          You now have lifetime access to&nbsp;the&nbsp;Interactive E-Book
          <strong>«Master Git & GitHub: From&nbsp;Everyday&nbsp;Tasks to&nbsp;Deep&nbsp;Waters»:</strong>
        </p>

        <ul style="margin-top:0">
          <li>Access your&nbsp;library with&nbsp;this&nbsp;email: {{readerEmail}}.</li>

          <li>
            <a href="https://nikmas.studio/book-master-git-and-github">Read the&nbsp;book</a> as&nbsp;we gradually publish new sections. 
            Now, instead of the "Try demo" button, you'll find the "Read" button, which takes you to the latest full version of the book.
          </li>

          <li>
            Enjoy your&nbsp;investor status:
            <ul>
              <li>
                the&nbsp;20% lifetime discount on&nbsp;all studio books that&nbsp;will&nbsp;ever be&nbsp;published;
              </li>

              <li>
                the&nbsp;investor badge, available in&nbsp;the&nbsp;profile window on&nbsp;the&nbsp;<a href="https://nikmas.studio">nikmas.studio</a>
                website when you click the&nbsp;profile icon in&nbsp;the&nbsp;top-right corner.
              </li>
            </ul>
          </li>

          <li>
              You provided the&nbsp;essential initial boost, directly
              accelerating the&nbsp;release of&nbsp;new book sections,
              enhancing features for&nbsp;a&nbsp;more seamless
              and&nbsp;immersive reading experience, and&nbsp;supporting
              the&nbsp;creation of&nbsp;future books.
          </li>
        </ul>

        <p style="margin-bottom:0">
          To&nbsp;stay updated on&nbsp;everything happening around The&nbsp;Studio and&nbsp;find&nbsp;out
          when new sections of&nbsp;the&nbsp;book are&nbsp;released, follow us on&nbsp;social&nbsp;media:
        </p>

        <ul style="margin-top:0">
          <li><a href="https://t.me/nikmas_studio">Telegram</a></li>
          <li><a href="https://www.instagram.com/nikmas.studio">Instagram</a></li>
          <li><a href="https://www.facebook.com/nikmas.studio">Facebook</a></li>
          <li><a href="https://www.linkedin.com/company/nikmas-studio">LinkedIn</a></li>
        </ul>

        <p>© Nikmas&nbsp;Studio, {{year}}</p>
      </div>
    `,
  },
};

const createTemplateCommand = new CreateTemplateCommand(input);
const createTemplateResponse = await client.send(createTemplateCommand);
console.log('create template response:', createTemplateResponse);
