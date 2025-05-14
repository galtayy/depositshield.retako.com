import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import CookieBanner from '../../components/CookieBanner';

// SVG icons
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" stroke="#2E3642" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function OnboardingStep2() {
  const router = useRouter();
  
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

  // Set background color using useEffect to ensure it works properly
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = '#D1E7D5';
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.backgroundColor = '';
      }
    };
  }, []);

  return (
    <>
      <Head>
        <style>{`
          body, html {
            background-color: #D1E7D5;
            min-height: 100vh;
            margin: 0;
            padding: 0;
          }
        `}</style>
        <title>The Law's On Your Side</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#D1E7D5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="description" content="Learn about rental laws with DepositShield" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </Head>
      
      <div 
        className="relative w-full min-h-screen font-['Nunito'] bg-[#D1E7D5]"
        style={{ maxWidth: '390px', margin: '0 auto' }}
      >
        {/* Status Bar Space */}
        <div className="h-10 w-full"></div>
        
        {/* Header - hidden for second page */}
        <div className="w-full flex items-center justify-center px-4 h-[65px]">
          <button 
            onClick={() => router.back()}
            className="absolute left-4 w-10 h-10 flex items-center justify-center"
            style={{ display: 'none' }}
          >
            <ArrowLeftIcon />
          </button>
          <div className="flex-grow flex justify-center">
            <h1 className="font-semibold text-[18px] leading-[140%] text-center text-[#0B1420]" style={{ display: 'none' }}>
              Getting Started (2/5)
            </h1>
          </div>
        </div>
        
        {/* Main illustration */}
        <div className="absolute top-[105px] left-0 right-0">
          <img 
            src="/images/onboarding2.png" 
            alt="Legal Protection" 
            className="w-full object-contain"
            style={{ maxHeight: '360px' }}
          />
        </div>
        
        {/* Text content */}
        <div className="absolute w-[300px] flex flex-col items-center gap-2 top-[503px] left-1/2 transform -translate-x-1/2">
          <h2 className="font-bold text-[24px] leading-[120%] text-center text-[#0B1420] w-full">
            The law's on your side
          </h2>
          <p className="font-normal text-[14px] leading-[140%] text-center text-[#515964] w-full">
            Landlords can't take money for cleaning or repainting. Only real damage.
          </p>
        </div>
        
        {/* Page indicators */}
        <div className="absolute flex flex-row items-center gap-1.5 w-[60px] left-1/2 transform -translate-x-1/2 top-[680px]">
          <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#1C2C40]"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-black bg-opacity-40"></div>
        </div>
        
        {/* Next button - positioned near bottom */}
        <div className="absolute w-[350px] h-[56px] left-1/2 transform -translate-x-1/2 bottom-[40px]">
          <Link href="/onboarding/step3" className="w-full">
            <button className="w-full h-full flex justify-center items-center bg-[#1C2C40] rounded-[16px] shadow-md">
              <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
                Next
              </span>
            </button>
          </Link>
        </div>
        
        <CookieBanner />
      </div>
    </>
  );
}