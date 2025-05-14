import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import { useAuth } from '../../../lib/auth';
import { apiService } from '../../../lib/api';

// Debug helper
const DEBUG = true;
const logDebug = (...args) => {
  if (DEBUG) {
    console.log('[LANDLORD PAGE]', ...args);
  }
};

// Back arrow icon component
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" 
      stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function LandlordUpdate() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Landlord information
  const [landlordEmail, setLandlordEmail] = useState('');
  const [landlordPhone, setLandlordPhone] = useState('');
  
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

  // Load property data
  useEffect(() => {
    if (!id || authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    const loadProperty = async () => {
      try {
        const response = await apiService.properties.getById(id);
        const propertyData = response.data;
        setProperty(propertyData);
        
        // Set landlord data if available
        if (propertyData.landlord_email) {
          setLandlordEmail(propertyData.landlord_email);
        }
        if (propertyData.landlord_phone) {
          setLandlordPhone(propertyData.landlord_phone);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading property data:', error);
        setLoading(false);
        router.push('/properties');
      }
    };

    loadProperty();
  }, [id, user, authLoading, router]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    const emailValue = landlordEmail.trim();
    const phoneValue = landlordPhone.trim();
    
    logDebug("Form values:", { emailValue, phoneValue });
    
    // At least one field must be filled
    if (!emailValue && !phoneValue) {
      return;
    }
    
    // Validate email if provided
    if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      return;
    }
    
    // Validate phone if provided - must be in US format
    if (phoneValue) {
      const phoneDigits = phoneValue.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        return;
      }
    }
    
    setSaving(true);
    
    try {
      // Use apiService directly
      logDebug('Starting the save operation through api.js');
      
      // Prepare data in the format expected by the backend
      const apiData = {
        email: emailValue,
        phone: phoneValue
      };
      
      logDebug('API çağrısı veri:', apiData);
      
      // Direkt olarak backend'in istediği formatta veri gönder
      const response = await apiService.properties.saveLandlordDetails(id, apiData);
      
      logDebug('Kayıt işlemi başarılı! Yanıt:', response.data);
      
      // ÖNEMLİ: localStorage'a kaydet - bunu tüm sayfalar için yedek mekanizma olarak kullanıyoruz
      localStorage.setItem('lastSharedPropertyId', id);
      logDebug('localStorage\'a propertyId kaydedildi:', id);
      
      // Doğru şekilde yönlendirme - query parametresi kullanarak
      logDebug('Şimdi details sayfasına yönlendiriliyor...');
      
      // Direkt router.replace ile yönlendir (tam sayfa yenileme)
      window.location.href = `/properties/details?propertyId=${id}`;
    } catch (error) {
      logDebug('Kayıt işlemi başarısız!', error);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FBF5DA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-[#FBF5DA] font-['Nunito'] overflow-x-hidden">
      {/* Meta tags */}
      <Head>
        <title>Landlord Information - DepositShield</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
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
            Landlord Information
          </h1>
        </div>
      </div>
      
      {/* Main Content - Start after header */}
      <div className="flex flex-col items-center w-full pt-[105px] px-4 px-safe pb-[100px]">
        <div className="w-full max-w-[350px] mx-auto">
          <div className="bg-white border border-[#D1E7D5] rounded-[16px] w-full p-6">
            <h2 className="text-[18px] font-bold mb-4 text-[#0B1420]">
              Enter Landlord Contact Information
            </h2>
            
            <p className="text-[14px] text-[#515964] mb-6">
              This information will be used to send property reports to your landlord.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="landlordEmail" className="block font-medium text-[14px] mb-2 text-[#0B1420]">
                  Landlord Email
                </label>
                <input
                  id="landlordEmail"
                  type="email"
                  value={landlordEmail}
                  onChange={(e) => setLandlordEmail(e.target.value)}
                  className="w-full h-[48px] px-4 rounded-[12px] border border-[#ECF0F5] focus:border-[#1C2C40] focus:outline-none"
                  placeholder="email@example.com"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="landlordPhone" className="block font-medium text-[14px] mb-2 text-[#0B1420]">
                  Landlord Phone
                </label>
                <input
                  id="landlordPhone"
                  type="tel"
                  value={landlordPhone}
                  onChange={(e) => setLandlordPhone(formatPhoneNumber(e.target.value))}
                  className="w-full h-[48px] px-4 rounded-[12px] border border-[#ECF0F5] focus:border-[#1C2C40] focus:outline-none"
                  placeholder="(123) 456-7890"
                />
              </div>
              
              <button
                type="submit"
                disabled={saving}
                className="w-full h-[56px] flex flex-row justify-center items-center p-[18px] gap-[10px] bg-[#1C2C40] rounded-[16px] touch-manipulation active:bg-[#283c56] transition-colors"
              >
                <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
                  {saving ? 'Saving...' : 'Save Information'}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}