import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../lib/auth';

// SVG ikonlar
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" stroke="#2E3642" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function EmailVerification() {
  const [code, setCode] = useState(['', '', '', '']);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [seconds, setSeconds] = useState(180); // 3 minutes countdown
  const router = useRouter();
  const { verifyEmail, resendVerificationCode } = useAuth();
  
  // Get email and userId from query params
  useEffect(() => {
    if (router.isReady) {
      if (router.query.email) {
        setEmail(router.query.email);
      }
      
      if (router.query.userId) {
        setUserId(router.query.userId);
      }
    }
  }, [router.isReady, router.query]);

  // Theme setting for light mode
  useEffect(() => {
    // Ensure light mode is applied
    if (typeof window !== 'undefined') {
      // Reset dark mode if present
      document.documentElement.classList.remove('dark');
      // Store the light theme preference
      localStorage.setItem('theme', 'light');
    }
  }, []);
  
  // Debugging code state
  useEffect(() => {
    console.log('Code updated:', code.join(''));
  }, [code]);
  
  // Countdown timer for resend code
  useEffect(() => {
    const timer = seconds > 0 && setInterval(() => setSeconds(seconds - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  // Bir sonraki input alanına geçmek için
  const handleCodeChange = (index, value) => {
    setCodeError(false); // Clear any previous error
    
    if (value.length > 1) {
      // Handle paste (multiple digits)
      const digits = value.split('').slice(0, 4);
      const newCode = [...code];
      
      digits.forEach((digit, i) => {
        if (index + i < 4) {
          newCode[index + i] = digit;
        }
      });
      
      setCode(newCode);
      
      // Auto focus next input after paste
      const nextEmptyIndex = newCode.findIndex(c => !c);
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 4) {
        setTimeout(() => {
          const nextInput = document.getElementById(`code-${nextEmptyIndex}`);
          if (nextInput) {
            nextInput.focus();
            setActiveInput(nextEmptyIndex);
          }
        }, 10);
      }
    } else {
      // Handle single digit input
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      
      // Auto focus next input
      if (value && index < 3) {
        setTimeout(() => {
          const nextInput = document.getElementById(`code-${index + 1}`);
          if (nextInput) {
            nextInput.focus();
            setActiveInput(index + 1);
          }
        }, 10);
      }
    }
  };

  const handleSubmit = async () => {
    // Combine the code digits into a single string
    const fullCode = code.join('');
    
    setIsSubmitting(true);
    setCodeError(false);
    
    try {
      console.log('Submitting verification with:', { userId, code: fullCode });
      
      // Call the actual verification API with userId and code
      // Note: The backend now accepts both 'userId' and 'id' parameters
      const result = await verifyEmail(userId, fullCode);
      
      console.log('Verification result:', result);
      
      if (result && result.success) {
        // If verification is successful, redirect to success page
        router.push('/verification-success');
      } else {
        // If verification fails, show error
        console.error('Verification failed:', result);
        setCodeError(true);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setCodeError(true);
    } finally {
      // Stop loading state
      setIsSubmitting(false);
    }
  };

  const resendCode = async () => {
    // Don't allow resending if countdown is active
    if (seconds > 0) return;
    
    // Reset any error
    setCodeError(false);
    
    try {
      if (!userId) {
        console.error('User ID is missing. Please try again or go back to login.');
        return;
      }
      
      // Call the resendVerificationCode API
      const result = await resendVerificationCode(userId);
      
      if (result.success) {
        // Clear the code fields
        setCode(['', '', '', '']);
        
        // Reset the countdown timer to 3 minutes
        setSeconds(180);
        
        // Focus on first input after clearing
        setTimeout(() => {
          const firstInput = document.getElementById('code-0');
          if (firstInput) firstInput.focus();
        }, 100);
      } else {
        console.error(result.message || 'Failed to resend verification code. Please try again.');
      }
    } catch (error) {
      console.error('Error resending code:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Verify Your Email - DepositShield</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#4F46E5" />
      </Head>
      
      <div 
        className="relative min-h-screen w-full font-['Nunito'] bg-[#FBF5DA]" 
        style={{ maxWidth: '100%', margin: '0 auto' }}
      >
        {/* Safe area for status bar */}
        <div className="h-10 w-full"></div>
        
        {/* Header */}
        <div className="w-full h-[65px] flex items-center justify-center p-5 bg-[#FBF5DA]">
          <h1 className="font-semibold text-[18px] text-center text-[#0B1420]">
            Verify Your Email
          </h1>
        </div>
        
        {/* Content Frame */}
        <div className="flex flex-col items-center p-6 gap-6 mt-4">
          {/* Email envelope image */}
          <div className="relative h-[180px] w-[180px] flex items-center justify-center">
            <div className="absolute w-[180px] h-[180px] bg-white rounded-full shadow-sm overflow-hidden">
              <img 
                src="/images/email-verification.png" 
                alt="Email verification" 
                className="absolute w[200px] h[100px] left[15px] top-[0px] transform rotate-[0deg]"
              />            
            </div>
          </div>
          
          {/* Text Frame */}
          <div className="flex flex-col items-center gap-3 max-w-[320px]">
            <h2 className="font-bold text-[18px] text-center text-[#0B1420] whitespace-nowrap">
              Let's confirm it's you
            </h2>
            <div className="font-semibold text-[13px] text-center text-[#515964]">
              <p className="mb-1">Enter the 4-digit code we sent to:</p>
              <p className="font-semibold">{email}</p>
            </div>
          </div>
          
          {/* Verification code inputs */}
          <div className="flex flex-col items-center w-full mt-4">
            <div className="flex flex-col items-center w-full">
              <div className="flex justify-center gap-4 w-full">
                {[0, 1, 2, 3].map((index) => (
                  <div 
                    key={index} 
                    className={`box-border w-[60px] h-[56px] bg-white border rounded-[16px] relative transition-colors duration-200 ${
                      activeInput === index ? 'border-[#55A363] bg-[#F6FEF7]' : 'border-[#D1E7D5]'
                    }`}
                  >
                    {code[index] && (
                      <span className="absolute w-full text-center top-[16px] font-bold text-[14px] text-[#0B1420]">
                        {code[index]}
                      </span>
                    )}
                    <input
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={code[index]}
                      onChange={(e) => handleCodeChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                      onFocus={() => setActiveInput(index)}
                      onBlur={() => setActiveInput(null)}
                      className={`w-full h-full text-center text-[14px] font-bold bg-transparent outline-none ${
                        code[index] ? 'text-[#0B1420] opacity-0' : 'text-[#0B1420]'
                      }`}
                      style={{
                        backgroundColor: 'transparent',
                        borderColor: activeInput === index ? '#55A363' : '#D1E7D5',
                        borderRadius: '16px',
                        border: activeInput === index ? '1px solid #55A363' : '1px solid #D1E7D5'
                      }}
                      autoFocus={index === 0 && !code[0]}
                    />
                  </div>
                ))}
              </div>
              {codeError && (
                <p className="font-bold text-[14px] text-center text-[#E95858] mt-4">
                  Hmm, that code isn't right.
                </p>
              )}
            </div>
          </div>
          
          {/* Resend code text */}
          <button 
            className="w-full py-2 font-normal text-[14px] text-center text-[#1C2C40] mt-2"
            onClick={resendCode}
            disabled={seconds > 0}
          >
            Didn't get the code? <span className={`font-semibold ${seconds > 0 ? 'text-[#8A9099]' : 'text-[#4D935A]'}`}>
              {seconds > 0 ? `Resend in ${seconds}s` : 'Resend it'}
            </span>
          </button>
          
        </div>
        
        {/* Bottom section with confirm button */}
        <div className="w-full flex justify-center fixed bottom-8">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || code.some(digit => digit === '')}
            className="w-[90%] max-w-[350px] h-[56px] flex justify-center items-center py-4 bg-[#1C2C40] rounded-[16px] disabled:opacity-50"
          >
            <span className="font-bold text-[16px] text-[#D1E7E2]">
              {isSubmitting ? "Processing..." : "Confirm"}
            </span>
          </button>
        </div>
        
        {/* Bottom Spacing */}
        <div className="pb-[50px]"></div>
      </div>
    </>
  );
}
