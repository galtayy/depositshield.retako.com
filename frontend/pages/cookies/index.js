import { useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import PublicLayout from '../../components/PublicLayout';

export default function CookiePolicy() {
  return (
    <PublicLayout>
      <Head>
        <title>Cookie Policy - DepositShield</title>
      </Head>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 prose max-w-none">
          <p className="text-gray-500 mb-4">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">1. What are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently, as well as to provide information to the owners of the site. Cookies allow us to recognize your device and store information about your preferences or past actions.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">2. How We Use Cookies</h2>
          <p>
            We use cookies for several purposes including:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly and cannot be disabled in our systems.</li>
            <li><strong>Performance Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.</li>
            <li><strong>Functionality Cookies:</strong> These cookies enable the website to provide enhanced functionality and personalization, such as remembering your preferences.</li>
            <li><strong>Targeting Cookies:</strong> These cookies may be set through our site by our advertising partners to build a profile of your interests.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">3. Types of Cookies We Use</h2>
          
          <h3 className="text-lg font-medium mt-4 mb-2">3.1 Essential Cookies</h3>
          <p>
            These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver the website, you cannot refuse them without impacting how our website functions.
          </p>
          <table className="min-w-full border-collapse border border-gray-300 mt-2 mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Cookie Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">session</td>
                <td className="border border-gray-300 px-4 py-2">Used to maintain session state</td>
                <td className="border border-gray-300 px-4 py-2">Session</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">auth_token</td>
                <td className="border border-gray-300 px-4 py-2">Used for authentication</td>
                <td className="border border-gray-300 px-4 py-2">30 days</td>
              </tr>
            </tbody>
          </table>
          
          <h3 className="text-lg font-medium mt-4 mb-2">3.2 Performance Cookies</h3>
          <p>
            These cookies collect information about how visitors use a website, for instance which pages visitors go to most often, and if they get error messages from web pages. All information these cookies collect is aggregated and therefore anonymous.
          </p>
          <table className="min-w-full border-collapse border border-gray-300 mt-2 mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Cookie Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">_ga</td>
                <td className="border border-gray-300 px-4 py-2">Used to distinguish users</td>
                <td className="border border-gray-300 px-4 py-2">2 years</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">_gid</td>
                <td className="border border-gray-300 px-4 py-2">Used to distinguish users</td>
                <td className="border border-gray-300 px-4 py-2">24 hours</td>
              </tr>
            </tbody>
          </table>
          
          <h3 className="text-lg font-medium mt-4 mb-2">3.3 Functionality Cookies</h3>
          <p>
            These cookies allow the website to remember choices you make (such as your username, language or the region you are in) and provide enhanced, more personal features.
          </p>
          <table className="min-w-full border-collapse border border-gray-300 mt-2 mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Cookie Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">theme</td>
                <td className="border border-gray-300 px-4 py-2">Stores user's theme preference</td>
                <td className="border border-gray-300 px-4 py-2">1 year</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">language</td>
                <td className="border border-gray-300 px-4 py-2">Stores user's language preference</td>
                <td className="border border-gray-300 px-4 py-2">1 year</td>
              </tr>
            </tbody>
          </table>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">4. How to Manage Cookies</h2>
          <p>
            Most web browsers allow you to manage your cookie preferences. You can set your browser to refuse cookies or delete certain cookies. Generally, you can also set your browser to notify you when you receive a cookie so that you can choose to accept it or not.
          </p>
          <p>
            You can manage your cookies settings by accessing the "Preferences" or "Settings" section of your browser. The following links provide specific information for common browsers:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Microsoft Edge</a></li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">5. Changes to This Cookie Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in technology, regulations, or our business practices. Any changes will be posted on this page, and if the changes are significant, we will provide a more prominent notice.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">6. Contact Us</h2>
          <p>
            If you have any questions about our Cookie Policy, please contact us at cookies@depositshield.retako.com.
          </p>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p>For more information about our privacy practices, please review our <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.</p>
          </div>
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
