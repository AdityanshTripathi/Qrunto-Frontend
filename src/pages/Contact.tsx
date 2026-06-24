import React, { useState } from 'react';
import { PolicyLayout } from '../components/PolicyLayout';
import { Mail, Clock, ShieldAlert, Send } from 'lucide-react';
import { toast } from 'sonner';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'support',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success('Your message has been sent successfully! We will get back to you within 24-48 hours.');
      setFormData({ name: '', email: '', subject: 'support', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <PolicyLayout title="Contact Us" lastUpdated="June 2026">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Support details */}
        <div className="space-y-6">
          <p className="text-slate-600 font-medium">
            We would love to hear from you. If you have any questions, feedback, technical issues, business inquiries, or support requests regarding Ordio, please contact us.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-slate-100/50 border border-slate-200/40 rounded-2xl p-4">
              <Mail className="w-5 h-5 text-[#FF6B35] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Email Channels</p>
                <p className="text-sm mt-1">
                  <strong>General Support:</strong> <a href="mailto:support@ordio.in" className="text-[#FF6B35] hover:underline">support@ordio.in</a><br />
                  <strong>Business Inquiries:</strong> <a href="mailto:business@ordio.in" className="text-[#FF6B35] hover:underline">business@ordio.in</a><br />
                  <strong>Technical Support:</strong> <a href="mailto:support@ordio.in" className="text-[#FF6B35] hover:underline">support@ordio.in</a>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-100/50 border border-slate-200/40 rounded-2xl p-4">
              <Clock className="w-5 h-5 text-[#FF6B35] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Support Hours & Speed</p>
                <p className="text-sm mt-1 text-slate-600">
                  <strong>Hours:</strong> Monday – Saturday (10:00 AM – 6:00 PM IST)<br />
                  <strong>Response Time:</strong> We aim to respond to all inquiries within 24 to 48 business hours.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-extrabold text-slate-900">For Restaurant Partners</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Restaurant owners interested in using Ordio for QR-based ordering, digital menus, waiter management, and restaurant operations can contact us for onboarding assistance.
            </p>

            <h3 className="text-sm font-extrabold text-slate-900 pt-2">For Customers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If you experience issues while placing orders, requesting bills, or making payments through Ordio, please contact our support team.
            </p>
          </div>
        </div>

        {/* Support ticket mockup */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-[24px] p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-[#FF6B35]" />
            Send a Message
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. John Doe"
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. john@example.com"
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
              >
                <option value="support">Technical Support</option>
                <option value="onboarding">Restaurant Onboarding</option>
                <option value="business">Business Inquiries</option>
                <option value="feedback">General Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your issue or inquiry in detail..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35] font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#FF6B35] hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </PolicyLayout>
  );
};
