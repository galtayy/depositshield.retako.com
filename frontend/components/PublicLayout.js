import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import CookieBanner from './CookieBanner';

export default function PublicLayout({ children }) {

  // Check for saved theme preference or system preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Her zaman açık tema kullan
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  // Icon component
  const Icon = ({ name }) => {
    switch (name) {
      case 'sun':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'moon':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
      case 'shield':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Head>
        <link rel="stylesheet" href="/styles/modern/theme.css" />
      </Head>
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="font-bold text-xl text-primary dark:text-primary-light flex items-center">
              <Icon name="shield" />
              <span className="ml-2">DepositShield</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-background dark:bg-gray-900">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-md-top mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} DepositShield. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-3 md:mt-0">
              <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light text-sm">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light text-sm">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light text-sm">
                Cookie Policy
              </Link>
              <Link href="/login" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light text-sm">
                Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  );
}
