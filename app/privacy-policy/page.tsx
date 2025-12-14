import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy — Rendeza",
  description: "Rendeza Privacy Policy - Learn how we collect, use, and protect your personal information.",
}

export default function PrivacyPolicyPage() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-[#FFF0DC] py-16 px-6 md:px-12 lg:px-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="text-2xl md:text-3xl font-serif text-[#543A14] uppercase tracking-wide inline-block mb-6 hover:opacity-80 transition-opacity"
          >
            RENDEZA
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif font-light text-[#543A14] mb-4">
            Privacy Policy
          </h1>
          <p className="text-[#543A14]/70">
            Last Updated: {currentDate}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg border border-[#F0BB78]/20 p-8 md:p-10 lg:p-12 space-y-8 text-[#543A14]">
          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              1. Introduction
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              Welcome to Rendeza ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with us.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              By using our website and services, you consent to the data practices described in this Privacy Policy. If you do not agree with the data practices described in this policy, you should not use our website or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              2. Information We Collect
            </h2>
            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              2.1 Personal Information You Provide
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              We collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li>Fill out our contact form or free trial form</li>
              <li>Communicate with us via email or other channels</li>
              <li>Subscribe to our services</li>
            </ul>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              This information may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li><strong>Contact Information:</strong> Name, email address, phone number, and postal address</li>
              <li><strong>Reservation Preferences:</strong> Preferred days and times, number of guests, dining companions (spouse, family, friends, etc.), and dietary preferences or restrictions</li>
              <li><strong>Additional Information:</strong> Any other information you choose to provide in messages or forms, such as preferred cuisine types, restaurant preferences, or special requests</li>
              <li><strong>Subscription and Payment Information:</strong> When you subscribe to our service, we collect billing information, payment method details (processed securely through our payment processors), subscription plan details, billing address, and transaction history</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              2.2 Automatically Collected Information
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              When you visit our website, we may automatically collect certain information about your device and browsing behavior, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li><strong>Device Information:</strong> IP address, browser type and version, operating system, device identifiers</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on pages, clickstream data, referring/exit pages, date and time of visits</li>
              <li><strong>Location Data:</strong> General geographic location based on IP address</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              2.3 Cookies and Tracking Technologies
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              We use cookies, web beacons, and similar tracking technologies to collect and store information about your preferences and browsing behavior. Cookies are small data files stored on your device that help us improve your experience. We use cookies for:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li>Analytics and performance monitoring (via Vercel Analytics)</li>
              <li>Website functionality and user preferences</li>
              <li>Understanding how visitors interact with our website</li>
            </ul>
            <p className="text-base md:text-lg leading-relaxed">
              You can control cookies through your browser settings, but disabling cookies may limit your ability to use certain features of our website.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              2.4 Payment and Subscription Information
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              When you subscribe to our services, we collect and process payment and subscription-related information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li><strong>Payment Method Information:</strong> Credit card numbers, debit card numbers, bank account information, and other payment details (processed securely through PCI DSS compliant payment processors)</li>
              <li><strong>Billing Information:</strong> Billing name, billing address, and billing contact information</li>
              <li><strong>Subscription Details:</strong> Subscription plan type, subscription start and end dates, renewal dates, subscription status, and payment frequency</li>
              <li><strong>Transaction Records:</strong> Payment history, invoice records, transaction IDs, refund information, and chargeback data</li>
              <li><strong>Account Information:</strong> Account creation date, account status, subscription preferences, and cancellation information</li>
            </ul>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              <strong>Important:</strong> We do not store full credit card numbers or CVV codes on our servers. All payment card information is processed and stored securely by our PCI DSS compliant payment processors. We only store tokenized payment information necessary for subscription management.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              3. How We Use Your Information
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li><strong>Service Provision:</strong> To provide, maintain, and improve our restaurant reservation services, including making reservations on your behalf and communicating with restaurants</li>
              <li><strong>Payment Processing:</strong> To process payments, manage subscriptions, handle billing, send invoices and receipts, manage renewals, and process refunds or cancellations</li>
              <li><strong>Subscription Management:</strong> To manage your subscription account, process subscription changes, handle upgrades or downgrades, manage trial periods, and communicate subscription-related information</li>
              <li><strong>Communication:</strong> To respond to your inquiries, send you service-related information, updates, and administrative messages, including billing notifications and subscription reminders</li>
              <li><strong>Personalization:</strong> To personalize your experience and provide recommendations based on your preferences</li>
              <li><strong>Fraud Prevention:</strong> To detect, prevent, and address fraud, unauthorized transactions, and security threats related to payments and subscriptions</li>
              <li><strong>Analytics:</strong> To analyze usage patterns, improve our website functionality, and enhance user experience</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes, tax requirements, financial regulations, or governmental requests</li>
              <li><strong>Protection:</strong> To detect, prevent, and address technical issues, security threats, or violations of our terms of service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              4. Information Sharing and Disclosure
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              4.1 Service Providers
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              We work with third-party service providers who perform services on our behalf, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li><strong>Payment Processors:</strong> For processing payments, managing payment methods, handling subscriptions, and processing refunds. These processors are PCI DSS compliant and handle all sensitive payment card information securely. We do not store full payment card details on our servers.</li>
              <li><strong>Resend:</strong> For sending transactional emails and communications</li>
              <li><strong>Geoapify:</strong> For address autocomplete and geocoding services</li>
              <li><strong>Vercel Analytics:</strong> For website analytics and performance monitoring</li>
            </ul>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              These service providers are contractually obligated to protect your information and may only use it for the purposes we specify. Payment processors are required to comply with PCI DSS (Payment Card Industry Data Security Standard) requirements and other applicable financial regulations.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              4.2 Restaurant Partners
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              We may share necessary information (such as name, reservation details, and contact information) with restaurant partners to make and manage your reservations.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              4.3 Legal Requirements
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              We may disclose your information if required by law, court order, or governmental authority, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              4.4 Business Transfers
            </h3>
            <p className="text-base md:text-lg leading-relaxed">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction, subject to the same privacy protections.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              5. Data Security
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li>Encryption of data in transit using secure protocols (HTTPS/TLS)</li>
              <li>Encryption of sensitive data at rest</li>
              <li>Secure storage of personal information with access controls</li>
              <li>PCI DSS compliance for payment data (via our payment processors)</li>
              <li>Regular security assessments, vulnerability scans, and updates</li>
              <li>Access controls, authentication procedures, and role-based access restrictions</li>
              <li>Secure payment processing through PCI DSS compliant third-party payment processors</li>
              <li>Regular monitoring and logging of access to sensitive information</li>
            </ul>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              <strong>Payment Data Security:</strong> We do not store full credit card numbers, CVV codes, or other sensitive payment card data on our servers. All payment card information is processed and stored securely by our PCI DSS compliant payment processors. We only store tokenized payment references necessary for subscription management.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              6. Data Retention
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Factors we consider when determining retention periods include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li>The nature and sensitivity of the information</li>
              <li>The purposes for which we process the information</li>
              <li>Legal, contractual, or regulatory requirements (including tax and financial record-keeping requirements)</li>
              <li>Our legitimate business interests</li>
              <li>Active vs. inactive subscription status</li>
            </ul>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              <strong>Payment and Subscription Records:</strong> We retain payment and billing records as required by law, typically for at least 7 years for tax and accounting purposes, even after subscription cancellation. Transaction records, invoices, and payment history are retained in accordance with applicable financial regulations and tax requirements.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              When we no longer need your information (subject to legal retention requirements), we will securely delete or anonymize it in accordance with our data retention policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              7. Your Privacy Rights
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              Depending on your location, you may have certain rights regarding your personal information:
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              7.1 General Rights
            </h3>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information, subject to legal retention requirements</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
              <li><strong>Objection:</strong> Object to processing of your personal information in certain circumstances</li>
              <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              7.2 California Privacy Rights (CCPA/CPRA)
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              If you are a California resident, you have the following additional rights:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li><strong>Right to Know:</strong> Request information about the categories and specific pieces of personal information we collect, use, disclose, and sell</li>
              <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
              <li><strong>Right to Opt-Out:</strong> Opt-out of the sale of personal information (we do not sell personal information)</li>
              <li><strong>Right to Non-Discrimination:</strong> Exercise your privacy rights without discrimination</li>
              <li><strong>Right to Correct:</strong> Request correction of inaccurate personal information</li>
            </ul>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              We do not sell your personal information. You may exercise your California privacy rights by contacting us at the information provided in Section 11.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              7.3 European Privacy Rights (GDPR)
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              If you are located in the European Economic Area (EEA) or United Kingdom (UK), you have rights under the General Data Protection Regulation (GDPR), including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li>Right of access, rectification, erasure, and restriction of processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing based on legitimate interests</li>
              <li>Right to withdraw consent where processing is based on consent</li>
              <li>Right to lodge a complaint with a supervisory authority</li>
            </ul>
            <p className="text-base md:text-lg leading-relaxed">
              Our legal basis for processing your personal information includes: (1) your consent, (2) performance of a contract, (3) compliance with legal obligations, (4) protection of vital interests, (5) public interest, and (6) legitimate business interests.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              7.4 Exercising Your Rights
            </h3>
            <p className="text-base md:text-lg leading-relaxed">
              To exercise any of these rights, please contact us using the information provided in Section 11. We will respond to your request within the timeframes required by applicable law. We may need to verify your identity before processing your request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              8. Children's Privacy
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              Our services are not directed to children under the age of 13 (or 16 in the EEA/UK). We do not knowingly collect personal information from children under these ages. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. If we become aware that we have collected personal information from a child without parental consent, we will take steps to delete that information.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              We comply with the Children's Online Privacy Protection Act (COPPA) and applicable laws regarding children's privacy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              9. Third-Party Links and Services
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              Our website may contain links to third-party websites or services that are not operated by us. We are not responsible for the privacy practices of these third-party sites. We encourage you to review the privacy policies of any third-party sites you visit.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              We use the following third-party services that may collect information about you:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed mt-4">
              <li><strong>Payment Processors:</strong> For processing payments, managing subscriptions, and handling billing. These services are PCI DSS compliant and handle payment card information securely. Common processors include Stripe, PayPal, or similar services. Review their privacy policies on their respective websites.</li>
              <li><strong>Vercel Analytics:</strong> Website analytics service. You can learn more about their practices at <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#F0BB78] hover:underline">vercel.com/legal/privacy-policy</a></li>
              <li><strong>Geoapify:</strong> Address autocomplete service. Review their privacy policy at <a href="https://www.geoapify.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#F0BB78] hover:underline">geoapify.com/privacy-policy</a></li>
              <li><strong>Resend:</strong> Email delivery service. Review their privacy policy at <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#F0BB78] hover:underline">resend.com/legal/privacy-policy</a></li>
            </ul>
            <p className="text-base md:text-lg leading-relaxed">
              When you make a payment through our website, your payment information is collected and processed directly by our payment processors. We do not have access to your full payment card details, as this information is handled securely by the payment processor in compliance with PCI DSS requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              10. International Data Transfers
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using our services, you consent to the transfer of your information to these countries.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              We take appropriate safeguards to ensure that your personal information receives an adequate level of protection, including using standard contractual clauses approved by relevant authorities where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              11. Changes to This Privacy Policy
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li>Posting the updated Privacy Policy on this page with a new "Last Updated" date</li>
              <li>Sending you an email notification if you have provided us with your email address</li>
              <li>Providing a prominent notice on our website</li>
            </ul>
            <p className="text-base md:text-lg leading-relaxed">
              Your continued use of our services after any changes to this Privacy Policy constitutes acceptance of those changes. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              12. Contact Us
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-[#FFF0DC] p-6 rounded-lg border border-[#F0BB78]/30">
              <p className="text-base md:text-lg leading-relaxed mb-2">
                <strong>Rendeza</strong>
              </p>
              <p className="text-base md:text-lg leading-relaxed mb-2">
                Email: <a href="mailto:contact@rendeza.com" className="text-[#F0BB78] hover:underline">contact@rendeza.com</a>
              </p>
              <p className="text-base md:text-lg leading-relaxed">
                For privacy-related inquiries, please include "Privacy Inquiry" in the subject line of your email.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              13. Do Not Sell My Personal Information (California)
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              We do not sell your personal information. We do not sell, rent, or trade your personal information to third parties for their marketing purposes. If this practice changes in the future, we will update this Privacy Policy and provide you with appropriate opt-out mechanisms as required by law.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              California residents can request information about our information-sharing practices by contacting us at the email address provided above.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              14. Additional Information
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              This Privacy Policy is effective as of the date listed at the top of this page. This policy supplements, but does not replace, any other privacy notices or agreements we may provide to you in connection with specific services or transactions.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              If any provision of this Privacy Policy is found to be invalid or unenforceable, the remaining provisions will continue to be valid and enforceable to the fullest extent permitted by law.
            </p>
          </section>

          {/* Back to Home Link */}
          <div className="pt-8 border-t border-[#F0BB78]/30 mt-12">
            <Link
              href="/"
              className="inline-flex items-center text-[#543A14] hover:text-[#F0BB78] transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

