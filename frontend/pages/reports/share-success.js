import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../lib/auth';

export default function ShareSuccess() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { url, uuid } = router.query;
  
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/welcome');
      return;
    }
    
    // Get the shared URL from query params or localStorage
    const reportUrl = url || localStorage.getItem('report_share_url');
    const reportUuid = uuid || localStorage.getItem('report_uuid');
    
    if (reportUrl) {
      setShareUrl(reportUrl);
    } else if (reportUuid) {
      // URL yoksa ama UUID varsa, URL'yi oluştur
      const baseUrl = window.location.origin;
      const constructedUrl = `${baseUrl}/reports/shared/${reportUuid}`;
      setShareUrl(constructedUrl);
      console.log('Constructed share URL from UUID:', constructedUrl);
    }
    
    // Clean up after successful render
    return () => {
      // Clear localStorage items related to sharing
      localStorage.removeItem('report_share_url');
      localStorage.removeItem('report_uuid');
      localStorage.removeItem('report_share_success');
      localStorage.removeItem('lastSharedPropertyId');
    };
  }, [user, authLoading, router, url]);
  
  // Copy link to clipboard
  const copyToClipboard = async () => {
    try {
      if (shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        console.log('Link copied to clipboard!');
        
        // Reset copy state after 3 seconds
        setTimeout(() => {
          setCopied(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to copy link:', error);
      console.error('Failed to copy link. Please try again.');
    }
  };
  
  // Determine if this is move-in or move-out
  const [reportType, setReportType] = useState('Walkthrough');
  
  useEffect(() => {
    // Check the localStorage for lastSharedPropertyId to determine if it's a move-in report
    const lastSharedPropertyId = localStorage.getItem('lastSharedPropertyId');
    if (lastSharedPropertyId) {
      setReportType('Move-In Walkthrough');
    } else if (localStorage.getItem('report_share_success')) {
      setReportType('Move-Out');
    }
  }, []);
  
  // Send email with link
  const sendEmail = () => {
    if (shareUrl) {
      const subject = encodeURIComponent(`${reportType} Report`);
      const body = encodeURIComponent(
        `Hello,\n\nI've prepared a ${reportType.toLowerCase()} report for your property. You can view it here:\n\n${shareUrl}\n\nThank you.`
      );
      
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };
  
  // Open WhatsApp share
  const shareOnWhatsApp = () => {
    if (shareUrl) {
      const text = encodeURIComponent(`Here's the ${reportType.toLowerCase()} report for your property: ${shareUrl}`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

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
      <div className="flex flex-col items-center p-0 gap-[8px] w-[300px] h-auto mx-auto mt-5">
        <h2 className="w-full font-bold text-[24px] leading-[120%] text-center text-[#0B1420]">
          Your report was sent!
        </h2>
        <p className="w-full font-normal text-[14px] leading-[140%] text-center text-[#515964] mt-2 mb-4">
          We've sent your time-stamped {reportType.toLowerCase()} report to your landlord. You're covered.
        </p>
        
        {shareUrl && (
          <div className="w-full mt-4">
            <p className="font-medium text-[14px] leading-[19px] text-[#6B7280] mb-2 text-center">
              Share this report:
            </p>
            
            <div className="flex items-center bg-[#F3F4F6] rounded-[12px] p-3 mb-4">
              <div className="flex-grow truncate text-[14px] leading-[19px] text-[#0B1420] text-left">
                {shareUrl}
              </div>
              <button 
                onClick={copyToClipboard}
                className="ml-2 flex-shrink-0"
              >
                {copied ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#4D935A"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="#1C2C40"/>
                  </svg>
                )}
              </button>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button 
                onClick={sendEmail}
                className="flex flex-col items-center"
              >
                <div className="bg-[#1C2C40] w-12 h-12 rounded-full flex items-center justify-center mb-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#D1E7E2"/>
                  </svg>
                </div>
                <span className="text-[12px] leading-[16px] text-[#515964]">Email</span>
              </button>
              
              <button 
                onClick={shareOnWhatsApp}
                className="flex flex-col items-center"
              >
                <div className="bg-[#1C2C40] w-12 h-12 rounded-full flex items-center justify-center mb-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.6 6.32C16.12 4.82 14.12 4 12 4C7.72 4 4.23 7.5 4.23 11.78C4.23 13.38 4.66 14.94 5.46 16.29L4.15 20L7.96 18.73C9.27 19.45 10.65 19.83 12.06 19.83H12.08C16.37 19.83 19.77 16.33 19.77 12.05C19.77 9.92 18.96 7.93 17.6 6.32ZM12.08 18.34C10.83 18.34 9.61 18 8.54 17.35L8.25 17.17L5.96 17.92L6.73 15.72L6.53 15.42C5.82 14.31 5.44 13.03 5.44 11.71C5.44 8.32 8.39 5.51 12.06 5.51C13.82 5.51 15.49 6.19 16.7 7.4C17.91 8.61 18.59 10.28 18.59 12.05C18.59 15.47 15.49 18.34 12.08 18.34ZM15.61 13.47C15.37 13.35 14.37 12.86 14.16 12.77C13.94 12.69 13.78 12.64 13.63 12.88C13.47 13.12 13.09 13.57 12.96 13.73C12.82 13.9 12.69 13.92 12.45 13.8C12.21 13.68 11.56 13.47 10.79 12.78C10.19 12.25 9.78 11.6 9.64 11.36C9.51 11.12 9.63 11 9.75 10.88C9.86 10.78 10 10.61 10.12 10.47C10.24 10.34 10.29 10.23 10.37 10.08C10.45 9.93 10.4 9.8 10.35 9.68C10.29 9.56 9.88 8.55 9.68 8.07C9.5 7.61 9.29 7.67 9.15 7.67C9.01 7.66 8.86 7.66 8.7 7.66C8.55 7.66 8.3 7.71 8.09 7.95C7.87 8.19 7.35 8.68 7.35 9.69C7.35 10.69 8.07 11.65 8.18 11.8C8.3 11.96 9.78 14.19 11.99 15.06C12.48 15.28 12.87 15.4 13.17 15.5C13.67 15.65 14.13 15.63 14.49 15.57C14.89 15.5 15.68 15.06 15.88 14.5C16.08 13.93 16.08 13.45 16.02 13.35C15.96 13.24 15.81 13.18 15.57 13.06L15.61 13.47Z" fill="#D1E7E2"/>
                  </svg>
                </div>
                <span className="text-[12px] leading-[16px] text-[#515964]">WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Done Button */}
      <div className="fixed bottom-8 left-0 right-0 mx-auto w-[90%] max-w-[350px]">
        <button 
          onClick={() => router.push('/')}
          className="w-full h-[56px] flex flex-row justify-center items-center bg-[#1C2C40] rounded-[16px] font-bold text-[16px] text-[#D1E7E2]"
        >
          Done
        </button>
      </div>
    </div>
  );
}