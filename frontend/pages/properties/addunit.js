import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../lib/auth';
import { apiService } from '../../lib/api';

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

const InfoCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 6.66667V10.8333" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.99542 13.3333H10.0029" stroke="#515964" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function AddUnit() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [propertyName, setPropertyName] = useState('');
  const [address, setAddress] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [livingRooms, setLivingRooms] = useState('');
  const [kitchenCount, setKitchenCount] = useState('');
  const [squareFootage, setSquareFootage] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [parkingSpaces, setParkingSpaces] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [contractStartDate, setContractStartDate] = useState('');
  const [leaseDuration, setLeaseDuration] = useState('');
  const [leaseDurationType, setLeaseDurationType] = useState('months');
  const [leaseDocument, setLeaseDocument] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDurationTypeSelector, setShowDurationTypeSelector] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  
  // Handle animation timing
  useEffect(() => {
    let animationTimeout;
    if (showDurationTypeSelector) {
      // Small delay to let the component render first, then add the visible class
      animationTimeout = setTimeout(() => {
        setAnimationClass('visible');
      }, 10);
    } else {
      setAnimationClass('');
    }
    
    return () => {
      if (animationTimeout) clearTimeout(animationTimeout);
    };
  }, [showDurationTypeSelector]);
  
  // Close the bottom sheet with animation
  const closeBottomSheet = () => {
    setAnimationClass('');
    // Wait for animation to finish before hiding the component
    setTimeout(() => {
      setShowDurationTypeSelector(false);
    }, 300); // Match the animation duration (0.3s)
  };
  
  // Select duration type with animation
  const selectDurationType = (type) => {
    setLeaseDurationType(type);
    closeBottomSheet();
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
    }
  }, [user, loading, router]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLeaseDocument(e.target.files[0]);
    }
  };

  // Calculate end date based on start date and lease duration
  const calculateEndDate = (startDate, duration, durationType) => {
    if (!startDate || !duration) return '';
    
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return '';
    
    const end = new Date(start);
    if (durationType === 'weeks') {
      // Add weeks (7 days per week)
      end.setDate(end.getDate() + (parseInt(duration) * 7));
    } else if (durationType === 'months') {
      end.setMonth(end.getMonth() + parseInt(duration));
    } else {
      end.setFullYear(end.getFullYear() + parseInt(duration));
    }
    
    // Format as YYYY-MM-DD
    return end.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!propertyName || !address || !unitNumber) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate contract end date
      const calculatedEndDate = calculateEndDate(
        contractStartDate,
        leaseDuration,
        leaseDurationType
      );

      // Create a reusable data object for both localStorage and API
      const formData = {
        propertyName,
        address,
        unitNumber,
        depositAmount,
        moveInDate,
        contractStartDate,
        calculatedEndDate,
        leaseDuration,
        leaseDurationType,
        bathrooms,
        livingRooms,
        kitchenCount,
        squareFootage,
        yearBuilt,
        parkingSpaces,
        leaseDocument: leaseDocument ? leaseDocument.name : null
      };

      // Save to temporary localStorage in case the API call fails
      try {
        localStorage.setItem('temp_addunit_data', JSON.stringify(formData));
        console.log('Saved form data to temporary localStorage');
      } catch (tempError) {
        console.error('Error saving temporary data:', tempError);
      }

      // Prepare property data for API
      const propertyData = {
        address: propertyName, // Using propertyName for address field which is the name we'll call this place
        description: address, // Using full address as description
        property_type: 'apartment', // Default property type
        unit_number: unitNumber, // Store unit number in separate field
        
        // Debug info
        _debug_info: 'unit_number should be saved separately from property_type',
        role_at_this_property: 'renter',
        deposit_amount: depositAmount,
        move_in_date: moveInDate,
        contract_start_date: contractStartDate,
        contract_end_date: calculatedEndDate,
        lease_duration: leaseDuration,
        lease_duration_type: leaseDurationType,
        bathrooms,
        living_rooms: livingRooms,
        kitchen_count: kitchenCount,
        square_footage: squareFootage,
        year_built: yearBuilt,
        parking_spaces: parkingSpaces
      };

      // Remove fields that might cause issues with the current database schema
      // We'll add them back when the schema is updated
      const safePropertyData = { ...propertyData };
      delete safePropertyData.bathrooms;
      delete safePropertyData.living_rooms;
      delete safePropertyData.square_footage;
      delete safePropertyData.year_built;
      delete safePropertyData.parking_spaces;

      // Make sure unit_number is included in the safe data
      if (unitNumber) {
        safePropertyData.unit_number = unitNumber;
      }
      
      console.log('Sending property data to API with unit_number:', safePropertyData.unit_number);
      
      // Submit the property data
      const response = await apiService.properties.create(safePropertyData);
      
      // If we have a lease document, upload it
      if (leaseDocument) {
        try {
          // Create a FormData instance to handle file upload
          const fileFormData = new FormData();
          fileFormData.append('file', leaseDocument);
          fileFormData.append('propertyId', response.data.id);
          fileFormData.append('fileType', 'lease');
          
          // Use axios directly for file upload
          const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : false;
          const apiUrl = isProduction ? 'https://api.depositshield.retako.com' : 'http://localhost:5050';
          const token = localStorage.getItem('token');
          
          const axios = (await import('axios')).default;
          await axios.post(
            `${apiUrl}/api/files/upload`, 
            fileFormData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          console.log('Lease document uploaded successfully');
        } catch (uploadError) {
          console.error('Error uploading lease document:', uploadError);
        }
      }

      // Store all form data in localStorage with the proper property ID
      try {
        const propertyId = response.data.id;
        const addUnitKey = `property_${propertyId}_addunit`;
        localStorage.setItem(addUnitKey, JSON.stringify(formData));
        console.log(`Saved addunit data to localStorage with key: ${addUnitKey}`);

        // Remove temporary storage
        localStorage.removeItem('temp_addunit_data');
      } catch (storageError) {
        console.error('Error saving to localStorage:', storageError);
        // Continue even if localStorage fails
      }

      // Navigate to the page for adding rooms
      router.push(`/properties/${response.data.id}/add-rooms`);
    } catch (error) {
      console.error('Property creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-[#FBF5DA] font-['Nunito'] min-h-screen">
      {/* Meta tags for better PWA experience */}
      <Head>
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
          input[type="date"] {
            color: transparent;
          }
          input[type="date"]::-webkit-datetime-edit,
          input[type="date"]::-webkit-inner-spin-button,
          input[type="date"]::-webkit-calendar-picker-indicator {
            appearance: none;
            -webkit-appearance: none;
            display: none;
          }
          
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
          
          /* Animation for the bottom sheet */
          .bottom-sheet-overlay {
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
          }
          
          .bottom-sheet-overlay.visible {
            opacity: 1;
          }
          
          .bottom-sheet {
            transform: translateY(100%);
            transition: transform 0.3s ease-in-out;
          }
          
          .bottom-sheet.visible {
            transform: translateY(0);
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
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ArrowLeftIcon />
            </button>
            <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420]">
              Add Home
            </h1>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full px-5">
          {/* Add your home details section */}
          <div className="w-full mt-4 mb-6">
            <h2 className="font-bold text-[16px] leading-[22px] text-[#0B1420]">
              Add your home details 🏡
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
          <div className="box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-full h-[56px] bg-white border border-[#D1E7D5] rounded-[16px] mb-6">
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
          
          {/* Lease Details Section */}
          <div className="w-full mb-4">
            <h2 className="font-bold text-[16px] leading-[22px] text-[#0B1420]">
              Lease Details 📂
            </h2>
          </div>
          
          {/* Lease Duration */}
          <div className="flex flex-col items-start gap-[8px] w-full mb-4">
            <div className="w-full font-bold text-[14px] leading-[19px] text-[#0B1420]">
              Lease Duration
            </div>
            
            {/* Lease Duration Inputs */}
            <div className="w-full flex flex-row items-center gap-[10px]">
              {/* Duration Input - equal width */}
              <div className="box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-[50%] h-[56px] bg-white border border-[#D1E7D5] rounded-[16px]">
                <div className="flex-shrink-0 min-w-[20px]">
                  <ClockIcon />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={leaseDuration}
                  onChange={(e) => setLeaseDuration(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Duration"
                  className="flex-1 h-[19px] font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none"
                />
              </div>
              
              {/* Duration Type Select - equal width */}
              <div className="box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-[50%] h-[56px] bg-white border border-[#D1E7D5] rounded-[16px]">
                <div className="flex-shrink-0 min-w-[20px]">
                  <ClockIcon />
                </div>
                <div 
                  className="flex-1 relative cursor-pointer"
                  onClick={() => setShowDurationTypeSelector(true)}
                >
                  {/* Visual representation of select (always visible) */}
                  <div className="font-bold text-[14px] leading-[19px] text-[#515964]">
                    {leaseDurationType === 'weeks' 
                      ? 'Weeks' 
                      : leaseDurationType === 'months'
                        ? 'Months'
                        : 'Years'}
                  </div>
                  {/* Custom dropdown arrow */}
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.6666 1.16667L5.99998 5.83334L1.33331 1.16667" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contract Start Date */}
          <div onClick={() => document.getElementById('contract-start-date').showPicker()} className="box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-full h-[56px] bg-white border border-[#D1E7D5] rounded-[16px] mb-4 relative cursor-pointer">
            <div className="flex-shrink-0 min-w-[20px]">
              <CalendarIcon />
            </div>
            <div className="relative flex-1">
              <div className="absolute left-0 text-[#A0A0A0] text-[14px] leading-[19px] font-bold">
                {!contractStartDate ? "Lease start date" : contractStartDate}
              </div>
              <input
                type="date"
                id="contract-start-date"
                value={contractStartDate}
                onChange={(e) => setContractStartDate(e.target.value)}
                className="w-full h-[19px] opacity-0 z-10 cursor-pointer"
              />
            </div>
          </div>
          
          {/* Move In Date */}
          <div onClick={() => document.getElementById('move-in-date').showPicker()} className="box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-full h-[56px] bg-white border border-[#D1E7D5] rounded-[16px] mb-4 relative cursor-pointer">
            <div className="flex-shrink-0 min-w-[20px]">
              <CalendarIcon />
            </div>
            <div className="relative flex-1">
              <div className="absolute left-0 text-[#A0A0A0] text-[14px] leading-[19px] font-bold">
                {!moveInDate ? "Move in date" : moveInDate}
              </div>
              <input
                type="date"
                id="move-in-date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className="w-full h-[19px] opacity-0 z-10 cursor-pointer"
              />
            </div>
          </div>
          
          {/* Deposit Amount */}
          <div className="box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-full h-[56px] bg-white border border-[#D1E7D5] rounded-[16px] mb-4">
            <div className="flex-shrink-0 min-w-[20px]">
              <DollarCircleIcon />
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Deposit amount"
              className="flex-1 h-[19px] font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none"
            />
          </div>
          
          {/* Upload Lease */}
          <label className="box-border flex flex-row justify-center items-center p-[16px_20px] gap-[8px] w-full h-[120px] bg-white border border-dashed border-[#D1E7D5] rounded-[16px] mb-28 cursor-pointer">
            <div className="flex flex-col justify-center items-center p-0 gap-[12px] w-full">
              <DocumentUploadIcon />
              <div className="font-bold text-[14px] leading-[19px] text-center text-[#515964]">
                Upload your lease
              </div>
              {leaseDocument && (
                <div className="text-[12px] text-green-600 mt-1">
                  File selected: {leaseDocument.name}
                </div>
              )}
            </div>
            <input 
              type="file" 
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            />
          </label>
          
          {/* Next Button */}
          <div className="fixed left-0 right-0 bottom-0 px-5 py-4 bg-gradient-to-t from-[#FBF5DA] via-[#FBF5DA] to-transparent pt-8 safe-area-bottom">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[56px] flex justify-center items-center bg-[#1C2C40] rounded-[16px] shadow-md"
            >
              <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
                {isSubmitting ? 'Processing...' : 'Next'}
              </span>
            </button>
          </div>
        </form>
      </div>
      
      {/* Bottom sheet for duration type selection */}
      {showDurationTypeSelector && (
        <div className="fixed inset-0 z-50">
          {/* Overlay with fade animation */}
          <div 
            className={`absolute inset-0 bg-black bg-opacity-40 bottom-sheet-overlay ${animationClass}`}
            onClick={closeBottomSheet}
          ></div>
          
          {/* Bottom Sheet with slide-up animation */}
          <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] overflow-hidden safe-area-bottom bottom-sheet ${animationClass}`}>
            {/* Handle Bar for better UX */}
            <div className="w-full flex justify-center pt-3 pb-1">
              <div className="w-[36px] h-[4px] bg-[#E0E0E0] rounded-full"></div>
            </div>
            
            {/* Title */}
            <div className="w-full h-[65px] flex justify-center items-center border-b border-[#EBEBEB]">
              <h3 className="font-bold text-[18px] leading-[25px] text-[#0B1420]">
                Duration
              </h3>
            </div>
            
            {/* Options */}
            <div>
              {/* Weeks Option */}
              <div 
                className={`flex flex-row items-center p-[20px] ${leaseDurationType === 'weeks' ? 'bg-[#F5F8F7]' : 'bg-white'}`}
                onClick={() => selectDurationType('weeks')}
              >
                <div className="flex-1">
                  <div className="font-bold text-[16px] leading-[22px] text-[#0B1420]">Weeks</div>
                </div>
                {leaseDurationType === 'weeks' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#1C2C40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.75 12L10.58 14.83L16.25 9.17" stroke="#1C2C40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              
              {/* Months Option */}
              <div 
                className={`flex flex-row items-center p-[20px] ${leaseDurationType === 'months' ? 'bg-[#F5F8F7]' : 'bg-white'}`}
                onClick={() => selectDurationType('months')}
              >
                <div className="flex-1">
                  <div className="font-bold text-[16px] leading-[22px] text-[#0B1420]">Months</div>
                </div>
                {leaseDurationType === 'months' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#1C2C40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.75 12L10.58 14.83L16.25 9.17" stroke="#1C2C40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              
              {/* Years Option */}
              <div 
                className={`flex flex-row items-center p-[20px] ${leaseDurationType === 'years' ? 'bg-[#F5F8F7]' : 'bg-white'}`}
                onClick={() => selectDurationType('years')}
              >
                <div className="flex-1">
                  <div className="font-bold text-[16px] leading-[22px] text-[#0B1420]">Years</div>
                </div>
                {leaseDurationType === 'years' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#1C2C40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.75 12L10.58 14.83L16.25 9.17" stroke="#1C2C40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
            
            {/* Cancel Button */}
            <div className="p-5 pb-8">
              <button
                className="w-full h-[56px] flex justify-center items-center bg-white border border-[#EBEBEB] rounded-[16px]"
                onClick={closeBottomSheet}
              >
                <span className="font-bold text-[16px] leading-[22px] text-[#1C2C40]">
                  Cancel
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}