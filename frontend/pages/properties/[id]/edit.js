import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../../lib/auth';
import { apiService } from '../../../lib/api';

// Vuesax style icon components
const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.38 2.6L2.13 8.25C1.55 8.7 1.13 9.7 1.26 10.4L2.46 17.33C2.63 18.35 3.6 19.18 4.63 19.18H15.36C16.38 19.18 17.36 18.34 17.53 17.33L18.73 10.4C18.85 9.7 18.43 8.7 17.86 8.25L10.61 2.6C10.11 2.21 9.87 2.21 9.38 2.6Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 15.8V13.05" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 11.1917C11.436 11.1917 12.6 10.0276 12.6 8.59171C12.6 7.15578 11.436 5.99171 10 5.99171C8.56407 5.99171 7.40001 7.15578 7.40001 8.59171C7.40001 10.0276 8.56407 11.1917 10 11.1917Z" stroke="#292D32" strokeWidth="1.5"/>
    <path d="M3.01666 7.07496C4.65833 -0.141705 15.35 -0.133372 16.9833 7.08329C17.9417 11.3166 15.3083 14.9 13 17.1166C11.325 18.7333 8.67499 18.7333 6.99166 17.1166C4.69166 14.9 2.05833 11.3083 3.01666 7.07496Z" stroke="#292D32" strokeWidth="1.5"/>
  </svg>
);

const HouseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.04167 18.9583H18.9583" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1.875 18.9583V5.83334C1.875 5.16667 2.2 4.53334 2.75 4.18334L8.75 0.516675C9.46667 0.0666748 10.3833 0.0666748 11.1 0.516675L17.1 4.18334C17.65 4.53334 17.975 5.16667 17.975 5.83334V18.9583" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.8333 9.16666H9.16667C8.42501 9.16666 7.83334 9.75833 7.83334 10.5V18.9583H12.1667V10.5C12.1667 9.75833 11.575 9.16666 10.8333 9.16666Z" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.83334 6.25H5.83334C5.375 6.25 5.00001 6.625 5.00001 7.08333V9.08333C5.00001 9.54166 5.375 9.91666 5.83334 9.91666H7.83334C8.29167 9.91666 8.66667 9.54166 8.66667 9.08333V7.08333C8.66667 6.625 8.29167 6.25 7.83334 6.25Z" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.1667 6.25H12.1667C11.7083 6.25 11.3333 6.625 11.3333 7.08333V9.08333C11.3333 9.54166 11.7083 9.91666 12.1667 9.91666H14.1667C14.625 9.91666 15 9.54166 15 9.08333V7.08333C15 6.625 14.625 6.25 14.1667 6.25Z" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.66666 1.66667V4.16667" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.3333 1.66667V4.16667" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.91666 7.575H17.0833" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.5 7.08334V14.1667C17.5 16.6667 16.25 18.3333 13.3333 18.3333H6.66666C3.74999 18.3333 2.5 16.6667 2.5 14.1667V7.08334C2.5 4.58334 3.74999 2.91667 6.66666 2.91667H13.3333C16.25 2.91667 17.5 4.58334 17.5 7.08334Z" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.0789 11.4167H13.0864" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.0789 13.9167H13.0864" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.99626 11.4167H10.0038" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.99626 13.9167H10.0038" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.91192 11.4167H6.91941" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.91192 13.9167H6.91941" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DollarCircleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.25 10.8333L8.33333 12.9167L13.75 7.5" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DocumentUploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 17V11L7 13" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 11L11 13" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 10V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2H14" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 10H18C15 10 14 9 14 6V2L22 10Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.8166 12.575L10.3833 11.1083C9.87499 10.8167 9.45831 10.0333 9.45831 9.44166V6.25" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" 
      stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function EditProperty() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [propertyName, setPropertyName] = useState('');
  const [address, setAddress] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { id } = router.query;
  

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (id) {
      fetchProperty();
    }
  }, [id, user, authLoading, router]);


  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await apiService.properties.getById(id);
      const property = response.data;
      
      // Log all lease details for debugging
      console.log('PROPERTY DATA FROM API - Checking lease details:');
      console.log('- deposit_amount:', property.deposit_amount);
      console.log('- contract_start_date:', property.contract_start_date);
      console.log('- contract_end_date:', property.contract_end_date);
      console.log('- move_in_date:', property.move_in_date);
      console.log('- lease_duration:', property.lease_duration);
      console.log('- lease_duration_type:', property.lease_duration_type);
      
      // Set property data
      setPropertyName(property.address || '');
      setAddress(property.description || '');
      
      // Debug - Property Data
      console.log('unit_number:', property.unit_number);
      console.log('property_type:', property.property_type);
      
      // Set unit number from unit_number field if available, otherwise try property_type
      setUnitNumber(property.unit_number || '');
      
      // Store the complete original property object in localStorage to ensure we have all fields
      try {
        localStorage.setItem(`complete_property_${id}`, JSON.stringify(property));
        console.log('Stored complete property data in localStorage for safe keeping');
      } catch (storageError) {
        console.error('Error storing complete property data:', storageError);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching property:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!propertyName || !address || !unitNumber) {
      return;
    }

    setIsSubmitting(true);

    try {

      // SADECE adres, açıklama ve birim no alanlarını güncelleyen özel bir obje oluştur
      // Kira detayları (lease details) bu güncellemeden ETKİLENMEYECEK!
      const propertyData = {
        // SADECE güncellenecek alanlar:
        address: propertyName,
        description: address,
        unit_number: unitNumber,
        
        // Backend validasyon hatası olmasın diye
        role_at_this_property: 'renter',
        
        // Özel flag - bu, backend'in sadece temel alanları güncellemesini sağlar
        // Bu flag sayesinde kira detayları korunur ve DEĞİŞTİRİLMEZ
        _basic_property_update: true
      };
      
      // Önemli debug: Gönderilen verileri ve flag'i doğrulayalım
      console.log('SADECE ŞU ALANLARI GÜNCELLE:', {
        address: propertyData.address, 
        description: propertyData.description, 
        unit_number: propertyData.unit_number
      });
      console.log('_basic_property_update flag değeri:', propertyData._basic_property_update);
      console.log('Flag tipi:', typeof propertyData._basic_property_update);
      console.log('Bu işlem kira detaylarını (deposit_amount, lease_duration vb.) DEĞİŞTİRMEYECEK!');
      
      const response = await apiService.properties.update(id, propertyData);

      // Store basic property information in localStorage
      try {
        // Merge with any existing data to preserve lease details
        const addUnitKey = `property_${id}_addunit`;
        const existingData = localStorage.getItem(addUnitKey);
        let storedData = {};
        
        if (existingData) {
          try {
            storedData = JSON.parse(existingData);
          } catch (e) {
            console.error('Error parsing existing localStorage data:', e);
          }
        }
        
        // Only update basic property information in localStorage
        const formData = {
          ...storedData, // Keep all existing data
          propertyName,  // Only update these 3 specific fields
          address,
          unitNumber
        };
        
        localStorage.setItem(addUnitKey, JSON.stringify(formData));
      } catch (storageError) {
        console.error('Error saving to localStorage:', storageError);
      }

      // Navigate back to property details
      router.push(`/properties/details?propertyId=${id}`);
    } catch (error) {
      console.error('Property update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-[#FBF5DA] font-['Nunito'] min-h-screen">
      {/* Meta tags for better PWA experience */}
      <Head>
        <title>Edit Basic Home Info - DepositShield</title>
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
          
          /* Hide all elements in date input */
          
          /* Remove spinners for number inputs */
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
          
          /* Custom styling for select dropdown */
          select {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background-color: transparent;
            width: 100%;
            font-size: 14px;
            font-weight: bold;
            color: #515964;
            cursor: pointer;
            padding-right: 20px; /* Make room for custom arrow */
          }
          
          /* Hide default arrow in IE */
          select::-ms-expand {
            display: none;
          }
          
          /* Make the select element fill the entire parent container for better tap target */
          .select-container {
            position: relative;
            width: 100%;
            height: 100%;
          }
          
          /* Show dropdown on tap/click */
          select:focus {
            outline: none;
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
              className="absolute left-[20px] top-[50%] transform -translate-y-1/2"
              onClick={() => router.push(`/properties/details?propertyId=${id}`)}
              aria-label="Go back"
            >
              <ArrowLeftIcon />
            </button>
            <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420]">
              Edit Basic Home Info
            </h1>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-[calc(100vh-105px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1C2C40]"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full px-5">
            {/* Home details section */}
            <div className="w-full mt-4 mb-6">
              <h2 className="font-bold text-[16px] leading-[22px] text-[#0B1420]">
                Edit basic home details 🏡
              </h2>
            </div>
            
            {/* Property Name Input */}
            <div className="box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-full h-[56px] bg-white border border-[#D1E7D5] rounded-[16px] mb-4">
              <div className="flex-shrink-0 min-w-[20px]">
                <HomeIcon />
              </div>
              <input
                type="text"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                placeholder="What should we call this place?"
                className="flex-1 h-[19px] font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none"
                required
              />
            </div>
            
            {/* Address Input */}
            <div className="box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-full h-[56px] bg-white border border-[#D1E7D5] rounded-[16px] mb-4">
              <div className="flex-shrink-0 min-w-[20px]">
                <LocationIcon />
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Where is this located?"
                className="flex-1 h-[19px] font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none"
                required
              />
            </div>
            
            {/* Unit Number Input */}
            <div className="box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-full h-[56px] bg-white border border-[#D1E7D5] rounded-[16px] mb-20">
              <div className="flex-shrink-0 min-w-[20px]">
                <HouseIcon />
              </div>
              <input
                type="text"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="Unit number"
                className="flex-1 h-[19px] font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none"
                required
              />
            </div>
            
            {/* Save Button */}
            <div className="fixed left-0 right-0 bottom-0 px-5 py-4 bg-[#FBF5DA] safe-area-bottom">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[56px] flex justify-center items-center bg-[#1C2C40] rounded-[16px]"
              >
                <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
      
    </div>
  );
}