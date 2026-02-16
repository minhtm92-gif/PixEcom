export interface LegalTemplate {
  title: string;
  slug: string;
  policyType: string;
  bodyHtml: string;
  displayOrder: number;
}

export const DEFAULT_LEGAL_TEMPLATES: LegalTemplate[] = [
  {
    title: 'Return & Refund Policy',
    slug: 'return-refund-policy',
    policyType: 'refund_policy',
    displayOrder: 1,
    bodyHtml: `<h1>Refund Policy</h1>
<h2>Cancel & refund policy</h2>
<h3>Cancel the order:</h3>
<ol>
<li>If you ask to cancel the order within 6 hours after the order is completed, your order can be cancelled within 10% charge fee due to policy of payment gate. Please contact our customer service email or online chat in time.</li>
<li>If you ask to cancel the order more than 6 hours since the order is completed and before the time we ship out the items, we will charge a 10%-20% handling fee of the item price. (The fee is paid for order processing manpower cost)</li>
<li>If you ask to cancel the order after we ship out the items, the order couldn't be cancelled in this condition, hope you understand.</li>
</ol>

<h3>Refund:</h3>
<ol>
<li>Refund will normally be processed within 3-5 business days. Once your refund is processed, your PayPal account or the original card you used to pay will receive a refund from us. If the return item is not as the original condition we shipped out it, you need to responsible for the inconsistent item(s), we couldn't begin to proceed with the exchange or refund until we reach an agreement with you.</li>
<li>If you don't receive a refund after a period of time we offered the refund, please check with PayPal or contact your original card bank you used to pay. It may take several business days for the refund shown at your account as this is an international transaction. You can also contact us to inquire about this, our email is {{email_support}}</li>
<li>We do have a policy to refund or resend products if they were sent in the wrong size/color compared to the order confirmation, missing any items, or damaged during shipment in 15 days after the product is delivered.</li>
</ol>`,
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    policyType: 'privacy_policy',
    displayOrder: 2,
    bodyHtml: `<h1>Privacy Policy</h1>

<h2>SECTION 1 - WHAT DO WE DO WITH YOUR INFORMATION?</h2>
<p>This Data Protection Notice ("Notice") sets out the basis which {{store_name}} ("we", "us", or "our") may collect, use, disclose or otherwise process personal data of our customers in accordance with the Personal Data Protection Act ("PDPA"). This Notice applies to personal data in our possession or under our control, including personal data in the possession of organisations which we have engaged to collect, use, disclose or process personal data for our purposes.</p>

<p>When you purchase something from our store, as part of the buying and selling process, we collect the personal information you give us such as your name, address and email address.</p>

<p>When you browse our store, we also automatically receive your computer's internet protocol (IP) address in order to provide us with information that helps us learn about your browser and operating system.</p>

<p>Email marketing (if applicable): With your permission, we may send you emails about our store, new products and other updates.</p>

<h2>SECTION 2 - CONSENT</h2>
<h3>How do you get my consent?</h3>
<p>When you provide us with personal information to complete a transaction, verify your credit card, place an order, arrange for a delivery or return a purchase, we imply that you consent to our collecting it and using it for that specific reason only.</p>

<p>If we ask for your personal information for a secondary reason, like marketing, we will either ask you directly for your expressed consent, or provide you with an opportunity to say no.</p>

<h3>How do I withdraw my consent?</h3>
<p>If after you opt-in, you change your mind, you may withdraw your consent for us to contact you, for the continued collection, use or disclosure of your information, at anytime, by contacting us at {{email_support}}</p>

<h2>SECTION 3 - DISCLOSURE</h2>
<p>We may disclose your personal information if we are required by law to do so or if you violate our Terms of Service.</p>

<h2>SECTION 4 - ACCURACY OF PERSONAL DATA</h2>
<p>We will make a reasonable effort to ensure that personal data collected by us or on our behalf is accurate and complete.</p>

<h2>SECTION 5 - SECURITY AND PROTECTION OF PERSONAL DATA</h2>
<p>The security of your Personal Information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.</p>

<h2>SECTION 6 - RETENTION OF PERSONAL DATA</h2>
<p>We may retain your personal data for as long as it is necessary to fulfill the purpose for which it was collected, or as required or permitted by applicable laws. We will cease to retain your personal data, or remove the means by which the data can be associated with you, as soon as it is reasonable to assume that such retention no longer serves the purpose for which the personal data was collected, and is no longer necessary for legal or business purposes.</p>

<h2>SECTION 7 - COOKIES</h2>
<p>Here is a list of cookies that we use. We've listed them here so you that you can choose if you want to opt-out of cookies or not.</p>
<ul>
<li>_session_id, unique token, sessional, Allows website to store information about your session (referrer, landing page, etc).</li>
<li>_session_visit, no data held, Persistent for 30 minutes from the last visit, Used by our website provider's internal stats tracker to record the number of visits</li>
<li>_session_uniq, no data held, expires midnight (relative to the visitor) of the next day, Counts the number of visits to a store by a single customer.</li>
<li>cart, unique token, persistent for 2 weeks, Stores information about the contents of your cart.</li>
</ul>

<h2>SECTION 8 - AGE OF CONSENT</h2>
<p>By using this site, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.</p>

<h2>SECTION 9 - CHANGES TO THIS PRIVACY POLICY</h2>
<p>We reserve the right to modify this privacy policy at any time, so please review it frequently. Changes and clarifications will take effect immediately upon their posting on the website. If we make material changes to this policy, we will notify you here that it has been updated, so that you are aware of what information we collect, how we use it, and under what circumstances, if any, we use and/or disclose it.</p>

<p>If our store is acquired or merged with another company, your information may be transferred to the new owners so that we may continue to sell products to you.</p>

<h2>QUESTIONS AND CONTACT INFORMATION</h2>
<p>If you would like to: access, correct, amend or delete any personal information we have about you, register a complaint, or simply want more information contact our Privacy Compliance Officer at {{email_support}}</p>`,
  },
  {
    title: 'Shipping Policy',
    slug: 'shipping-policy',
    policyType: 'shipping_policy',
    displayOrder: 3,
    bodyHtml: `<h1>Shipping Policy</h1>

<h2>Cancellation policy</h2>
<p>Cancellation is approved within the first 6 hours of purchasing time. After 6 hours, your order will be automatically archived and sent to the warehouse for the process of stocking, packaging, and shipment. No one can cancel your order once it is being processed already. Please be informed that a management, processing and transaction fee (30% of your total order value) will be applied for the cancellation.</p>

<p>Full refund only applies to switching orders. Once you place new orders, our system will automatically cancel old orders and refund 100%. Please inform us via email when you have switching orders.</p>

<p>We would be so appreciated if you could please tell me the reason for cancellation. It will help us so much to improve our products and services.</p>

<h2>How to change the information of my order?</h2>
<p>If you realize you have made an error in shipping address or purchasing, simply e-mail us as soon as possible. We will support you to correct the information.</p>

<p>Please be noted that: we can only change your order information within 48 hours.</p>

<p>Please check the order confirmation email which is sent to you right after your order is placed to check all the information.</p>

<h2>When do I get the tracking number?</h2>
<p>All orders are handled and shipped out from our warehouse in Asia. Please allow extra time for your order to be processed during holidays and sale seasons.</p>

<p>The in-store process for the stock and packaging will take about 2-5 business days. Then, once your order is ready for the shipment, the tracking will be available and sent to you.</p>

<p>Please contact us if you do not receive tracking confirmation after 5 working days from the day you completed your payment.</p>

<p>If we are unable to process your order due to inaccurate or incomplete payment or incorrect address information, your order processing may be delayed.</p>

<h2>How can I check my package?</h2>
<p>Once your order has shipped, we will send you a Shipping Update email with your tracking number. Your order will be shipped via our shipping company to the US and delivered by USPS.</p>

<p>To track your package, simply use the tracking number provided in USPS tracking system or via this link: https://www.17track.net/en</p>

<h2>How long can I get my item?</h2>
<p>Due to factors that often affect international shipments, such as holidays, customs, and weather delays, we can only offer an estimate of shipping times. If any of the above scenarios occur with your package we promise to keep you well informed with as much information that is available to us.</p>

<p>Then the estimated delivery date is calculated with the formula below:</p>
<p><strong>Estimated Delivery Date = Purchasing date + 2-5 business days (process for stocking) + Estimated shipping time</strong></p>

<p>You can receive your order on or before the Estimated Delivery Date.</p>

<p>For items that ship from our Asia warehouse, there's typically a delay in tracking information being updated from the time the package enters USPS facilities in China to the time it's processed at USPS facilities in the US. This usually takes between 2-7 days on average, although it can take as long as 8-12 days.</p>

<h2>Shipping Guarantee</h2>
<p>To back up our commitment and promise to you we will refund the cost of shipping (or give a partial refund if shipping was free) on any item that takes longer than the following time frames to arrive at your destination.</p>
<ul>
<li>USA (Mainland): 40 days</li>
<li>USA (Other): 45 days</li>
<li>Canada: 40 days</li>
<li>Australia: 40 days</li>
<li>New Zealand: 40 days</li>
<li>UK: 45 days</li>
<li>Rest of World: 60 days</li>
</ul>

<h2>Risk free shopping</h2>
<p>If for whatever reason your goods don't arrive within 60 days, you will be refunded in FULL for that item. This is our promise to you! If there's a missing order, please let us know via {{email_support}}. We'll investigate (it usually took 3-5 business days) and send you another one after we got a conclusion.</p>

<h2>Customs and taxes</h2>
<p>The prices displayed on our site are tax-free in US Dollars, which means you may be liable to pay for duties and taxes once you receive your order.</p>

<p>Import taxes, duties and related customs fees may be charged once your order arrives at its final destination, which are determined by your local customs office.</p>

<p>Payment of these charges and taxes are your responsibility and will not be covered by us. We are not responsible for delays caused by the customs department in your country. For further details of charges, please contact your local customs office.</p>

<h2>Wrong address disclaimer</h2>
<p>It is the responsibility of the buyer to make sure that she or he enters the address correctly. We cannot guarantee address changes due to strict shipping schedules. Please double-check the address you are entering, as we will NOT be held responsible for packages that are sent to the wrong address that the buyer has entered.</p>

<p>If the order arrives at your country and:</p>
<ul>
<li>The customer refuses to accept the package</li>
<li>Number of attempts is made in the country of destination to deliver the package.</li>
</ul>
<p>We reserve the right to abandon the package(s) and will not be responsible for any refund.</p>`,
  },
  {
    title: 'Terms of Service',
    slug: 'terms-of-service',
    policyType: 'terms_of_service',
    displayOrder: 4,
    bodyHtml: `<h1>Terms of Service</h1>

<h2>OVERVIEW</h2>
<p>This website is operated by {{store_name}}. Throughout the site, the terms "we", "us" and "our" refer to {{store_name}}. {{store_name}} offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.</p>

<p>By visiting our site and/ or purchasing something from us, you engage in our "Service" and agree to be bound by the following terms and conditions ("Terms of Service", "Terms"), including those additional terms and conditions and policies referenced herein and/or available by hyperlink. These Terms of Service apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/ or contributors of content.</p>

<p>Please read these Terms of Service carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services. If these Terms of Service are considered an offer, acceptance is expressly limited to these Terms of Service.</p>

<p>We {{store_name}} take full responsibility for all payments made via our website. This responsibility includes: refunds, chargebacks, cancellations and dispute resolution.</p>

<p>In the event that a dispute is raised we will offer the first line of support and will refund the Buyer if deemed appropriate.</p>

<p>If you have any problems with your order, you can contact our customer care team on or by sending an email to {{email_support}}</p>

<h2>SECTION 1 - ONLINE STORE TERMS</h2>
<p>By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.</p>

<p>You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).</p>

<p>You must not transmit any worms or viruses or any code of a destructive nature.</p>

<p>A breach or violation of any of the Terms will result in an immediate termination of your Services.</p>

<h2>SECTION 2 - GENERAL CONDITIONS</h2>
<p>We reserve the right to refuse service to anyone for any reason at any time.</p>

<p>You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks.</p>

<p>You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service or any contact on the website through which the service is provided, without express written permission by us.</p>

<h2>SECTION 3 - ACCURACY, COMPLETENESS AND TIMELINESS OF INFORMATION</h2>
<p>We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information. Any reliance on the material on this site is at your own risk.</p>

<h2>SECTION 4 - MODIFICATIONS TO THE SERVICE AND PRICES</h2>
<p>Prices for our products are subject to change without notice.</p>

<p>We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.</p>

<p>We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.</p>

<h2>SECTION 5 - PRODUCTS OR SERVICES</h2>
<p>Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy.</p>

<p>We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.</p>

<p>We reserve the right, but are not obligated, to limit the sales of our products or Services to any person, geographic region or jurisdiction. We may exercise this right on a case-by-case basis. We reserve the right to limit the quantities of any products or services that we offer. All descriptions of products or product pricing are subject to change at anytime without notice, at the sole discretion of us. We reserve the right to discontinue any product at any time. Any offer for any product or service made on this site is void where prohibited.</p>

<p>We do not warrant that the quality of any products, services, information, or other material purchased or obtained by you will meet your expectations, or that any errors in the Service will be corrected.</p>

<h2>SECTION 6 - CONTACT INFORMATION</h2>
<p>Questions about the Terms of Service should be sent to us at {{email_support}}</p>`,
  },
  {
    title: 'FAQs',
    slug: 'faqs',
    policyType: 'faqs',
    displayOrder: 5,
    bodyHtml: `<h1>Frequently Asked Questions</h1>

<h2>WHERE DO YOU SHIP FROM?</h2>
<p>{{store_url}} works very closely with top global merchants from all over the world to source and curates the most unique products on the market at the best prices for you. We travel the world and meet trusted suppliers to put together a collection of fun and trending product, this way, you don't have to drive around to retail shops, search thousands of different websites to price compare and get ideas...think of us as a one-stop shop destination for the most popular products. :) Because of this, your order can be shipped anywhere from China, Tibet, India, Vietnam etc. via our partnership with USPS.</p>

<h2>ORDER & TRACKING</h2>
<p>When you place your order, you will receive a Purchase Confirmation email confirming your Order # and purchase details. You can cancel your order or make changes to your shipping information the same day you placed your order by midnight. After 6 hours, your order will be processed for stocking, packing and shipping and this normally takes 5-10 business days. When this is completed, you will receive a Shipping Confirmation email.</p>

<p>Once your order has shipped, we will send you another Shipping Update email with your tracking number. To track your package, simply click on the link provided. Tracking information may not be available for the first couple of days after you receive your Shipping Update email. Several days may pass between package scans. We assure you that this is normal and will not affect your expected delivery date.</p>

<h2>DELIVERY TIME</h2>
<p>Orders from the US: Delivery date and time are approximately 2-4 weeks from shipping date (depending on how strict the Customs in your State is).</p>

<p>Orders from outside the US: Delivery date and time is approximately 4-6 weeks from shipping date (depending on how strict the Customs in your Country is).</p>

<h2>RETURNS & EXCHANGES</h2>

<h3>What is your cancellation policy?</h3>
<p>You have 6 hours of the same day to cancel your order and receive a refund after your purchase. If you try to cancel your order after you received a Shipping Confirmation email, we will not be able to issue a refund as the item has already been packaged and shipped out to you.</p>

<h3>What is the return policy?</h3>
<p>If your product is damaged or defected, please kindly email us with the subject line "Return: Damage or Defected item with your order #" along with a photograph so we can immediately look into sending you a new one.</p>

<p>The return policy will only apply to damaged items or products that have any manufacturing problems. We will not make any refunds or changes once the product has been successfully delivered in normal condition.</p>

<p>We do not refund shipping cost. Return shipping is to be paid by the Buyer.</p>`,
  },
  {
    title: 'About Us',
    slug: 'about-us',
    policyType: 'about_us',
    displayOrder: 6,
    bodyHtml: `<h1>About Us</h1>

<p>Congrats! You found a place with the coolest items. We have spent years searching for creative, smart and useful products around the world and bring them to you with a belief that they may help you make your life easier. We are also helping a lot of people have great ideas to gift their friends. We are sure that in this online shopping house, there is stuff you may not know that it has even existed. We always try our best to provide customers great online shopping experience by ensuring not only the smooth buying process but also the good after-sales service. Please do not hesitate to contact us, give us comments, feed-backs, suggestions or even criticisms. Life is too short to live in chaos, take it easy and make it fun by using creative stuff. Thanks for stopping by- feel free to contact us if you have any questions. Happy Shopping!</p>

<p>For any inquiries, please contact us at {{email_support}}</p>`,
  },
  {
    title: 'DMCA',
    slug: 'dmca',
    policyType: 'dmca',
    displayOrder: 7,
    bodyHtml: `<h1>DMCA</h1>

<p>We follow the DMCA procedures for removing any content on any of the sites on servers hosted by {{store_name}} that is posted by third parties and which infringes on intellectual property rights. Offenders may be banned from commenting on the site. If you believe that any content on our site infringes on your intellectual property, please contact us using the form below with the specific details of the content, including:</p>

<ul>
<li>Your name, address, and electronic signature</li>
<li>The infringing materials and the URL where they are located on our site</li>
<li>Proof that you hold intellectual property rights to the material</li>
<li>A statement by you that you have a good faith belief that there is no legal basis for the use of the content</li>
<li>A statement of the accuracy of the notice and, under penalty of perjury, that you are either the owner of the intellectual property rights or are authorized to act on the behalf of the owner</li>
</ul>

<p>If we receive a DMCA claim and remove the relevant content that you have posted to our site, you may send us a counter-notice. The counter-notice must contain the following information:</p>

<ul>
<li>Your name, address, phone number, and physical or electronic signature</li>
<li>Identification of the material and its location before removal</li>
<li>A statement under penalty of perjury that the material was removed by mistake or misidentification</li>
<li>Subscriber consent to local federal court jurisdiction, or if overseas, to an appropriate judicial body</li>
</ul>

<h2>STATEMENTS:</h2>

<p>When you send us DMCA report, we understand that you have read and accepted the statements below:</p>

<p>*I have a good faith belief that content(s) in the campaign described above violate(s) my rights described above or those held by the rights owner, and that the use of such content(s) is contrary to law</p>

<p>*I declare, under penalty of perjury, that the information completed above is correct and accurate and that I am the owner or agent of the owner of the rights described above.</p>

<h2>CONTACT US:</h2>

<p>{{store_name}}</p>
<p>Email us: {{email_support}}</p>`,
  },
];
