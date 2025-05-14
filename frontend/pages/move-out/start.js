import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../lib/auth';
import { apiService } from '../../lib/api';

// Back icon component
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19L8 12L15 5" stroke="#2E3642" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function MoveOutStart() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { propertyId } = router.query;
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [moveOutDate, setMoveOutDate] = useState('');
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
      return;
    }
    
    if (router.isReady && propertyId) {
      fetchPropertyData(propertyId);
    }
  }, [user, loading, router, propertyId, router.isReady]);

  const fetchPropertyData = async (id) => {
    try {
      setIsLoading(true);
      console.log(`Fetching property data for ID: ${id}`);
      
      // API'den veriyi çek
      const axios = (await import('axios')).default;
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // Environment Check
      const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : false;
      const apiUrl = isProduction ? 'https://api.depositshield.retako.com' : 'http://localhost:5050';
      
      // Property verisini çek
      try {
        console.log('Fetching property from', `${apiUrl}/api/properties/${id}`);
        const propertyResponse = await axios.get(`${apiUrl}/api/properties/${id}`, { headers });
        const propertyData = propertyResponse.data;
        console.log(`Loaded property data:`, propertyData);
        
        // Property'i state'e kaydet
        setProperty(propertyData);
      } catch (propError) {
        console.error('Failed to load property:', propError);
        console.error('Error loading property information');
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching property data:', error);
      setIsLoading(false);
      console.error('An error occurred. Please try again.');
    }
  };

  const handleStartMoveOut = () => {
    // Move out süreci başladı
    setStep(2);
  };

  const handleDateChange = (e) => {
    setMoveOutDate(e.target.value);
  };

  const handleConfirm = () => {
    // Move out tarihi API'ye gönderilecek
    console.log(`Move out date for property ${propertyId}: ${moveOutDate}`);
    console.log('Move out process started successfully.');
    
    // Başarılı olduğunda odalar sayfasına yönlendir
    setTimeout(() => {
      router.push(`/move-out/rooms?propertyId=${propertyId}`);
    }, 2000);
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to welcome page
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#FBF5DA] px-4">
        <p className="text-[#515964] text-center">
          Mülk bilgileri bulunamadı. Lütfen geçerli bir mülk seçin.
        </p>
        <button
          onClick={() => router.push('/move-out')}
          className="mt-4 px-6 py-3 bg-[#1C2C40] rounded-[16px] text-[#D1E7E2] font-bold text-[16px]"
        >
          Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-[#FBF5DA] font-['Nunito'] min-h-screen">
      <Head>
        <title>Move Out Process</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <style jsx global>{`
          body {
            background-color: #FBF5DA;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            width: 100%;
            font-family: 'Nunito', sans-serif;
          }
          .safe-area-top {
            padding-top: env(safe-area-inset-top, 40px);
          }
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom, 20px);
          }
        `}</style>
      </Head>
      
      <div className="w-full max-w-[390px] relative">
        {/* Status Bar Space */}
        <div className="h-[40px] w-full safe-area-top"></div>
        
        {/* Header */}
        <div className="w-full h-[65px]">
          <div className="flex flex-row justify-center items-center px-[10px] py-[20px] w-full h-[65px] relative">
            <button 
              className="absolute left-[20px] top-[50%] transform -translate-y-1/2 z-10"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <BackIcon />
            </button>
            <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420]">
              {step === 1 ? 'Move Out Process' : 'Select Move Out Date'}
            </h1>
          </div>
        </div>
      
        {/* Main Content */}
        <div className="w-full px-4 pb-24">
          {step === 1 ? (
            // Step 1: Property information and confirmation
            <div className="w-full flex flex-col items-center">
              <div className="w-full bg-white p-5 rounded-2xl shadow-sm mb-6 mt-4">
                <h2 className="font-bold text-xl mb-2">{property.address}</h2>
                {property.property_type && (
                  <p className="text-sm text-[#515964] mb-1">
                    <span className="font-medium">Type: </span>
                    {property.property_type}
                  </p>
                )}
                {property.description && (
                  <p className="text-sm text-[#515964] mb-1">
                    <span className="font-medium">Description: </span>
                    {property.description}
                  </p>
                )}
              </div>
              
              <div className="w-full bg-white p-5 rounded-2xl shadow-sm mb-8">
                <h3 className="font-bold text-lg mb-3">Move Out Process</h3>
                <p className="text-sm text-[#515964] mb-4">
                  Starting the move out process will allow you to:
                </p>
                <ul className="list-disc pl-5 mb-4 text-sm text-[#515964] space-y-2">
                  <li>Document the current condition of the property</li>
                  <li>Compare against your move-in records</li>
                  <li>Generate a comprehensive move-out report</li>
                  <li>Protect your deposit during the return process</li>
                </ul>
              </div>
              
              <button
                onClick={handleStartMoveOut}
                className="w-full py-4 bg-[#1C2C40] rounded-[16px] text-[#D1E7E2] font-bold text-base shadow-sm"
              >
                Start Move Out Process
              </button>
            </div>
          ) : (
            // Step 2: Move out date selection
            <div className="w-full flex flex-col items-center">
              <div className="w-full bg-white p-5 rounded-2xl shadow-sm mb-6 mt-4">
                <h2 className="font-bold text-xl mb-4">Select your move out date</h2>
                <p className="text-sm text-[#515964] mb-5">
                  Please select the date when you plan to move out of this property:
                </p>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#515964] mb-2">
                    Move Out Date
                  </label>
                  <input
                    type="date"
                    value={moveOutDate}
                    onChange={handleDateChange}
                    className="w-full px-4 py-3 border border-[#D1E7D5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#55A363]"
                    min={new Date().toISOString().split('T')[0]} // Today's date as minimum
                    required
                  />
                </div>
                
                <p className="text-xs text-[#515964] italic mb-4">
                  Note: You'll be able to change this date later if your plans change.
                </p>
              </div>
              
              <button
                onClick={handleConfirm}
                disabled={!moveOutDate}
                className={`w-full py-4 rounded-[16px] font-bold text-base shadow-sm ${
                  moveOutDate 
                    ? 'bg-[#1C2C40] text-[#D1E7E2]' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirm & Continue
              </button>
              
              <button
                onClick={() => setStep(1)}
                className="w-full py-3 mt-3 text-[#1C2C40] font-semibold text-sm"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}