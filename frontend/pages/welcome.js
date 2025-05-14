import { useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function Welcome() {
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

  return (
    <>
      <Head>
        <title>Welcome to DepositShield</title>
        <link rel="stylesheet" href="/styles/modern/theme.css" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="flex flex-col min-h-screen font-['Nunito']">
        {/* Sarı arka plan */}
        <div className="flex-1 bg-[#F8F4D6] relative overflow-hidden">
          {/* Yeşil alt zemin */}
          <div className="absolute bottom-0 left-0 right-0 h-[153px] bg-[#D1E7D5]"></div>
          
          {/* Görsel */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ width: '110%', left: '-5%' }}>
            <img
              src="/images/welcome-illustration.png"
              alt="Person relaxing on a green sofa"
              className="w-full h-auto max-h-[90vh] object-contain -translate-y-[-15%]"
            />
          </div>
        </div>
        
        {/* Beyaz alan */}
        <div className="bg-white p-6 pt-8 pb-10 -mt-4 shadow-lg z-10 relative rounded-t-[24px]">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Protect your deposit <br /> from day one
            </h1>
            <p className="text-gray-600 mt-2">
              Renters deserve peace of mind <br /> and it starts here.
            </p>
            
            <div className="mt-6 space-y-3">
              <Link 
                href="/login"
                className="block text-base text-gray-800 font-medium"
              >
                Sign in
              </Link>
              <Link 
                href="/register"
                className="block w-full bg-[#1C2C40] text-[#D1E7E2] py-3 rounded-xl font-bold text-base"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}