import { useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import PublicLayout from '../../components/PublicLayout';

export default function TermsOfService() {
  return (
    <PublicLayout>
      <Head>
        <title>Terms of Service - DepositShield</title>
      </Head>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 prose max-w-none">
          <p className="text-gray-500 mb-4">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing and using DepositShield's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">2. Description of Service</h2>
          <p>
            DepositShield provides a platform for property owners and tenants to document, manage, and share property condition reports. Our service allows users to create detailed reports with photos, share them with relevant parties, and track property conditions over time.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">3. User Registration</h2>
          <p>
            To use certain features of DepositShield, you must register for an account. You agree to provide accurate and complete information during the registration process and to update such information to keep it accurate and current.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">4. Account Security</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">5. User Content</h2>
          <p>
            Our service allows you to upload, store, and share content including photos, descriptions, and property information. You retain all rights to your content, but grant DepositShield a license to use, reproduce, and display such content solely for the purpose of providing our services.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">6. Privacy</h2>
          <p>
            Your use of DepositShield is also governed by our Privacy Policy, which can be found <Link href="/privacy" className="text-indigo-600 hover:underline">here</Link>.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">7. Prohibited Uses</h2>
          <p>
            You agree not to use DepositShield for any unlawful purpose or in any way that could damage, disable, overburden, or impair our service. You must not attempt to gain unauthorized access to any part of the service, other accounts, or computer systems or networks connected to our service.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">8. Limitation of Liability</h2>
          <p>
            DepositShield and its affiliates, officers, employees, agents, partners, and licensors shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of, or inability to access or use, the service.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Your continued use of the service after such changes constitutes your acceptance of the new terms.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">10. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. Upon termination, your right to use the service will immediately cease.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">11. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which DepositShield operates, without regard to its conflict of law provisions.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">12. Contact</h2>
          <p>
            For questions about these Terms, please contact us at support@depositshield.retako.com.
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
