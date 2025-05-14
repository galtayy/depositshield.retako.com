import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import CookieBanner from '../../components/CookieBanner';
import { apiService } from '../../lib/api';
import { IS_DEVELOPMENT, ENABLE_DEMO_MODE, isDemoAccount, debugLog } from '../../lib/env-config';

// SVG icons
const SmsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.1667 17.0833H5.83333C3.33333 17.0833 1.66667 15.8333 1.66667 12.9167V7.08333C1.66667 4.16667 3.33333 2.91667 5.83333 2.91667H14.1667C16.6667 2.91667 18.3333 4.16667 18.3333 7.08333V12.9167C18.3333 15.8333 16.6667 17.0833 14.1667 17.0833Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M14.1667 7.5L10.5833 10.5C9.79167 11.1 8.20833 11.1 7.41667 10.5L3.83333 7.5" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" stroke="#2E3642" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function PasswordReset() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const router = useRouter();

  // Theme and background setting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Reset dark mode if present
      document.documentElement.classList.remove('dark');
      // Store the light theme preference
      localStorage.setItem('theme', 'light');
      
      // Apply background color to both html and body elements
      document.documentElement.style.backgroundColor = '#FBF5DA';
      document.documentElement.style.minHeight = '100%';
      document.body.style.backgroundColor = '#FBF5DA';
      document.body.style.minHeight = '100vh';
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        document.documentElement.style.backgroundColor = '';
        document.body.style.backgroundColor = '';
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!email || !email.trim()) {
      setIsSubmitting(false);
      return;
    }

    // Check if this is a demo account
    if (ENABLE_DEMO_MODE && isDemoAccount(email)) {
      debugLog('Using demo mode for email:', email);
      router.push({
        pathname: '/password-reset/verify',
        query: { email }
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Check if email exists in the database
      debugLog('Checking email:', email);
      
      // Make API call to check email
      const checkEmailResponse = await apiService.auth.checkEmail({ email });
      
      // Debug response
      debugLog('Email check response:', checkEmailResponse.data);
      
      if (!checkEmailResponse.data.exists) {
        if (ENABLE_DEMO_MODE && IS_DEVELOPMENT) {
          debugLog('Email not found, but continuing in development mode');
          
          // Allow to continue in development mode
          router.push({
            pathname: '/password-reset/verify',
            query: { email }
          });
          setIsSubmitting(false);
          return;
        } else {
          setIsSubmitting(false);
          return;
        }
      }
      
      // Email exists, send password reset request
      debugLog('Requesting password reset for:', email);
      
      const response = await apiService.auth.requestPasswordReset({ email });
      
      debugLog('Password reset request response:', response.data);
      
      if (response.data.success) {
        router.push({
          pathname: '/password-reset/verify',
          query: { email }
        });
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      
      if (ENABLE_DEMO_MODE && IS_DEVELOPMENT) {
        debugLog('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        // In development mode, continue despite errors
        router.push({
          pathname: '/password-reset/verify',
          query: { email }
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password - DepositShield</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="description" content="Reset your DepositShield account password" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="stylesheet" href="/styles/modern/theme.css" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          body, html {
            background-color: #FBF5DA;
            min-height: 100vh;
            margin: 0;
            padding: 0;
          }
        `}</style>
      </Head>
      <div className="fixed inset-0 bg-[#FBF5DA]"></div>
      <div 
        className="relative w-full min-h-screen font-['Nunito'] overflow-hidden bg-[#FBF5DA]"
        style={{ maxWidth: '100%', margin: '0 auto' }}
      >
        {/* Status Bar Space */}
        <div className="h-10 w-full"></div>
        
        {/* Header */}
        <div className="absolute w-full h-[65px] left-0 top-[40px] flex flex-col items-start gap-[10px]">
          <div className="flex flex-row justify-center items-center w-full h-[65px] px-[10px] py-[20px] gap-[10px]">
            <Link href="/login" className="absolute left-[20px] top-1/2 -translate-y-1/2">
              <ArrowLeftIcon />
            </Link>
            <h1 className="w-full font-semibold text-[18px] leading-[25px] text-center text-[#0B1420]">
              Password Reset
            </h1>
          </div>
        </div>
        
        {/* Title + Subtext */}
        <div className="absolute w-[90%] max-w-[350px] left-[5%] top-[121px] flex flex-col items-start gap-[24px]">
          <p className="w-full font-bold text-[15px] leading-[22px] text-[#0B1420]">
            Enter the email linked to your account — we'll send you a reset link right away.
          </p>
        </div>

        <form id="resetPasswordForm" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="box-border absolute w-[90%] max-w-[350px] h-[56px] left-[5%] top-[180px] flex flex-row items-center px-[20px] py-[18px] gap-[8px] bg-white border border-[#D1E7D5] rounded-[16px]">
            <SmsIcon />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="Email"
              className="flex-1 outline-none bg-transparent text-[#515964] font-bold text-[14px] leading-[19px]"
            />
          </div>
        </form>
        
        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-[90%] max-w-[350px] h-14 flex justify-center items-center mx-auto mt-6 py-[18px] bg-[#1C2C40] rounded-2xl absolute bottom-[40px] left-[5%]"
        >
          <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
            {isSubmitting ? "Processing..." : "Send Code"}
          </span>
        </button>
        
        
        {/* Bottom Spacing */}
        <div className="pb-[50px]"></div>
      </div>
      <CookieBanner />
    </>
  );
}