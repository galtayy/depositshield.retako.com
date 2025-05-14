import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import CookieBanner from '../components/CookieBanner';
import dynamic from 'next/dynamic';

// Konfeti bileşenini tarayıcı tarafında (client-side) yükle
const Confetti = dynamic(() => import('react-confetti'), { 
  ssr: false // Sunucu tarafında render edilmesin
});

// SVG ikonlar
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" stroke="#2E3642" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function VerificationSuccess() {
  const router = useRouter();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [confettiActive, setConfettiActive] = useState(true);
  
  // Ekran boyutlarını alma
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });

      const handleResize = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

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

  // Set confetti active when component mounts and stop after 6 seconds
  useEffect(() => {
    // Ensure confetti is active on initial load
    setConfettiActive(true);
    
    const timer = setTimeout(() => {
      setConfettiActive(false);
    }, 6000); // Stop after 6 seconds
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <title>Verify Your Email</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </Head>
      
      {/* Konfeti efekti */}
      {confettiActive && dimensions.width > 0 && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          numberOfPieces={200}
          recycle={false}
          colors={['#55A363', '#1C2C40', '#D1E7D5', '#FBF5DA', '#8B5CF6']}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000 }}
        />
      )}
      
      <div 
        className="flex flex-col items-center w-full min-h-screen font-['Nunito'] bg-[#FBF5DA]"
      >
        {/* Status Bar Space */}
        <div className="h-10 w-full"></div>
        
        {/* Header */}
        <div className="w-full h-[65px] flex justify-center items-center">
          <h1 className="font-semibold text-[18px] leading-[140%] text-center text-[#0B1420]">
            Verify Your Email
          </h1>
        </div>
        
        {/* Content Container */}
        <div className="flex flex-col items-center justify-between flex-grow max-w-[390px] w-full px-5">
          {/* Success image */}
          <div className="w-[180px] h-[180px] mt-10 relative">
            <div className="absolute inset-0 bg-white rounded-full shadow-sm"></div>
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative" style={{ transform: 'scale(1) translateX(6px)' }}>
                  <img 
                    src="/images/verification-success.png" 
                    alt="Success" 
                    className="w-[190px] h-[190px]"
                    style={{ 
                      objectFit: 'contain',
                      objectPosition: '40% center',
                    }}
                    onError={(e) => {
                      // Fallback if image doesn't load
                      e.target.style.display = 'none';
                      document.getElementById('success-fallback').style.display = 'flex';
                    }}
                  />
                </div>
              </div>
              <div id="success-fallback" className="absolute inset-0 flex items-center justify-center bg-[#F1F8F2]" style={{display: 'none'}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color: '#55A363'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Text content */}
          <div className="flex flex-col items-center gap-2 mt-10 max-w-[296px]">
            <h2 className="font-bold text-[18px] leading-[25px] text-center text-[#0B1420]">
              You're all set!
            </h2>
            <p className="font-semibold text-[14px] leading-[19px] text-center text-[#515964]">
              We’ve verified your email,
              <br />
              let’s protect that deposit.
            </p>
          </div>
          
          {/* Spacer */}
          <div className="flex-grow"></div>
          
          {/* Spacer for button positioning */}
          <div className="h-20"></div>
        </div>
        
        {/* Start button - positioned near bottom */}
        <div className="w-full flex justify-center px-5 fixed bottom-8 z-10 pb-safe">
          <Link href="/" className="w-full max-w-[350px]">
            <button className="w-full h-[56px] flex justify-center items-center bg-[#1C2C40] rounded-[16px] shadow-md">
              <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
                Start
              </span>
            </button>
          </Link>
        </div>
        
        {/* Extra bottom spacing to compensate for fixed button */}
        <div className="h-32"></div>
        
        <CookieBanner />
      </div>
    </>
  );
}