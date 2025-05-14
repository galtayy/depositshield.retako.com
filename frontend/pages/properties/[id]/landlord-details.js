import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../../lib/auth';
import { apiService } from '../../../lib/api';

// Email icon component
const EmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.1667 17.0833H5.83333C3.33334 17.0833 1.66667 15.8333 1.66667 12.9167V7.08333C1.66667 4.16667 3.33334 2.91667 5.83333 2.91667H14.1667C16.6667 2.91667 18.3333 4.16667 18.3333 7.08333V12.9167C18.3333 15.8333 16.6667 17.0833 14.1667 17.0833Z" stroke="#515964" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M14.1667 7.5L10.5833 10.5C9.79167 11.1 8.20834 11.1 7.41667 10.5L3.83334 7.5" stroke="#515964" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

// Phone icon component
const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.3083 15.2748C18.3083 15.5748 18.2417 15.8832 18.1 16.1832C17.9583 16.4832 17.775 16.7665 17.5333 17.0332C17.1417 17.4832 16.7083 17.8082 16.225 18.0165C15.75 18.2248 15.2333 18.3332 14.675 18.3332C13.8583 18.3332 12.9833 18.1332 12.0583 17.7248C11.1333 17.3165 10.2083 16.7665 9.29166 16.0748C8.36666 15.3748 7.48333 14.5998 6.64166 13.7498C5.80833 12.8915 5.03333 11.9998 4.33333 11.0748C3.64166 10.1498 3.09166 9.2248 2.69166 8.3082C2.29166 7.3832 2.09166 6.5082 2.09166 5.6748C2.09166 5.1332 2.19166 4.6165 2.39166 4.1415C2.59166 3.6582 2.90833 3.2165 3.35 2.8165C3.88333 2.2998 4.46666 2.0415 5.08333 2.0415C5.31666 2.0415 5.55 2.0832 5.76666 2.1665C5.99166 2.2498 6.19166 2.3748 6.35833 2.5582L8.14166 5.0332C8.30833 5.2665 8.43333 5.4832 8.51666 5.6915C8.60833 5.8915 8.65833 6.0915 8.65833 6.2748C8.65833 6.5082 8.59166 6.7415 8.45833 6.9665C8.33333 7.1915 8.15 7.4248 7.91666 7.6582L7.38333 8.2165C7.275 8.3248 7.225 8.4582 7.225 8.6248C7.225 8.7082 7.23333 8.7832 7.25 8.8582C7.275 8.9332 7.3 8.9915 7.31666 9.0498C7.45 9.3082 7.68333 9.6498 8.01666 10.0748C8.35833 10.4998 8.725 10.9332 9.125 11.3748C9.575 11.8165 10 12.1915 10.4333 12.5332C10.8583 12.8665 11.2 13.0915 11.4667 13.2248C11.5167 13.2415 11.575 13.2665 11.6417 13.2915C11.7167 13.3165 11.7917 13.3248 11.875 13.3248C12.05 13.3248 12.1833 13.2665 12.2917 13.1582L12.825 12.6332C13.0667 12.3915 13.3 12.2082 13.525 12.0915C13.75 11.9582 13.975 11.8915 14.2167 11.8915C14.4 11.8915 14.5917 11.9332 14.8 12.0248C15.0083 12.1165 15.225 12.2415 15.4583 12.3998L17.9583 14.2082C18.1417 14.3748 18.2667 14.5665 18.3417 14.7915C18.4083 15.0165 18.3083 15.1415 18.3083 15.2748Z" stroke="#515964" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

// Back arrow icon
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" 
      stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function LandlordDetails() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id, propertyId } = router.query;
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Format phone number to US format: (123) 456-7890
  const formatPhoneNumber = (value) => {
    if (!value) return value;
    
    // Remove all non-digit characters
    const phoneNumber = value.replace(/[^\d]/g, '');
    
    // Take only first 10 digits
    const phoneNumberLength = phoneNumber.length;
    
    // Return if empty
    if (phoneNumberLength < 1) return '';
    
    // Format the phone number based on length
    if (phoneNumberLength < 4) {
      return `(${phoneNumber}`;
    } else if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };
  
  // Make sure user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/welcome');
    }
  }, [user, authLoading, router]);
  
  // Handle form submission
  const handleSubmit = async () => {
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return;
    }

    // Phone validation - must have 10 digits (US format)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Save landlord details to database via API
      const propertyID = id || propertyId;
      const landlordDetails = {
        email,
        phone
      };

      // Save to database
      await apiService.properties.saveLandlordDetails(propertyID, landlordDetails);

      // Also save to localStorage as backup
      const propertyKey = `property_${propertyID}`;
      localStorage.setItem(`${propertyKey}_landlord`, JSON.stringify({
        ...landlordDetails,
        savedAt: new Date().toISOString()
      }));

      // Navigate to user details page
      router.push({
        pathname: `/properties/${propertyID}/user-details`,
        query: { propertyId: propertyID }
      });
    } catch (error) {
      console.error('Error saving landlord details:', error);
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="relative w-full min-h-screen bg-[#FBF5DA] font-['Nunito'] overflow-x-hidden">
      {/* Meta tags for PWA and mobile compatibility */}
      <Head>
        <title>Landlord Details - DepositShield</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="format-detection" content="telephone=no" />
        <style jsx global>{`
          body {
            background-color: #FBF5DA;
            margin: 0;
            padding: 0;
            font-family: 'Nunito', sans-serif;
            min-height: 100vh;
            width: 100%;
          }
          
          .safe-area-top {
            padding-top: env(safe-area-inset-top, 40px);
          }
          
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom, 20px);
          }
          
          /* iPhone X and newer notch handling */
          @supports (padding: max(0px)) {
            .safe-area-top {
              padding-top: max(env(safe-area-inset-top), 40px);
            }
            .safe-area-bottom {
              padding-bottom: max(env(safe-area-inset-bottom), 20px);
            }
          }
          
          /* Fix for iOS input zoom */
          @media screen and (-webkit-min-device-pixel-ratio: 0) { 
            select,
            textarea,
            input {
              font-size: 16px !important;
            }
          }
          
          /* Fix touch events */
          button, a {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
        `}</style>
      </Head>
      
      {/* Status Bar Space */}
      <div className="w-full h-[40px] safe-area-top"></div>

      {/* Header - Fixed positioning */}
      <div className="fixed w-full h-[65px] left-0 top-[40px] z-10 bg-[#FBF5DA]">
        <div className="flex flex-row justify-center items-center py-[20px] px-[10px] gap-[10px] w-full h-[65px] safe-area-inset-left safe-area-inset-right">
          <button
            className="absolute left-[20px] top-[50%] transform -translate-y-1/2 p-2"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="w-full max-w-[270px] font-semibold text-[18px] leading-[140%] text-center text-[#0B1420]">
            Landlord Details
          </h1>
        </div>
      </div>
      
      {/* Main Content - Start after header */}
      <div className="flex flex-col items-center w-full pt-[105px] px-4 px-safe pb-[100px]">
        <div className="w-full max-w-[350px] mx-auto">
          {/* Title and Subtitle */}
          <div className="flex flex-col gap-[4px] mb-6">
            <h2 className="font-bold text-[16px] leading-[22px] text-[#0B1420]">
              Where should we send your report?
            </h2>
            <p className="font-normal text-[14px] leading-[19px] text-[#515964]">
              We'll send your report directly to your landlord so it's officially on record.
            </p>
          </div>
          
          {/* Email Input */}
          <div className="w-full mb-4">
            <div className="flex flex-row items-center w-full h-[56px] bg-white border border-[#D1E7D5] rounded-[16px] p-[18px_20px] gap-[8px]">
              <EmailIcon />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Landlord's Email Address"
                className="flex-1 font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none"
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Phone Input */}
          <div className="w-full mb-8">
            <div className="flex flex-row items-center w-full h-[56px] bg-white border border-[#D1E7D5] rounded-[16px] p-[18px_20px] gap-[8px]">
              <PhoneIcon />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                placeholder="(123) 456-7890"
                className="flex-1 font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none"
                autoComplete="tel"
                required
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Continue Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 w-full px-5 py-4 bg-[#FBF5DA] pb-safe pt-4 shadow-inner">
        <div className="w-[90%] max-w-[350px] mx-auto">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-[56px] flex flex-row justify-center items-center p-[18px_147px] gap-[10px] bg-[#1C2C40] rounded-[16px] touch-manipulation active:bg-[#283c56] transition-colors mb-4"
          >
            <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
              {isSubmitting ? 'Saving...' : 'Next'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}