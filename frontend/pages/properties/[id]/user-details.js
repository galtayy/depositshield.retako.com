import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../../lib/auth';
import { apiService } from '../../../lib/api';
import Image from 'next/image';

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

// Person icon component
const PersonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.1 10.6166C10.0167 10.6083 9.91667 10.6083 9.825 10.6166C8.39167 10.5666 7.25 9.39166 7.25 7.94999C7.25 6.48333 8.43333 5.29166 9.91667 5.29166C11.3917 5.29166 12.5833 6.48333 12.5833 7.94999C12.575 9.39166 11.4417 10.5666 10.1 10.6166Z" stroke="#515964" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M9.91634 17.4834C8.40801 17.4834 6.9163 17.0667 5.91634 16.2334C4.09967 14.7584 4.09967 12.3584 5.91634 10.8917C7.9163 9.22508 11.9247 9.22508 13.9247 10.8917C15.7413 12.3667 15.7413 14.7667 13.9247 16.2334C12.9163 17.0667 11.4247 17.4834 9.91634 17.4834Z" stroke="#515964" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

// Back arrow icon
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" 
      stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Add icon component for digital signature
const AddIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5.25" y="11.25" width="13.5" height="1.5" fill="#515964"/>
    <rect x="11.25" y="5.25" width="1.5" height="13.5" fill="#515964"/>
    <rect width="24" height="24" fill="#515964" fillOpacity="0"/>
  </svg>
);

// Info circle icon component
const InfoCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.00002 14.6668C11.6667 14.6668 14.6667 11.6668 14.6667 8.00016C14.6667 4.3335 11.6667 1.3335 8.00002 1.3335C4.33335 1.3335 1.33335 4.3335 1.33335 8.00016C1.33335 11.6668 4.33335 14.6668 8.00002 14.6668Z" stroke="#515964" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 5.3335V8.00016" stroke="#515964" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.99652 10.6665H8.00318" stroke="#515964" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function UserDetails() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id, propertyId } = router.query;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signature, setSignature] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false);
  const signatureCanvasRef = useRef(null);
  
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
    } else if (user) {
      // Pre-fill with user data if available
      setName(user.name || '');
      setEmail(user.email || '');
      
      // Try to load from localStorage
      if (typeof window !== 'undefined') {
        const propertyKey = `property_${id || propertyId}`;
        const savedUserDetails = localStorage.getItem(`${propertyKey}_user`);
        
        if (savedUserDetails) {
          try {
            const details = JSON.parse(savedUserDetails);
            setName(details.name || user.name || '');
            setEmail(details.email || user.email || '');
            setPhone(details.phone || '');
            
            // Check if there's a saved signature
            if (details.hasSignature) {
              const savedSignature = localStorage.getItem(`${propertyKey}_user_signature`);
              if (savedSignature) {
                setSignature({
                  preview: savedSignature
                });
              }
            }
          } catch (e) {
            console.error('Error parsing saved user details:', e);
          }
        }
      }
    }
  }, [user, authLoading, router, id, propertyId]);
  
  // Initialize the signature pad when it's opened
  useEffect(() => {
    if (isSignaturePadOpen && signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set up the canvas for retina displays
      const ratio = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      context.scale(ratio, ratio);
      
      // Set drawing style
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = '#000000';
      
      // Clear canvas
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [isSignaturePadOpen]);
  
  // Handle signature pad touch/mouse events
  const handleSignaturePadEvents = () => {
    if (!signatureCanvasRef.current) return;
    
    const canvas = signatureCanvasRef.current;
    const context = canvas.getContext('2d');
    
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    const draw = (e) => {
      if (!isDrawing) return;
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      if (clientX === undefined || clientY === undefined) return;
      
      const x = (clientX - rect.left) * scaleX / (window.devicePixelRatio || 1);
      const y = (clientY - rect.top) * scaleY / (window.devicePixelRatio || 1);
      
      context.beginPath();
      context.moveTo(lastX, lastY);
      context.lineTo(x, y);
      context.stroke();
      
      lastX = x;
      lastY = y;
    };
    
    const startDrawing = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      if (clientX === undefined || clientY === undefined) return;
      
      lastX = (clientX - rect.left) * scaleX / (window.devicePixelRatio || 1);
      lastY = (clientY - rect.top) * scaleY / (window.devicePixelRatio || 1);
      
      isDrawing = true;
    };
    
    const stopDrawing = () => {
      isDrawing = false;
    };
    
    // Touch events
    canvas.addEventListener('touchstart', startDrawing, { passive: true });
    canvas.addEventListener('touchmove', draw, { passive: true });
    canvas.addEventListener('touchend', stopDrawing);
    
    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Return cleanup function
    return () => {
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  };
  
  // Register events when signature pad is open
  useEffect(() => {
    if (isSignaturePadOpen) {
      const cleanup = handleSignaturePadEvents();
      return cleanup;
    }
  }, [isSignaturePadOpen]);
  
  // Open signature pad
  const openSignaturePad = () => {
    setIsSignaturePadOpen(true);
  };
  
  // Save signature from canvas
  const saveSignature = () => {
    if (!signatureCanvasRef.current) return;
    
    try {
      // Convert canvas to PNG data URL
      const dataUrl = signatureCanvasRef.current.toDataURL('image/png');
      
      setSignature({
        preview: dataUrl
      });
      
      setIsSignaturePadOpen(false);
    } catch (error) {
      console.error('Error saving signature:', error);
    }
  };
  
  // Clear signature canvas
  const clearSignatureCanvas = () => {
    if (!signatureCanvasRef.current) return;
    
    const canvas = signatureCanvasRef.current;
    const context = canvas.getContext('2d');
    
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };
  
  // Cancel signature pad
  const cancelSignaturePad = () => {
    setIsSignaturePadOpen(false);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Simple validations
    if (!name.trim()) {
      return;
    }
    
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
      // Save user details to localStorage
      const propertyID = id || propertyId;
      const userDetails = {
        name,
        email,
        phone,
        hasSignature: !!signature,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`property_${propertyID}_user`, JSON.stringify(userDetails));
      
      // If there's a signature, save it separately
      if (signature) {
        localStorage.setItem(`property_${propertyID}_user_signature`, signature.preview);
      }
      
      // Navigate to summary page
      router.push({
        pathname: `/properties/${propertyID}/summary`,
        query: { propertyId: propertyID }
      });
    } catch (error) {
      console.error('Error saving user details:', error);
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="relative w-full min-h-screen bg-[#FBF5DA] font-['Nunito'] overflow-x-hidden">
      {/* Meta tags for PWA and mobile compatibility */}
      <Head>
        <title>Your Details - DepositShield</title>
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
            Your Details
          </h1>
        </div>
      </div>
      
      {/* Main Content - Start after header */}
      <div className="flex flex-col items-center w-full pt-[105px] px-4 px-safe pb-[100px]">
        <div className="w-full max-w-[350px] mx-auto">
          {/* Title and Subtitle */}
          <div className="flex flex-col gap-[4px] mb-6">
            <h2 className="font-bold text-[16px] leading-[22px] text-[#0B1420]">
              Please enter your contact information
            </h2>
            <p className="font-normal text-[14px] leading-[19px] text-[#515964]">
              We'll include these details on the report for your landlord.
            </p>
          </div>
          
          {/* Name Input */}
          <div className="w-full mb-4">
            <div className="flex flex-row items-center w-full h-[56px] bg-white border border-[#D1E7D5] rounded-[16px] p-[18px_20px] gap-[8px]">
              <PersonIcon />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                className="flex-1 font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none"
                autoComplete="name"
                required
              />
            </div>
          </div>
          
          {/* Email Input */}
          <div className="w-full mb-4">
            <div className="flex flex-row items-center w-full h-[56px] bg-white border border-[#D1E7D5] rounded-[16px] p-[18px_20px] gap-[8px]">
              <EmailIcon />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email Address"
                className="flex-1 font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none"
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Phone Input */}
          <div className="w-full mb-4">
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
          
          {/* Digital Signature Upload/Update */}
          <div className="w-full mb-8">
            {/* Button changes based on whether signature exists */}
            <div className="relative">
              <button
                onClick={openSignaturePad}
                className={`flex flex-row justify-center items-center w-full h-[56px] ${
                  signature
                    ? "bg-[#D1E7D5] border-solid border-[#A5D6A7]"
                    : "bg-white border-dashed border-[#D1E7D5]"
                } border rounded-[16px] p-[16px_20px] gap-[8px] cursor-pointer`}
              >
                <div className="flex flex-row justify-center items-center gap-[4px]">
                  {signature ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.35 8.04C19.61 7.78 19.61 7.36 19.35 7.1L16.9 4.65C16.64 4.39 16.22 4.39 15.96 4.65L13.87 6.74L17.26 10.13L19.35 8.04ZM3 17.25V20.64H6.39L16.77 10.25L13.38 6.86L3 17.25ZM6.17 19.39H4.25V17.47L13.38 8.35L15.3 10.27L6.17 19.39Z" fill="#1C2C40"/>
                    </svg>
                  ) : (
                    <AddIcon />
                  )}
                  <span className={`font-bold text-[14px] leading-[19px] ${
                    signature ? "text-[#1C2C40]" : "text-[#515964]"
                  }`}>
                    {signature ? "Update Signature" : "Add Digital Signature (Optional)"}
                  </span>
                  {!signature && <InfoCircleIcon />}
                </div>
              </button>

              {/* Remove button as icon - positioned absolutely bottom right */}
              {signature && (
                <button
                  onClick={() => setSignature(null)}
                  className="absolute -bottom-2 right-2 bg-red-50 border border-red-200 rounded-full p-1 shadow-sm"
                  title="Remove signature"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 3.98667C11.78 3.76667 9.54667 3.65333 7.32 3.65333C6 3.65333 4.68 3.72 3.36 3.85333L2 3.98667" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.66669 3.31999L5.81335 2.43999C5.92002 1.80666 6.00002 1.33333 7.12669 1.33333H8.87335C10 1.33333 10.0867 1.83999 10.1867 2.44666L10.3334 3.31999" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12.5667 6.09333L12.1334 12.8067C12.06 13.8533 12 14.6667 10.14 14.6667H5.86002C4.00002 14.6667 3.94002 13.8533 3.86668 12.8067L3.43335 6.09333" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.88669 11H9.10669" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.33331 8.33333H9.66665" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Submit Button - Fixed at bottom */}
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
      
      {/* Signature Pad Modal */}
      {isSignaturePadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 touch-none">
          <div className="bg-white w-[90%] max-w-[500px] rounded-xl flex flex-col p-4 touch-none">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="font-bold text-[18px] text-[#0B1420]">Draw Your Signature</h3>
              <button 
                onClick={cancelSignaturePad}
                className="text-[#515964]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="w-full border border-[#D1E7D5] bg-white rounded-lg mb-4 touch-none">
              <canvas 
                ref={signatureCanvasRef}
                className="w-full h-[200px] touch-none"
                style={{ touchAction: 'none' }}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={clearSignatureCanvas}
                className="flex-1 h-[44px] rounded-[12px] bg-[#F1F1F1] text-[#515964] font-bold"
              >
                Clear
              </button>
              <button
                onClick={saveSignature}
                className="flex-1 h-[44px] rounded-[12px] bg-[#1C2C40] text-white font-bold"
              >
                Sign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}