import React from 'react';
import { PolicyLayout } from '../components/PolicyLayout';

export const Privacy: React.FC = () => {
  return (
    <PolicyLayout title="Privacy Policy" lastUpdated="June 2026">
      <div className="space-y-6">
        <p className="text-slate-600 font-medium">
          Welcome to Ordio. We respect your privacy and are committed to protecting your personal information.
        </p>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">1. About Ordio</h2>
          <p className="text-slate-650">
            Ordio is a QR-based restaurant ordering and management platform that allows customers to browse menus, place orders, request waiter assistance, request bills, and make payments digitally.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">2. Information We Collect</h2>
          <p className="text-slate-650 mb-2">We collect the following categories of information:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-650 text-sm">
            <li><strong>Customer Details:</strong> Name, phone number, email address when placing orders or registers.</li>
            <li><strong>Restaurant & Staff Information:</strong> Name, address, layout, employee details, and passwords.</li>
            <li><strong>Order & Payment Details:</strong> Transaction records, amount, food items ordered, and table number.</li>
            <li><strong>Device & Usage Data:</strong> IP address, device type, browser model, operating system, and log files.</li>
            <li><strong>Analytics:</strong> Session length, pages viewed, and other usage telemetry.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">3. How We Use Information</h2>
          <p className="text-slate-650 mb-2">Collected details are processed to:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-650 text-sm">
            <li>Process, route, and fulfill food and beverage orders.</li>
            <li>Facilitate restaurant kitchen operations and waiter services.</li>
            <li>Generate bills, receipts, and verify transaction states.</li>
            <li>Improve overall platform performance, loading speed, and user experience.</li>
            <li>Provide customer support and resolve order disputes.</li>
            <li>Prevent spam, fake orders, fraud, and system abuse.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">4. Payment Information</h2>
          <p className="text-slate-650">
            Payments are securely routed through integrated third-party payment gateways (such as Razorpay). Ordio does not store complete debit/credit card numbers, CVVs, net banking credentials, or UPI PINs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">5. Data Sharing</h2>
          <p className="text-slate-650">
            We do not sell user data. Information is shared only with the respective restaurant partner where you order, payment gateway providers to process transactions, and legal authorities when required by law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">6. Data Security</h2>
          <p className="text-slate-650">
            We implement technical and organizational measures (including password hashing, secure socket layer HTTPS/TLS encryption, and database access controls) to prevent unauthorized access, loss, or disclosure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">7. Cookies & Analytics</h2>
          <p className="text-slate-650">
            Cookies and session tokens are used to store active table ordering sessions, maintain authentication states, save user settings (such as theme choice), and gather analytics to improve service quality.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">8. Data Retention</h2>
          <p className="text-slate-650">
            We retain personal information only as long as necessary for business, legal, audit, and operational requirements. If you wish to delete your details, please contact us.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">9. User Rights</h2>
          <p className="text-slate-650">
            Depending on your location, you may have the right to request access, correction, deletion, or restriction of your personal data. Feel free to reach out to our support mail.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">10. Third-Party Services</h2>
          <p className="text-slate-650">
            Ordio contains links and integrations with third-party payment channels, analytical services, and notifications. We are not responsible for the privacy practices of third-party domains.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">11. Children's Privacy</h2>
          <p className="text-slate-650">
            Ordio is not intended or targeted for children under 13 years of age. We do not knowingly collect personal data from minors.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">12. Changes to This Policy</h2>
          <p className="text-slate-650">
            We may update this Privacy Policy periodically. Any updates will be published here on our website.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">13. Compliance</h2>
          <p className="text-slate-650">
            Ordio aims to comply with applicable data protection regulations, including India's Digital Personal Data Protection Act, 2023 (DPDP Act).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">14. Contact Information</h2>
          <p className="text-slate-650">
            For privacy inquiries or grievance redressal, contact us:<br />
            <strong>Company:</strong> Ordio<br />
            <strong>Website:</strong> ordio.in<br />
            <strong>Email:</strong> support@ordio.in
          </p>
        </section>
      </div>
    </PolicyLayout>
  );
};
