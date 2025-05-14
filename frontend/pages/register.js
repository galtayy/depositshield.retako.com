import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import Head from 'next/head';

// SVG ikonlar
const SmsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.1667 17.0833H5.83333C3.33333 17.0833 1.66667 15.8333 1.66667 12.9167V7.08333C1.66667 4.16667 3.33333 2.91667 5.83333 2.91667H14.1667C16.6667 2.91667 18.3333 4.16667 18.3333 7.08333V12.9167C18.3333 15.8333 16.6667 17.0833 14.1667 17.0833Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M14.1667 7.5L10.5833 10.5C9.79167 11.1 8.20833 11.1 7.41667 10.5L3.83333 7.5" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

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

const CheckboxChecked = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#55A363"/>
    <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckboxUnchecked = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="4" stroke="#55A363" strokeWidth="2" fill="white"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" stroke="#2E3642" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true); // Default to true for existing UI
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  // Password validation function
  const validatePassword = (password) => {
    // Password should be 8-16 characters, include a capital letter, a lowercase letter, and a number
    const hasLength = password.length >= 8 && password.length <= 16;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    return hasLength && hasUppercase && hasLowercase && hasNumber;
  };

  // Check password match
  const validatePasswordMatch = () => {
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords don't match");
      return false;
    } else {
      setConfirmPasswordError('');
      return true;
    }
  };

  // Validate password on change
  useEffect(() => {
    if (password && password.length >= 8) {
      if (!validatePassword(password)) {
        setPasswordError("Oops, your password needs to be 8–16 characters and include a capital letter, a lowercase letter, and a number.");
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }
  }, [password]);

  // Validate password match when confirm password changes
  useEffect(() => {
    if (confirmPassword) {
      validatePasswordMatch();
    } else {
      setConfirmPasswordError('');
    }
  }, [confirmPassword, password]);

  // Theme setting for light mode
  useEffect(() => {
    // Ensure light mode is applied on register page
    if (typeof window !== 'undefined') {
      // Reset dark mode if present
      document.documentElement.classList.remove('dark');
      // Store the light theme preference
      localStorage.setItem('theme', 'light');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check password validity
    if (!validatePassword(password)) {
      return;
    }
    
    // Check password match
    if (!validatePasswordMatch()) {
      return;
    }
    
    if (!termsAccepted) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Backend bekliyor, email'den bir isim oluşturalım
      const autoName = email.split('@')[0];
      const result = await register(autoName, email, password);
      
      if (result && result.success) {
        router.push('/');
      } else if (result && result.needsVerification) {
        // Email doğrulama gerekiyorsa
        router.push({
          pathname: '/email-verification',
          query: { userId: result.userId, email: email }
        });
      } else {
        if (email.endsWith('@example.com') || email.endsWith('@test.com')) {
          // Demo kullanıcı için manuel işlem
          localStorage.setItem('token', 'demo-registration-token');
          router.push('/');
          return;
        }
        console.error(result?.message || 'Registration failed. Please check your information.');
      }
    } catch (error) {
      // Backend çalışmıyorsa ve demo kullanıcı kaydı yapılıyorsa
      if (email.endsWith('@example.com') || email.endsWith('@test.com')) {
        // Demo kullanıcı için manuel işlem
        localStorage.setItem('token', 'demo-registration-token');
        router.push('/');
        return;
      }
      
      // Error mesajını yakalayalım
      const errorMessage = error.response?.data?.message || 'An error occurred during registration.';
      console.error('Register error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - DepositShield</title>
        <link rel="stylesheet" href="/styles/modern/theme.css" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <div 
        className="min-h-screen font-['Nunito'] relative" 
        style={{ backgroundColor: '#FBF5DA' }}
      >
        {/* Status Bar - sadece tasarım amaçlı */}
        <div className="h-10"></div>
        
        {/* Header */}
        <div className="flex flex-row items-center justify-center py-5 px-2.5 relative h-[65px]">
          <Link href="/welcome" className="absolute left-[20px] top-1/2 -translate-y-1/2">
            <ArrowLeftIcon />
          </Link>
          <h1 className="font-semibold text-lg text-center text-[#0B1420]">
            Sign Up
          </h1>
        </div>
        
        <form id="registerForm" className="px-5" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="flex flex-row items-center px-5 py-[18px] gap-2 bg-white border border-[#D1E7D5] rounded-2xl h-14 mt-6">
            <SmsIcon />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="flex-1 outline-none bg-transparent text-[#515964] font-bold text-sm"
            />
          </div>
          
          {/* Password Input */}
          <div className={`flex flex-row items-center px-5 py-[18px] gap-2 bg-white border ${
            passwordError 
              ? 'border-red-500' 
              : password && password.length >= 8 && validatePassword(password) 
                ? 'border-green-500' 
                : 'border-[#D1E7D5]'
          } rounded-2xl h-14 mt-4`}>
            <KeyIcon />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className={`flex-1 outline-none bg-transparent ${
                passwordError 
                  ? 'text-red-500' 
                  : password && password.length >= 8 && validatePassword(password) 
                    ? 'text-green-500' 
                    : 'text-[#515964]'
              } font-bold text-sm`}
              minLength={8}
              maxLength={16}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500"
            >
              {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
            </button>
          </div>
          {passwordError && (
            <div className="mt-1 ml-1 text-xs text-red-500">
              {passwordError}
            </div>
          )}
          
          {/* Confirm Password Input */}
          <div className={`flex flex-row items-center px-5 py-[18px] gap-2 bg-white border ${
            confirmPasswordError 
              ? 'border-red-500' 
              : confirmPassword && password === confirmPassword && validatePassword(password)
                ? 'border-green-500' 
                : 'border-[#D1E7D5]'
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
              placeholder="Confirm your password"
              className={`flex-1 outline-none bg-transparent ${
                confirmPasswordError 
                  ? 'text-red-500' 
                  : confirmPassword && password === confirmPassword && validatePassword(password)
                    ? 'text-green-500' 
                    : 'text-[#515964]'
              } font-bold text-sm`}
              minLength={8}
              maxLength={16}
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-500"
            >
              {showConfirmPassword ? <EyeIcon /> : <EyeSlashIcon />}
            </button>
          </div>
          {confirmPasswordError && (
            <div className="mt-1 ml-1 text-xs text-red-500">
              {confirmPasswordError}
            </div>
          )}
        </form>
        
        {/* Agreement */}
        <div className="flex flex-row gap-3 px-5 mt-8 absolute bottom-[120px] left-0 right-0">
          <button 
            type="button" 
            onClick={() => setTermsAccepted(!termsAccepted)} 
            className="flex-shrink-0 mt-0.5 focus:outline-none"
          >
            {termsAccepted ? <CheckboxChecked /> : <CheckboxUnchecked />}
          </button>
          <p className="text-xs text-[#515964] font-normal" style={{ fontSize: "10.8px" }}>
            I agree to DepositShield's{" "}
            <Link href="/terms">
              <span className="text-[#55A363] font-medium">Terms of Service</span>
            </Link>{" "}
            and{" "}
            <Link href="/privacy">
              <span className="text-[#55A363] font-medium">Privacy Policy</span>
            </Link>, and I'm okay
            receiving occasional account-related texts. Message and data rates may
            apply. Reply STOP to opt out, HELP for help. Message frequency varies.
          </p>
        </div>
        
        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-[90%] max-w-[350px] h-14 flex justify-center items-center mx-auto mt-6 py-[18px] bg-[#1C2C40] rounded-2xl absolute bottom-[40px] left-[5%]"
        >
          <span className="font-bold text-[14.4px] text-[#D1E7E2] whitespace-nowrap overflow-hidden text-center">
            {isSubmitting ? "Processing..." : "Protect My Deposit"}
          </span>
        </button>
        
        {/* Bottom Spacing */}
        <div className="pb-[50px]"></div>
      </div>
    </>
  );
}