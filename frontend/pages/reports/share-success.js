import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function ShareSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect after 5 seconds
    const redirectTimer = setTimeout(() => {
      router.push('/properties/details');
    }, 5000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="relative w-full min-h-screen max-w-[500px] mx-auto bg-[#FBF5DA] font-['Nunito'] overflow-hidden">
      <Head>
        <title>Report Sent - DepositShield</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Head>
      
      {/* Simple top spacing */}
      <div className="w-full h-[100px]"></div>
      
      {/* Success Illustration */}
      <div className="w-[300px] h-[180px] mx-auto mt-5">
        <img 
          src="/images/reportsuccess.png" 
          alt="Success" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Success Content */}
      <div className="flex flex-col items-center p-0 gap-[8px] w-[300px] h-auto mx-auto mt-12">
        <h2 className="w-full font-bold text-[24px] leading-[120%] text-center text-[#0B1420]">
          Your report was sent!
        </h2>
        <p className="w-full font-normal text-[14px] leading-[140%] text-center text-[#515964] mt-2">
          We've sent your time-stamped report to your landlord. You're covered.
        </p>
      </div>
      
      {/* Done Button */}
      <div className="fixed bottom-8 left-0 right-0 mx-auto w-[90%] max-w-[350px]">
        <button 
          onClick={() => router.push('/properties/details')}
          className="w-full h-[56px] flex flex-row justify-center items-center bg-[#1C2C40] rounded-[16px] font-bold text-[16px] text-[#D1E7E2]"
        >
          Done
        </button>
      </div>
    </div>
  );
}