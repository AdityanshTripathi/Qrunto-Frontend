import React, { useState } from 'react';
import { PolicyLayout } from '../components/PolicyLayout';
import { HelpCircle, Search, Mail, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "What is Ordio?",
      answer: "Ordio is a QR-based restaurant ordering and management platform that allows customers to scan table QR codes, browse menus, place orders, request waiter assistance, request bills, and make payments digitally."
    },
    {
      question: "Do customers need to install an app?",
      answer: "No. Customers can access Ordio directly through their smartphone browser by scanning the QR code available at their table. No app installation or sign-ups are required."
    },
    {
      question: "How do I place an order?",
      answer: "Simply scan the table QR code, browse the restaurant's menu, select food items, customize checkboxes/extras, add them to your cart, and confirm your order."
    },
    {
      question: "How can I call a waiter?",
      answer: "Use the 'Call Waiter' feature available on the customer menu interface. Waiter staff will instantly receive a notification with your table number on their Waiter Dashboard."
    },
    {
      question: "How do I request my bill?",
      answer: "Select the 'Request Bill' option from the customer menu interface. You can choose to pay online through the platform or pay directly at the counter."
    },
    {
      question: "What payment methods are supported?",
      answer: "Payment options depend on the restaurant configuration and may include UPI, Debit/Credit Cards, Net Banking, and wallet methods supported through integrated payment gateways like Razorpay."
    },
    {
      question: "I'm a restaurant owner. How do I get started?",
      answer: "Contact our onboarding team at support@ordio.in to set up your restaurant profile, construct your digital menu, generate table QR codes, assign staff credentials, and select a subscription plan."
    },
    {
      question: "Can waiters manage orders?",
      answer: "Yes. Waiters have access to the Waiter Desk where they can create orders, edit order items, update cooking statuses, assign tables, and handle customer requests."
    },
    {
      question: "How do I reset my password?",
      answer: "Use the 'Forgot Password' link on the login page to initiate a request, or contact your restaurant's administrator or Ordio support to reset it."
    },
    {
      question: "How do I contact support?",
      answer: "You can email our support desk directly at support@ordio.in. We offer onboarding support, payment disputes resolution, and general technical troubleshooting."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PolicyLayout title="Help Centre" lastUpdated="June 2026">
      <div className="space-y-8">
        <p className="text-slate-650 font-medium">
          Welcome to the Ordio Help Centre. We're here to help restaurant owners, staff, and customers get the most out of Ordio.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100/60 border border-slate-200/60 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35] transition-colors"
          />
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-3.5 text-left">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-[#FF6B35]" />
            Frequently Asked Questions
          </h2>

          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-slate-50 border border-slate-200/50 rounded-2xl overflow-hidden transition-all duration-250"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 font-bold text-sm sm:text-base text-slate-800 hover:text-[#FF6B35] text-left transition-colors focus:outline-none"
                  >
                    <span>{idx + 1}. {faq.question}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-[#FF6B35]" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/20 pt-3 animate-in slide-in-from-top-1 duration-150">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-400 italic">No FAQ items matched your query.</p>
          )}
        </div>

        {/* Support channels banner */}
        <div className="border-t border-slate-150 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-slate-100/50 border border-slate-200/40 rounded-xl p-4 text-left">
            <Mail className="w-5 h-5 text-[#FF6B35] shrink-0" />
            <div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Email Channels</p>
              <p className="text-xs text-slate-500 mt-0.5"><a href="mailto:support@ordio.in" className="hover:underline text-[#FF6B35]">support@ordio.in</a></p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-100/50 border border-slate-200/40 rounded-xl p-4 text-left">
            <Clock className="w-5 h-5 text-[#FF6B35] shrink-0" />
            <div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Business Hours</p>
              <p className="text-xs text-slate-500 mt-0.5">Mon – Sat (10:00 AM – 6:00 PM IST)</p>
            </div>
          </div>
        </div>
      </div>
    </PolicyLayout>
  );
};
