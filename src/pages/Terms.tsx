import React from 'react';
import { PolicyLayout } from '../components/PolicyLayout';

export const Terms: React.FC = () => {
  return (
    <PolicyLayout title="Terms & Conditions" lastUpdated="June 2026">
      <div className="space-y-6">
        <p className="text-slate-600 font-medium">
          Welcome to Ordio. By accessing or using Ordio's website, platform, applications, and services, you agree to be bound by these Terms & Conditions.
        </p>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">1. About Ordio</h2>
          <p className="text-slate-650">
            Ordio is a QR-based restaurant ordering and management platform that enables customers to scan table QR codes, browse menus, place orders, request waiter assistance, request bills, and make payments digitally.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">2. Eligibility</h2>
          <p className="text-slate-650">
            You must be legally capable of entering into a binding agreement in your jurisdiction and provide accurate, truthful information during onboarding or ordering.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">3. User Accounts</h2>
          <p className="text-slate-650">
            Users are responsible for maintaining account confidentiality and all activities under their accounts. If you suspect unauthorized access, contact support immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">4. Customer Usage</h2>
          <p className="text-slate-650">
            Customers may scan QR codes, browse menus, place orders, track orders, request waiter assistance, request bills, and make payments. You agree not to abuse or spoof QR codes or place fake orders.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">5. Restaurant Owner Responsibilities</h2>
          <p className="text-slate-650">
            Restaurant owners are responsible for menu accuracy, pricing, tax calculations, staff management, and compliance with local food safety and hospitality regulations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">6. Waiter Accounts</h2>
          <p className="text-slate-650">
            Authorized waiters and staff may manage tables, orders, and customer requests. Waiters are responsible for maintaining the privacy and security of their passcode/login details.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">7. Subscription & Licensing</h2>
          <p className="text-slate-650">
            Ordio operates as a subscription-based SaaS platform with subscription plans, promotional codes, and license activation systems. Subscriptions are billed in advance based on the selected duration.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">8. Payments</h2>
          <p className="text-slate-650">
            Payments may be processed through integrated third-party payment gateways (such as Razorpay). Ordio does not store complete card, bank, or transaction details on its servers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">9. Intellectual Property</h2>
          <p className="text-slate-650">
            All software, databases, designs, logos, graphics, and platform content remain the sole property of Ordio. You may not copy, reverse-engineer, or use any assets without written permission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">10. Prohibited Activities</h2>
          <p className="text-slate-650">
            Unauthorized access, reverse engineering, spamming, DDOS attacks, script-based ordering, and any illegal use of the platform are strictly prohibited and will lead to legal action.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">11. Platform Availability</h2>
          <p className="text-slate-650">
            Service availability is not guaranteed and may be temporarily interrupted for maintenance or technical reasons. We strive to maintain 99.9% uptime.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">12. Limitation of Liability</h2>
          <p className="text-slate-650">
            Ordio is not liable for indirect damages, revenue loss, business interruption, payment gateway failures, or dispute issues between restaurants and customers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">13. Account Suspension</h2>
          <p className="text-slate-650">
            Accounts violating these terms, spamming, or committing payment fraud may be suspended or terminated immediately without refunds.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">14. Privacy</h2>
          <p className="text-slate-650">
            Your use of Ordio is also governed by our Privacy Policy, which outlines how we collect, process, and protect your information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">15. Modifications</h2>
          <p className="text-slate-650">
            Terms may be updated periodically. Any updates will be published on our website and will become effective immediately upon publication.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">16. Governing Law</h2>
          <p className="text-slate-650">
            These terms are governed by the laws of India. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the courts of India.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">17. Contact Information</h2>
          <p className="text-slate-650">
            If you have any questions or require support, please contact us:<br />
            <strong>Website:</strong> ordio.in<br />
            <strong>Email:</strong> support@ordio.in
          </p>
        </section>
      </div>
    </PolicyLayout>
  );
};
