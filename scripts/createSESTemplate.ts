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
      <div style="max-width:600px">
        <p>Here's a&nbsp;link to&nbsp;access your&nbsp;library:</p>
        <p>
          <a href="{{link}}" target="_blank">
            {{link}}
          </a>
        </p>
        <p>If you haven't initiated this&nbsp;request, just disregard this&nbsp;message: someone might&nbsp;have&nbsp;entered your&nbsp;email by&nbsp;mistake.</p>
        <p>© Nikmas&nbsp;Studio, {{year}}</p>
      </div>
    `,
  },
};

// const input = {
//   Template: {
//     TemplateName: 'paymentLink',
//     SubjectPart: 'Your payment link for «{{bookTitle}}»',
//     HtmlPart: `
//      <div style="max-width:600px">
//         <p>Here's your&nbsp;payment link for the&nbsp;Interactive E-Book <strong>«{{bookTitle}}»:</strong><br />
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

// const input = {
//   Template: {
//     TemplateName: 'demoLink',
//     SubjectPart: '[Demo] {{bookTitle}}',
//     HtmlPart: `
//      <div style="max-width:600px">
//         <p>Try the&nbsp;book demo for&nbsp;free: <a href="{{demoLink}}" target="_blank">{{demoLink}}</a>
//         </p>
//         <p>
//         If you'd like to&nbsp;subscribe to&nbsp;the&nbsp;full version of&nbsp;the&nbsp;book, you can do&nbsp;this through&nbsp;the&nbsp;book's promo page: <a href="{{promoLink}}" target="_blank">{{promoLink}}</a>
//         </p>
//         <p>If you haven't initiated this&nbsp;request, just disregard this&nbsp;message: someone might&nbsp;have&nbsp;entered your&nbsp;email by&nbsp;mistake.</p>
//         <p>© Nikmas Studio, {{year}}</p>
//       </div>
//     `,
//   },
// };

// const input = {
//   Template: {
//     TemplateName: 'orderSuccess',
//     SubjectPart: 'Thanks for your order!',
//     HtmlPart: `
//       <div style="max-width:600px">
//         <h1>Your&nbsp;order has&nbsp;been&nbsp;successfully completed!</h1>

//         <p style="margin-bottom:0">
//           You now have lifetime access to&nbsp;the&nbsp;Interactive E-Book
//           <strong>«Master Git & GitHub: From&nbsp;Everyday&nbsp;Tasks to&nbsp;Deep&nbsp;Waters»:</strong>
//         </p>

//         <ul style="margin-top:0">
//           <li>Access your&nbsp;library with&nbsp;this&nbsp;email: {{readerEmail}}.</li>

//           <li>
//             <a href="https://nikmas.studio/book-master-git-and-github">Read the&nbsp;book</a> as&nbsp;we gradually publish new sections.
//             We’ll notify you by email and on our social media as soon as the first sections of the book are available.
//           </li>

//           <li>
//             Enjoy your&nbsp;investor badge, available in&nbsp;the&nbsp;profile window on&nbsp;the&nbsp;<a href="https://nikmas.studio">nikmas.studio</a>
//             website when you click the&nbsp;profile icon in&nbsp;the&nbsp;top-right corner.
//           </li>

//           <li>
//             You provided the&nbsp;essential initial boost, directly
//             accelerating the&nbsp;release of&nbsp;new book sections
//             and&nbsp;features for&nbsp;a&nbsp;more seamless
//             and&nbsp;immersive reading experience while&nbsp;supporting
//             the&nbsp;creation of&nbsp;future books.
//           </li>
//         </ul>

//         <p style="margin-bottom:0">
//           To&nbsp;stay updated on&nbsp;everything happening around The&nbsp;Studio, follow us on&nbsp;social&nbsp;media:
//         </p>

//         <ul style="margin-top:0">
//           <li><a href="https://t.me/nikmas_studio">Telegram</a></li>
//           <li><a href="https://www.instagram.com/nikmas_studio">Instagram</a></li>
//           <li><a href="https://www.facebook.com/nikmastudio">Facebook</a></li>
//           <li><a href="https://www.linkedin.com/company/nikmas-studio">LinkedIn</a></li>
//         </ul>

//         <p>© Nikmas&nbsp;Studio, {{year}}</p>
//       </div>
//     `,
//   },
// };

// const input = {
//   Template: {
//     TemplateName: 'subscriptionSuccess',
//     SubjectPart: 'Thanks for subscribing!',
//     HtmlPart: `
//       <div style="max-width:600px">
//         <h1>Your&nbsp;subscription to «{{bookTitle}}» has&nbsp;been&nbsp;activated!</h1>

//         <ul style="margin-top:0">
//           <li>Access your&nbsp;library with&nbsp;this&nbsp;email: {{readerEmail}}.</li>

//           <li>
//             Once you're logged into&nbsp;your library, go <a href="{{promoLink}}">to&nbsp;the&nbsp;book's 
//             promo page</a> and click the "Read" button to access the full version of the book.
//           </li>
          
//          <li>
//           Your subscription is active until {{paidUntil}}, and will automatically renew each year
//           when the current billing period ends. To stop recurring payments, simply cancel your subscription.
//          </li>

//           <li>
//           How to cancel the subscription:<br />
//           If you’re subscribed and logged in, <a href="{{promoLink}}">on&nbsp;the&nbsp;book's promo page</a>
//           you’ll see a check mark on the green button in the bottom right corner: «✓Subscription».
//           Click the green button — a panel will open at the bottom of the page
//           with a «Cancel subscription» button. After you cancel your subscription,
//           once your previously paid annual period ends, the book will become unavailable.
//           Whenever you wish, you can start your subscription again.
//           </li>
//         </ul>

//         <p style="margin-bottom:0">
//           To&nbsp;stay updated on&nbsp;everything happening around Nikmas&nbsp;Studio, follow us on&nbsp;social&nbsp;media:
//         </p>

//         <ul style="margin-top:0">
//           <li><a href="https://t.me/nikmas_studio">Telegram</a></li>
//           <li><a href="https://www.instagram.com/nikmas_studio">Instagram</a></li>
//           <li><a href="https://www.facebook.com/nikmastudio">Facebook</a></li>
//           <li><a href="https://www.linkedin.com/company/nikmas-studio">LinkedIn</a></li>
//         </ul>

//         <p>© Nikmas&nbsp;Studio, {{year}}</p>
//       </div>
//     `,
//   },
// };

const createTemplateCommand = new CreateTemplateCommand(input);
const createTemplateResponse = await client.send(createTemplateCommand);
console.log('create template response:', createTemplateResponse);
