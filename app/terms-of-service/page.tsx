import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service — Rendeza",
  description: "Rendeza Terms of Service - Review our terms and conditions for using our restaurant reservation subscription service.",
}

export default function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          <p className="text-[#543A14]/70">
            Last Updated: {currentDate}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg border border-[#F0BB78]/20 p-8 md:p-10 lg:p-12 space-y-8 text-[#543A14]">
          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              1. Acceptance of Terms
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              Welcome to Rendeza ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of our website, services, and subscription platform (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms and our Privacy Policy, which is incorporated herein by reference.
            </p>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              If you do not agree to these Terms, you may not access or use the Service. These Terms constitute a legally binding agreement between you and Rendeza.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              We reserve the right to modify these Terms at any time. Material changes will be notified to you via email or through a prominent notice on our website. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              2. Service Description
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              Rendeza provides a subscription-based restaurant reservation service that automates the process of making recurring reservations at restaurants on your behalf. Our Service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li>Automatic restaurant reservations based on your preferences and schedule</li>
              <li>Management of recurring reservations (weekly, bi-weekly, or monthly)</li>
              <li>Communication with restaurant partners to secure reservations</li>
              <li>Coordination of reservation details and preferences</li>
              <li>Calendar integration and reservation notifications</li>
            </ul>
            <p className="text-base md:text-lg leading-relaxed">
              We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice, at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              3. Eligibility and Account Registration
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              To use our Service, you must:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and update your information to keep it accurate, current, and complete</li>
              <li>Be responsible for maintaining the confidentiality of your account credentials</li>
            </ul>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              You are solely responsible for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              We reserve the right to refuse service, terminate accounts, or remove or edit content at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              4. Subscription Terms
            </h2>
            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              4.1 Subscription Plans
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              We offer subscription plans with different features and pricing. Details of available subscription plans, features, and pricing are available on our website and may be updated from time to time.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              4.2 Free Trial Period
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              We may offer a free trial period for new subscribers. During the free trial, you will have access to the Service without charge. At the end of the free trial period, your subscription will automatically convert to a paid subscription unless you cancel before the trial period ends.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              You may cancel your subscription at any time during the free trial period without being charged.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              4.3 Subscription Renewal
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              Unless you cancel your subscription before the end of the current billing period, your subscription will automatically renew for the same subscription term at the then-current subscription fee.
            </p>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              You authorize us to charge your payment method for the renewal subscription fee. The renewal fee will be charged at the beginning of each renewal period.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              4.4 Subscription Changes
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              You may upgrade or downgrade your subscription plan at any time. Changes to your subscription plan will take effect at the beginning of the next billing cycle, unless otherwise specified.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              We reserve the right to modify subscription plans, features, or pricing with reasonable notice. Changes will not affect your current subscription period but may apply to subsequent renewals.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              5. Payment Terms
            </h2>
            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              5.1 Payment Methods
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              Subscription fees are payable in advance. We accept various payment methods, including credit cards, debit cards, and other payment methods as indicated on our website. All payments are processed securely through our third-party payment processors.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              5.2 Billing and Fees
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              Subscription fees are stated in the currency indicated at the time of purchase. You are responsible for all applicable taxes, duties, or fees imposed by any governmental authority in connection with your use of the Service.
            </p>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              If your payment method fails or your account is past due, we may suspend or cancel your subscription until payment is received. You are responsible for all fees incurred in connection with failed payment attempts.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              5.3 Price Changes
            </h3>
            <p className="text-base md:text-lg leading-relaxed">
              We reserve the right to change our subscription fees at any time. Price changes will not affect your current subscription period but will apply to subsequent renewal periods. We will provide you with reasonable notice of any price changes.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              5.4 Refunds
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              Subscription fees are generally non-refundable, except as required by law or as otherwise specified in these Terms. We do not provide refunds for partial subscription periods.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              If you are not satisfied with our Service, please contact us at <a href="mailto:contact@rendeza.com" className="text-[#F0BB78] hover:underline">contact@rendeza.com</a> to discuss your concerns. We may, at our sole discretion, provide a refund or credit in exceptional circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              6. Cancellation and Termination
            </h2>
            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              6.1 Cancellation by You
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              You may cancel your subscription at any time through your account settings or by contacting us at <a href="mailto:contact@rendeza.com" className="text-[#F0BB78] hover:underline">contact@rendeza.com</a>.
            </p>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              If you cancel your subscription:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li>Your subscription will remain active until the end of the current billing period</li>
              <li>You will continue to have access to the Service until the end of the current billing period</li>
              <li>You will not be charged for subsequent billing periods</li>
              <li>No refund will be provided for the current billing period</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              6.2 Termination by Us
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              We reserve the right to suspend or terminate your account and access to the Service immediately, without prior notice or liability, for any reason, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li>Breach of these Terms</li>
              <li>Fraudulent, illegal, or harmful activity</li>
              <li>Non-payment of subscription fees</li>
              <li>Violation of applicable laws or regulations</li>
              <li>Any other reason we deem necessary to protect our interests or the interests of other users</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              6.3 Effect of Termination
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              Upon termination:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li>Your right to access and use the Service will immediately cease</li>
              <li>We may delete your account and associated data in accordance with our Privacy Policy</li>
              <li>You remain liable for all charges incurred prior to termination</li>
              <li>Provisions of these Terms that by their nature should survive termination will survive</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              7. User Obligations and Conduct
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li>Use the Service in any way that violates applicable laws or regulations</li>
              <li>Infringe upon or violate the rights of others, including intellectual property rights</li>
              <li>Transmit any malicious code, viruses, or harmful data</li>
              <li>Attempt to gain unauthorized access to the Service or related systems</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service</li>
              <li>Use the Service to transmit spam, unsolicited messages, or promotional materials</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
              <li>Use automated systems to access the Service without authorization</li>
              <li>Resell, redistribute, or sublicense the Service</li>
              <li>Use the Service in any manner that could damage, disable, or impair the Service</li>
            </ul>
            <p className="text-base md:text-lg leading-relaxed">
              You are responsible for providing accurate and complete information when using the Service, including reservation preferences and dietary requirements. You acknowledge that inaccurate or incomplete information may affect the quality of the Service provided.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              8. Reservation Service Terms
            </h2>
            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              8.1 Reservation Availability
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              We make reasonable efforts to secure reservations according to your preferences. However, we cannot guarantee that reservations will always be available at your preferred restaurants, dates, or times. Restaurant availability is subject to the policies and availability of our restaurant partners.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              8.2 Reservation Confirmation
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              We will notify you of confirmed reservations via email or through your account. It is your responsibility to confirm reservation details and notify us of any changes or cancellations you wish to make.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              8.3 No-Shows and Cancellations
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              You are responsible for honoring confirmed reservations. If you need to cancel or modify a reservation, please contact us as soon as possible. Repeated no-shows or last-minute cancellations may result in termination of your subscription.
            </p>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              Restaurant cancellation policies apply to all reservations. You are responsible for any cancellation fees imposed by restaurants.
            </p>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              <strong>No-Show Charges:</strong> In the event of a no-show (failure to appear for a confirmed reservation without prior cancellation), and if the restaurant charges us a no-show fee, cancellation fee, or any other penalty, you authorize us to charge your payment method on file for the same amount. This charge will be processed automatically and you will be notified via email of any such charges. By using our Service, you acknowledge and agree to this no-show charge policy.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              It is your responsibility to ensure you attend confirmed reservations or cancel them in advance to avoid no-show charges. We recommend canceling reservations at least 24 hours in advance, or as required by the specific restaurant's cancellation policy.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              8.4 Reservation Transfer and Assignment
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              Reservations made through our Service are non-transferable and may not be assigned to another person without our prior written consent and approval. You may not give your reservation to someone else, transfer it to another party, or allow someone else to use your reservation under their name without first contacting us to update the reservation details.
            </p>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              If you wish to transfer a reservation to another person, you must contact us at <a href="mailto:contact@rendeza.com" className="text-[#F0BB78] hover:underline">contact@rendeza.com</a> in advance, and we will attempt to accommodate the request subject to restaurant policies and availability. We reserve the right to refuse any transfer request at our sole discretion.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              Unauthorized transfers or attempts to allow unauthorized persons to use your reservations may result in immediate cancellation of the reservation, termination of your subscription, and may be subject to additional charges.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              8.5 Restaurant Partnerships
            </h3>
            <p className="text-base md:text-lg leading-relaxed">
              We work with various restaurant partners to provide reservations. We are not responsible for the quality of service, food, or experience provided by restaurant partners. Any disputes regarding restaurant service should be directed to the restaurant directly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              9. Intellectual Property
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              The Service, including all content, features, functionality, and design elements, is owned by Rendeza or its licensors and is protected by copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal, non-commercial use, subject to these Terms.
            </p>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              You may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li>Copy, modify, distribute, sell, or lease any part of the Service</li>
              <li>Reverse engineer or attempt to extract the source code of the Service</li>
              <li>Remove or alter any copyright, trademark, or other proprietary notices</li>
              <li>Use our trademarks, logos, or other branding without our prior written consent</li>
            </ul>
            <p className="text-base md:text-lg leading-relaxed">
              All feedback, comments, suggestions, and other submissions you provide to us may be used by us without restriction and without compensation to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              10. Disclaimer of Warranties
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li>WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT</li>
              <li>WARRANTIES THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE</li>
              <li>WARRANTIES REGARDING THE ACCURACY, RELIABILITY, OR QUALITY OF RESERVATIONS</li>
              <li>WARRANTIES REGARDING THE AVAILABILITY OF RESTAURANT RESERVATIONS</li>
            </ul>
            <p className="text-base md:text-lg leading-relaxed">
              We do not warrant that the Service will meet your requirements or expectations, or that any defects or errors will be corrected.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              11. Limitation of Liability
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL RENDEZA, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li>LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES</li>
              <li>DAMAGES RESULTING FROM UNAVAILABLE RESERVATIONS OR FAILED RESERVATION ATTEMPTS</li>
              <li>DAMAGES RESULTING FROM RESTAURANT SERVICE OR FOOD QUALITY</li>
              <li>DAMAGES RESULTING FROM UNAUTHORIZED ACCESS TO OR USE OF YOUR ACCOUNT</li>
            </ul>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE USE OF THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRIOR TO THE EVENT GIVING RISE TO THE LIABILITY, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              12. Indemnification
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              You agree to indemnify, defend, and hold harmless Rendeza, its affiliates, officers, directors, employees, agents, and licensors from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys' fees) arising out of or relating to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li>Your use or misuse of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your violation of any applicable laws or regulations</li>
              <li>Any content or information you submit or transmit through the Service</li>
            </ul>
            <p className="text-base md:text-lg leading-relaxed">
              We reserve the right to assume the exclusive defense and control of any matter subject to indemnification by you, in which case you agree to cooperate with our defense of such claims.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              13. Privacy
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              Your use of the Service is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information. By using the Service, you consent to the collection and use of your information as described in our Privacy Policy.
            </p>
            <p className="text-base md:text-lg leading-relaxed">
              Please review our Privacy Policy at <Link href="/privacy-policy" className="text-[#F0BB78] hover:underline">/privacy-policy</Link> to understand our practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              14. Dispute Resolution
            </h2>
            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              14.1 Governing Law
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the State of Israel, without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              14.2 Jurisdiction
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              Any disputes arising out of or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the competent courts of Tel Aviv, Israel.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              14.3 Informal Resolution
            </h3>
            <p className="text-base md:text-lg leading-relaxed">
              Before initiating formal dispute resolution proceedings, you agree to first contact us at <a href="mailto:contact@rendeza.com" className="text-[#F0BB78] hover:underline">contact@rendeza.com</a> to attempt to resolve the dispute informally. We will make reasonable efforts to resolve disputes in good faith.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              15. Modifications to Terms
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4 text-base md:text-lg leading-relaxed">
              <li>Sending an email to the address associated with your account</li>
              <li>Posting a prominent notice on our website</li>
              <li>Updating the "Last Updated" date at the top of these Terms</li>
            </ul>
            <p className="text-base md:text-lg leading-relaxed">
              Your continued use of the Service after such modifications constitutes acceptance of the updated Terms. If you do not agree to the modified Terms, you must stop using the Service and cancel your subscription.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              16. Miscellaneous
            </h2>
            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              16.1 Entire Agreement
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Rendeza regarding the Service and supersede all prior agreements and understandings.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              16.2 Severability
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              16.3 Waiver
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              Our failure to enforce any provision of these Terms shall not constitute a waiver of such provision or any other provision.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              16.4 Assignment
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              You may not assign or transfer these Terms or your rights hereunder without our prior written consent. We may assign these Terms or any rights hereunder without restriction.
            </p>

            <h3 className="text-xl font-medium mb-3 text-[#543A14] mt-6">
              16.5 Force Majeure
            </h3>
            <p className="text-base md:text-lg leading-relaxed">
              We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including acts of God, natural disasters, war, terrorism, labor disputes, or government actions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-serif font-light mb-4 text-[#543A14]">
              17. Contact Information
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding these Terms of Service, please contact us:
            </p>
            <div className="bg-[#FFF0DC] p-6 rounded-lg border border-[#F0BB78]/30">
              <p className="text-base md:text-lg leading-relaxed mb-2">
                <strong>Rendeza</strong>
              </p>
              <p className="text-base md:text-lg leading-relaxed mb-2">
                <strong>Address:</strong> Dizengoff 142, Tel Aviv, Israel
              </p>
              <p className="text-base md:text-lg leading-relaxed mb-2">
                <strong>Email:</strong> <a href="mailto:contact@rendeza.com" className="text-[#F0BB78] hover:underline">contact@rendeza.com</a>
              </p>
              <p className="text-base md:text-lg leading-relaxed">
                <strong>Phone:</strong> <a href="tel:+972542645589" className="text-[#F0BB78] hover:underline">+972 54 264 5589</a>
              </p>
            </div>
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

