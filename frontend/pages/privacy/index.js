import { useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import PublicLayout from '../../components/PublicLayout';

export default function PrivacyPolicy() {
  return (
    <PublicLayout>
      <Head>
        <title>Privacy Policy - DepositShield</title>
      </Head>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 prose max-w-none">
          <p className="text-gray-500 mb-4">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">1. Introduction</h2>
          <p>
            At DepositShield, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our website and services.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">2. Information We Collect</h2>
          <p>
            We collect information that you directly provide to us, including:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Personal information such as name, email address, and phone number</li>
            <li>Property information including addresses and property details</li>
            <li>Account credentials</li>
            <li>Photos and descriptions you upload to document property conditions</li>
            <li>Communications between users related to property reports</li>
          </ul>
          <p>
            We also automatically collect certain information when you use our service, including:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Device information</li>
            <li>Log information</li>
            <li>Usage information</li>
            <li>Cookies and similar technologies</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">3. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Process and complete transactions</li>
            <li>Send you technical notices, updates, security alerts, and support messages</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Communicate with you about products, services, offers, and events</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
            <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
            <li>Personalize and improve the services</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">4. Sharing Your Information</h2>
          <p>
            We may share your information with:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Other users as necessary to fulfill the service (e.g., sharing property reports between landlords and tenants)</li>
            <li>Service providers who perform services on our behalf</li>
            <li>Professional advisors, such as lawyers, auditors, and insurers</li>
            <li>Government authorities when required by law</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">6. Your Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Access to your personal information</li>
            <li>Correction of inaccurate or incomplete information</li>
            <li>Deletion of your personal information</li>
            <li>Restriction of processing of your personal information</li>
            <li>Data portability</li>
            <li>Objection to processing of your personal information</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">7. Cookies</h2>
          <p>
            We use cookies and similar technologies to collect information about your browsing activities and to distinguish you from other users of our website. This helps us provide you with a good experience when you browse our website and allows us to improve our site.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">8. Children's Privacy</h2>
          <p>
            Our services are not intended for children under 18 years of age, and we do not knowingly collect personal information from children under 18.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">9. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and, if the changes are significant, we will provide a more prominent notice.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at privacy@depositshield.retako.com.
          </p>
        </div>
        
        <div className="mt-8 flex justify-center">
          <Link href="/" className="btn btn-primary">
            Return to Home
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
