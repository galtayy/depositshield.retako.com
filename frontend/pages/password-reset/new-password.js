import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import CookieBanner from '../../components/CookieBanner';
import { apiService } from '../../lib/api';
import { ENABLE_DEMO_MODE, isDemoAccount, debugLog } from '../../lib/env-config';

// SVG icons
const KeyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.4916 12.4416C14.7749 14.1499 12.3166 14.6749 10.1583 14.0083L6.2333 17.9166C5.9499 18.2083 5.3916 18.3833 4.9916 18.3249L3.1749 18.0749C2.5749 17.9916 2.0166 17.4249 1.9249 16.8249L1.6749 15.0083C1.6166 14.6083 1.8083 14.0499 2.0833 13.7666L6.0083 9.8499C5.3333 7.6833 5.8499 5.2249 7.5666 3.5166C10.0249 1.0583 14.0166 1.0583 16.4833 3.5166C18.9499 5.9749 18.9499 9.9833 16.4916 12.4416Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M5.74167 14.575L7.65833 16.4917" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.083 9.16675C12.7734 9.16675 13.333 8.60722 13.333 7.91675C13.333 7.22627 12.7734 6.66675 12.083 6.66675C11.3925 6.66675 10.833 7.22627 10.833 7.91675C10.833 8.60722 11.3925 9.16675 12.083 9.16675Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EyeSlashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.1083 7.8917L7.8917 12.1083C7.35003 11.5667 7.01669 10.825 7.01669 10C7.01669 8.35 8.35003 7.01667 10 7.01667C10.825 7.01667 11.5667 7.35 12.1083 7.8917Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.85 4.80834C13.3917 3.70834 11.725 3.10834 10 3.10834C7.05833 3.10834 4.31667 4.84167 2.40833 7.84167C1.65833 9.01667 1.65833 10.9917 2.40833 12.1667C3.06667 13.2 3.83333 14.0917 4.66667 14.8083" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.01669 16.275C7.96669 16.675 8.97503 16.8917 10 16.8917C12.9417 16.8917 15.6833 15.1583 17.5917 12.1583C18.3417 10.9833 18.3417 9.00833 17.5917 7.83333C17.3167 7.33333 17.0167 6.85833 16.7083 6.425" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.925 10.5833C12.7083 11.7583 11.75 12.7167 10.575 12.9333" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.89166 12.1083L1.66666 18.3333" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.3333 1.66667L12.1083 7.89167" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.9833 10.0001C12.9833 11.6501 11.65 12.9834 10 12.9834C8.35 12.9834 7.01666 11.6501 7.01666 10.0001C7.01666 8.35008 8.35 7.01675 10 7.01675C11.65 7.01675 12.9833 8.35008 12.9833 10.0001Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 16.8917C12.9417 16.8917 15.6833 15.1584 17.5917 12.1584C18.3417 10.9834 18.3417 9.00838 17.5917 7.83338C15.6833 4.83338 12.9417 3.10005 10 3.10005C7.05833 3.10005 4.31667 4.83338 2.40833 7.83338C1.65833 9.00838 1.65833 10.9834 2.40833 12.1584C4.31667 15.1584 7.05833 16.8917 10 16.8917Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" stroke="#2E3642" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function NewPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
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

  // Get token and email from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = sessionStorage.getItem('resetToken');
      const storedEmail = sessionStorage.getItem('resetEmail');
      
      if (storedToken && storedEmail) {
        setToken(storedToken);
        setEmail(storedEmail);
      } else {
        // Redirect to first step if email or token is missing
        router.push('/password-reset');
      }
    }
  }, [router]);

  // Password validation
  const validatePassword = (password) => {
    const minLength = 8;
    const maxLength = 16;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    return {
      isValid: password.length >= minLength && password.length <= maxLength && hasUppercase && hasLowercase && hasNumber,
      minLength: password.length >= minLength,
      maxLength: password.length <= maxLength,
      lengthValid: password.length >= minLength && password.length <= maxLength,
      hasUppercase,
      hasLowercase,
      hasNumber
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Şifreleri kontrol et
    if (password !== confirmPassword) {
      return;
    }
    
    const validation = validatePassword(password);
    if (!validation.isValid) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Şifre sıfırlama isteği gönder
      const response = await apiService.auth.resetPassword({ 
        email, 
        token,
        newPassword: password 
      });
      
      if (response.data.success) {
        // Clear sessionStorage when done
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('resetToken');
          sessionStorage.removeItem('resetEmail');
        }
        
        router.push('/login');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      
      // Special handling for demo accounts
      if (ENABLE_DEMO_MODE && isDemoAccount(email)) {
        debugLog('Handling demo account password reset:', email);
        
        // Clear sessionStorage when done
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('resetToken');
          sessionStorage.removeItem('resetEmail');
        }
        
        router.push('/login');
        return;
      }
      
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          router.push('/password-reset');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordValidation = validatePassword(password);
  const allRequirementsMet = passwordValidation.isValid;
  const passwordsMatch = password === confirmPassword && password !== '';

  return (
    <>
      <Head>
        <title>New Password - DepositShield</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="description" content="Set a new password for your DepositShield account" />
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
      
      <div 
        className="min-h-screen font-['Nunito'] relative w-full bg-[#FBF5DA]" 
        style={{ maxWidth: '100%', margin: '0 auto' }}
      >
        {/* Status Bar - sadece tasarım amaçlı */}
        <div className="h-10"></div>
        
        {/* Header */}
        <div className="flex flex-row items-center justify-center py-5 px-2.5 relative h-[65px]">
          <Link href="/password-reset/verify" 
            className="absolute left-[20px] top-1/2 -translate-y-1/2"
            onClick={() => {
              // When navigating back, keep the email but remove the token
              if (typeof window !== 'undefined') {
                sessionStorage.removeItem('resetToken');
              }
            }}
          >
            <ArrowLeftIcon />
          </Link>
          <h1 className="font-semibold text-lg text-center text-[#0B1420]">
            Reset Your Password
          </h1>
        </div>
        
        <form id="newPasswordForm" className="px-5" onSubmit={handleSubmit}>
          
          {/* Password Input */}
          <div className={`flex flex-row items-center px-5 py-[18px] gap-2 bg-white border ${
            !password 
              ? 'border-[#D1E7D5]' 
              : !passwordValidation.isValid
                ? 'border-[#E95858]' 
                : 'border-[#55A363]'
          } rounded-2xl h-14 mt-6`}>
            <KeyIcon />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a new password"
              className={`flex-1 outline-none bg-transparent ${
                !password 
                  ? 'text-[#515964]' 
                  : !passwordValidation.isValid
                    ? 'text-[#E95858]' 
                    : 'text-[#55A363]'
              } font-bold text-sm`}
              minLength={8}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500"
            >
              {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
            </button>
          </div>
          
          {/* Confirm Password Input */}
          <div className={`flex flex-row items-center px-5 py-[18px] gap-2 bg-white border ${
            !confirmPassword 
              ? 'border-[#D1E7D5]' 
              : !passwordsMatch
                ? 'border-[#E95858]' 
                : 'border-[#55A363]'
          } rounded-2xl h-14 mt-4`}>
            <KeyIcon />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className={`flex-1 outline-none bg-transparent ${
                !confirmPassword
                  ? 'text-[#515964]' 
                  : !passwordsMatch
                    ? 'text-[#E95858]' 
                    : 'text-[#55A363]'
              } font-bold text-sm`}
              minLength={8}
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-500"
            >
              {showConfirmPassword ? <EyeIcon /> : <EyeSlashIcon />}
            </button>
          </div>
          
          {/* Password Error Message */}
          {(password || confirmPassword) && !passwordValidation.isValid && (
            <div className="mt-4 p-3 bg-[#FEEEEE] rounded-lg border border-[#F6C6C6]">
              <p className="text-[#E95858] text-sm font-medium">
                Oops, your password needs to be 8–16 characters and include a capital letter, a lowercase letter, and a number.
              </p>
            </div>
          )}
          
          {/* Passwords don't match error */}
          {confirmPassword && !passwordsMatch && (
            <div className="mt-2 p-3 bg-[#FEEEEE] rounded-lg border border-[#F6C6C6]">
              <p className="text-[#E95858] text-sm font-medium">
                Passwords don't match. Please try again.
              </p>
            </div>
          )}
          
        </form>
        
        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !allRequirementsMet || !passwordsMatch}
          className={`w-[90%] max-w-[350px] h-14 flex justify-center items-center mx-auto mt-6 py-[18px] rounded-2xl fixed bottom-8 left-[5%] ${
            allRequirementsMet && passwordsMatch
              ? 'bg-[#1C2C40] cursor-pointer'
              : 'bg-[#8A9099] cursor-not-allowed'
          }`}
        >
          <span className="font-bold text-[16px] text-[#D1E7E2]">
            {isSubmitting ? "Processing..." : "Save"}
          </span>
        </button>
        
        {/* Bottom Spacing */}
        <div className="pb-[50px]"></div>
      </div>
      <CookieBanner />
    </>
  );
}