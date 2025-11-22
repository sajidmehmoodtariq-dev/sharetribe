'use client';

import { useTheme } from '@/components/ThemeProvider';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function TermsAndConditionsPage() {
  const { theme, getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName } = useTheme();
  const router = useRouter();

  return (
    <>
      {/* Fixed Background */}
      <div 
        className="fixed inset-0 w-full h-full z-0"
        style={getBackgroundStyle()}
      />
      
      {/* Content Container */}
      <div className="relative z-10 min-h-screen">
        <div className="w-full max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.back()}
              className={`flex items-center gap-2 ${getTextClassName()} hover:text-[#00EA72] transition-colors`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <Image
              src={theme === 'dark' ? '/logo-light.png' : '/logo-dark.png'}
              alt="Head Huntd Logo"
              width={50}
              height={50}
              className="object-contain"
              priority
            />
          </div>

          {/* Content Card */}
          <div className={`${getCardClassName()} rounded-3xl p-8 shadow-lg`}>
            <h1 className={`text-3xl font-bold ${getTextClassName()} mb-2`}>Terms and Conditions</h1>
            <p className={`text-sm ${getSubTextClassName()} mb-8`}>Last updated: November 18, 2025</p>

            <div className={`space-y-6 ${getTextClassName()}`}>
              {/* Introduction */}
              <section>
                <h2 className="text-xl font-bold mb-3 text-[#00EA72]">1. Introduction</h2>
                <p className={getSubTextClassName()}>
                  Welcome to Head Huntd. These Terms and Conditions govern your use of our platform and services. 
                  By accessing or using Head Huntd, you agree to be bound by these terms. If you disagree with any 
                  part of these terms, you may not access our service.
                </p>
              </section>

              {/* User Accounts */}
              <section>
                <h2 className="text-xl font-bold mb-3 text-[#00EA72]">2. User Accounts</h2>
                <div className={`space-y-2 ${getSubTextClassName()}`}>
                  <p>When you create an account with us, you must provide accurate and complete information.</p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>You must immediately notify us of any unauthorized use of your account</li>
                    <li>You must be at least 18 years old to use our services</li>
                    <li>One person or entity may maintain only one account</li>
                  </ul>
                </div>
              </section>

              {/* Subscription and Payments */}
              <section>
                <h2 className="text-xl font-bold mb-3 text-[#00EA72]">3. Subscription and Payments</h2>
                <div className={`space-y-2 ${getSubTextClassName()}`}>
                  <p>Our platform offers both free and paid subscription plans:</p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>All fees are in USD and are subject to change with 30 days notice</li>
                    <li>Subscriptions renew automatically unless cancelled before the renewal date</li>
                    <li>Refunds are provided on a case-by-case basis within 14 days of purchase</li>
                    <li>We use Stripe for payment processing and do not store credit card information</li>
                    <li>You can cancel your subscription at any time from your account settings</li>
                  </ul>
                </div>
              </section>

              {/* User Content */}
              <section>
                <h2 className="text-xl font-bold mb-3 text-[#00EA72]">4. User Content</h2>
                <div className={`space-y-2 ${getSubTextClassName()}`}>
                  <p>You retain ownership of content you post, but grant us certain rights:</p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>You grant us a license to use, display, and distribute your content</li>
                    <li>You are responsible for the content you post and its legality</li>
                    <li>We reserve the right to remove content that violates these terms</li>
                    <li>Job postings must be accurate and comply with employment laws</li>
                  </ul>
                </div>
              </section>

              {/* Prohibited Activities */}
              <section>
                <h2 className="text-xl font-bold mb-3 text-[#00EA72]">5. Prohibited Activities</h2>
                <div className={`space-y-2 ${getSubTextClassName()}`}>
                  <p>You agree not to:</p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>Use the service for any illegal purpose</li>
                    <li>Post false, misleading, or discriminatory job listings</li>
                    <li>Harass, abuse, or harm other users</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Scrape or copy content from the platform without permission</li>
                    <li>Impersonate another person or entity</li>
                  </ul>
                </div>
              </section>

              {/* Privacy */}
              <section>
                <h2 className="text-xl font-bold mb-3 text-[#00EA72]">6. Privacy and Data Protection</h2>
                <p className={getSubTextClassName()}>
                  Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect 
                  your personal information. By using our service, you consent to our data practices as described 
                  in our Privacy Policy.
                </p>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-xl font-bold mb-3 text-[#00EA72]">7. Intellectual Property</h2>
                <p className={getSubTextClassName()}>
                  The Head Huntd platform, including its design, features, and content (excluding user-generated 
                  content), is owned by us and protected by copyright, trademark, and other intellectual property laws. 
                  You may not copy, modify, or distribute our platform or content without our written permission.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-xl font-bold mb-3 text-[#00EA72]">8. Limitation of Liability</h2>
                <p className={getSubTextClassName()}>
                  Head Huntd is provided "as is" without warranties of any kind. We are not liable for any damages 
                  arising from your use of the service, including but not limited to direct, indirect, incidental, 
                  or consequential damages. We do not guarantee job placements or hiring outcomes.
                </p>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-xl font-bold mb-3 text-[#00EA72]">9. Termination</h2>
                <p className={getSubTextClassName()}>
                  We reserve the right to suspend or terminate your account at any time, with or without notice, 
                  for violations of these terms or for any other reason. Upon termination, your right to use the 
                  service will immediately cease. You may also terminate your account at any time by contacting us.
                </p>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="text-xl font-bold mb-3 text-[#00EA72]">10. Changes to Terms</h2>
                <p className={getSubTextClassName()}>
                  We reserve the right to modify these terms at any time. We will notify you of significant changes 
                  via email or through the platform. Your continued use of Head Huntd after changes are posted 
                  constitutes your acceptance of the modified terms.
                </p>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-xl font-bold mb-3 text-[#00EA72]">11. Governing Law</h2>
                <p className={getSubTextClassName()}>
                  These terms are governed by and construed in accordance with the laws of the United States. 
                  Any disputes arising from these terms or your use of the service will be resolved in the courts 
                  of [Your Jurisdiction].
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-xl font-bold mb-3 text-[#00EA72]">12. Contact Us</h2>
                <p className={getSubTextClassName()}>
                  If you have any questions about these Terms and Conditions, please contact us at:
                </p>
                <div className={`mt-3 ${getSubTextClassName()}`}>
                  <p>Email: legal@headhuntd.com</p>
                  <p>Address: [Your Business Address]</p>
                </div>
              </section>

              {/* Acceptance */}
              <section className={`mt-8 p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <p className={`text-sm ${getSubTextClassName()} italic`}>
                  By creating an account or using Head Huntd, you acknowledge that you have read, understood, 
                  and agree to be bound by these Terms and Conditions.
                </p>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <button
              onClick={() => router.back()}
              className="px-8 py-3 bg-[#00EA72] hover:bg-[#00D66C] text-black font-bold rounded-xl transition-all"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
