import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { toast } from 'react-toastify';
import { useAuth } from '../../lib/auth';
import { apiService } from '../../lib/api';

// Back icon component
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19L8 12L15 5" stroke="#2E3642" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function MoveOutProperties() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
    } else if (user) {
      fetchPropertiesData();
    }
  }, [user, loading, router]);

  const fetchPropertiesData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching properties data for move-out...');
      
      // API'den verileri çek
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
      
      // Properties verisini çek
      let propertiesList = [];
      try {
        console.log('Fetching properties from', `${apiUrl}/api/properties`);
        
        try {
          const propertiesResponse = await axios.get(`${apiUrl}/api/properties`, { headers });
          propertiesList = propertiesResponse.data || [];
          console.log(`Loaded ${propertiesList.length} properties for move-out`);
        } catch (apiError) {
          console.error('API error:', apiError);
          // API çalışmıyorsa örnek mülkler
          propertiesList = [
            { id: 1, address: '123 Main St, Apt 4B', property_type: 'Apartment', description: 'Two bedroom apartment' },
            { id: 2, address: '456 Park Ave', property_type: 'House', description: 'Single family home' },
            { id: 3, address: '789 Broadway, Unit 7C', property_type: 'Condo', description: 'Modern condo with view' }
          ];
        }
        
        // Mülkleri state'e kaydet
        setProperties(propertiesList);
      } catch (propError) {
        console.error('Failed to load properties:', propError);
        toast.error('Mülkleriniz yüklenirken bir hata oluştu.');
        propertiesList = [];
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching properties data:', error);
      setIsLoading(false);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
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

  return (
    <div className="flex flex-col items-center bg-[#FBF5DA] font-['Nunito'] min-h-screen">
      <Head>
        <title>Move Out - Properties</title>
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
        
        {/* Header with Back Button */}
        <div className="w-full h-[65px] border-b border-[#ECF0F5]">
          <div className="flex flex-row justify-center items-center px-[10px] py-[20px] w-full h-[65px] relative">
            <button 
              className="absolute left-[20px] top-[50%] transform -translate-y-1/2 z-[2] flex items-center justify-center w-[40px] h-[40px]"
              onClick={() => router.push('/')}
              aria-label="Go back"
            >
              <BackIcon />
            </button>
            <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420]">
              Select Property to Move Out
            </h1>
          </div>
        </div>
      
        {/* Main Content */}
        <div className="w-full px-4 pb-24">
          {properties.length === 0 ? (
            // Empty state when no properties exist
            <div className="w-full flex flex-col justify-end items-center gap-[20px] mt-8">
              <div className="w-[200px] h-[120px] mt-[20px]">
                <img
                  src="/images/dashboard.png"
                  alt="Home illustration"
                  className="w-full h-full object-contain"
                  style={{ mixBlendMode: 'Luminosity' }}
                  loading="eager"
                />
              </div>

              <p className="w-full max-w-[311px] font-bold text-[16px] leading-[22px] text-center text-[#515964]">
                You don't have any properties added yet.
              </p>
              
              <button
                onClick={() => router.push('/properties/addunit')}
                className="mt-4 px-6 py-3 bg-[#1C2C40] rounded-[16px] text-[#D1E7E2] font-bold text-[16px]"
              >
                Add a Property
              </button>
            </div>
          ) : (
            // Property list view
            <div className="w-full">
              <p className="font-normal text-[14px] leading-[19px] text-[#515964] mb-6 mt-2">
                Select the property you're moving out from to begin the process:
              </p>
              
              <div className="flex flex-col gap-[10px] w-full mb-6">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="w-full p-[16px] bg-white border border-[#D1E7D5] rounded-[16px] cursor-pointer relative active:bg-gray-50 transition-colors touch-manipulation"
                    onClick={() => router.push(`/move-out/rooms?propertyId=${property.id}`)}
                  >
                    <div className="flex flex-row justify-between items-center pr-6">
                      <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-[14px] leading-[19px] text-[#0B1420]">
                          {property.address || 'Property'}
                        </h3>
                        <p className="font-normal text-[12px] leading-[16px] text-[#515964]">
                          {property.description || property.property_type || 'No description'}
                        </p>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.94001 13.2799L10.6 8.61989C11.14 8.07989 11.14 7.17989 10.6 6.63989L5.94001 1.97989"
                          stroke="#1C2C40" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}