import React from 'react';
import { PolicyLayout } from '../components/PolicyLayout';

export const Refund: React.FC = () => {
  return (
    <PolicyLayout title="Refund Policy" lastUpdated="June 2026">
      <div className="space-y-6">
        <p className="text-slate-600 font-medium">
          Thank you for choosing Ordio. This Refund Policy explains the conditions under which refunds may be issued for subscriptions and services purchased through Ordio.
        </p>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">1. Subscription Services</h2>
          <p className="text-slate-650">
            Ordio operates as a Software-as-a-Service (SaaS) platform for restaurants. Access to platform dashboards, menu tools, waiter operations, and QR ordering features is provided through paid subscription plans.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">2. Free Trial</h2>
          <p className="text-slate-650">
            If a free trial or demo period is offered, users are highly encouraged to evaluate the platform before purchasing a paid subscription plan.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">3. Refund Eligibility</h2>
          <p className="text-slate-650 mb-2">Refund requests may be considered only in the following special cases:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-650 text-sm">
            <li>Duplicate payment made by mistake.</li>
            <li>Incorrect amount charged due to a verified technical system error.</li>
            <li>Subscription activated but platform access was not provided due to a verified server issue.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">4. Non-Refundable Situations</h2>
          <p className="text-slate-650 mb-2">Refunds will not be provided for:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-650 text-sm">
            <li>Change of mind after purchase.</li>
            <li>Partial use of subscription services or duration.</li>
            <li>Failure to utilize the platform features.</li>
            <li>Business losses or operational issues unrelated to Ordio's system.</li>
            <li>Violation of our Terms & Conditions resulting in account suspension.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">5. Cancellation Policy</h2>
          <p className="text-slate-650">
            Users may cancel future subscription renewals at any time. Cancellation will stop future billing but does not automatically qualify for a refund of previous payments.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">6. Payment Processing</h2>
          <p className="text-slate-650">
            Approved refunds will be processed back through the original payment gateway or method used during purchase.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">7. Refund Processing Time</h2>
          <p className="text-slate-650">
            Approved refunds may take 5–10 business days to appear in the user's account, depending on the payment provider (e.g. Razorpay) and banking institution.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">8. Chargebacks</h2>
          <p className="text-slate-650">
            Users are encouraged to contact Ordio support before initiating chargebacks with banks or payment providers to resolve any payment concerns.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">9. Changes to This Policy</h2>
          <p className="text-slate-650">
            Ordio reserves the right to modify this Refund Policy at any time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">10. Contact Information</h2>
          <p className="text-slate-650">
            If you have refund queries, contact us:<br />
            <strong>Website:</strong> ordio.in<br />
            <strong>Email:</strong> support@ordio.in
          </p>
        </section>
      </div>
    </PolicyLayout>
  );
};
