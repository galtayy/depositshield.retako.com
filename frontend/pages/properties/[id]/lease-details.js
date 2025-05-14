import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../../lib/auth';
import { apiService } from '../../../lib/api';

// Back arrow icon component
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" 
      stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Calendar Icon component
const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.66666 1.66667V4.16667" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.3333 1.66667V4.16667" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.91666 7.575H17.0833" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17.5 7.08334V14.1667C17.5 16.6667 16.25 18.3333 13.3333 18.3333H6.66666C3.74999 18.3333 2.5 16.6667 2.5 14.1667V7.08334C2.5 4.58334 3.74999 2.91667 6.66666 2.91667H13.3333C16.25 2.91667 17.5 4.58334 17.5 7.08334Z" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Dollar Icon component
const DollarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.25 10.8333L8.33333 12.9167L13.75 7.5" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Clock Icon component
const ClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.8166 12.575L10.3833 11.1083C9.87499 10.8167 9.45831 10.0333 9.45831 9.44166V6.25" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function LeaseDetails() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [property, setProperty] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [contractStartDate, setContractStartDate] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');
  const [leaseDuration, setLeaseDuration] = useState('');
  const [leaseDurationType, setLeaseDurationType] = useState('months');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { id } = router.query;
  
  // Set up duration type options
  const durationTypes = [
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' },
    { value: 'years', label: 'Years' }
  ];

  // Load property data
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (id) {
      fetchProperty();
    }
  }, [id, user, authLoading, router]);

  // Fetch property data
  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await apiService.properties.getById(id);
      const property = response.data;
      
      // Helper function to clean and format date strings
      const cleanDateString = (dateStr) => {
        if (!dateStr) return '';
        // If the date includes T, Z etc. (ISO format), extract just the date part
        if (dateStr.includes('T')) {
          return dateStr.split('T')[0];
        }
        return dateStr;
      };

      // Helper function to clean deposit amount
      const cleanDepositAmount = (amount) => {
        if (!amount) return '';
        if (typeof amount === 'number' || (typeof amount === 'string' && amount.includes('.'))) {
          return parseInt(amount, 10).toString();
        }
        return amount.toString();
      };
      
      setProperty(property);
      setDepositAmount(cleanDepositAmount(property.deposit_amount));
      setContractStartDate(cleanDateString(property.contract_start_date));
      setContractEndDate(cleanDateString(property.contract_end_date));
      setLeaseDuration(property.lease_duration ? property.lease_duration.toString() : '');
      setLeaseDurationType(property.lease_duration_type || 'months');
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching property:', error);
      setLoading(false);
      router.push('/properties/details?propertyId=' + id);
    }
  };

  // Calculate end date based on start date and lease duration
  const calculateEndDate = () => {
    if (!contractStartDate || !leaseDuration) return '';
    
    const start = new Date(contractStartDate);
    if (isNaN(start.getTime())) return '';
    
    const end = new Date(start);
    if (leaseDurationType === 'weeks') {
      // Add weeks (7 days per week)
      end.setDate(end.getDate() + (parseInt(leaseDuration) * 7));
    } else if (leaseDurationType === 'months') {
      end.setMonth(end.getMonth() + parseInt(leaseDuration));
    } else {
      end.setFullYear(end.getFullYear() + parseInt(leaseDuration));
    }
    
    // Format as YYYY-MM-DD
    return end.toISOString().split('T')[0];
  };

  // Update contract end date when start date, duration, or duration type changes
  useEffect(() => {
    if (contractStartDate && leaseDuration) {
      const newEndDate = calculateEndDate();
      setContractEndDate(newEndDate);
    }
  }, [contractStartDate, leaseDuration, leaseDurationType]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!depositAmount || !contractStartDate || !leaseDuration) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // We need to keep all the required properties from the original property
      // and only update the lease-related fields
      
      // First, ensure we have the current property data
      if (!property) {
        return;
      }
      
      // Create a complete updateData object with all necessary fields
      const updateData = {
        // Keep original required fields
        address: property.address,
        description: property.description,
        role_at_this_property: property.role_at_this_property || 'renter',
        property_type: property.property_type || 'apartment',
        unit_number: property.unit_number,
        
        // Update lease-related fields
        deposit_amount: parseInt(depositAmount, 10),
        contract_start_date: contractStartDate,
        contract_end_date: contractEndDate,
        lease_duration: parseInt(leaseDuration, 10),
        lease_duration_type: leaseDurationType,
        
        // Keep other fields if they exist
        kitchen_count: property.kitchen_count,
        additional_spaces: property.additional_spaces,
        landlord_email: property.landlord_email,
        landlord_phone: property.landlord_phone
      };
      
      console.log('Sending update data:', updateData);
      
      // Update property
      await apiService.properties.update(id, updateData);
      
      // Navigate back to property details
      router.push(`/properties/details?propertyId=${id}`);
    } catch (error) {
      console.error('Error updating lease details:', error);
    } finally {
      setIsSubmitting(false);
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
    <div className="relative w-[390px] h-[844px] mx-auto bg-[#FBF5DA] font-['Nunito'] overflow-hidden">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#FBF5DA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <title>Update Lease Details - DepositShield</title>
        <style jsx global>{`
          @media (max-width: 390px) {
            .lease-details-container {
              width: 100% !important;
              height: 100vh !important;
            }
          }
          
          @media (min-height: 844px) {
            .lease-details-container {
              height: 100vh !important;
            }
          }
          
          .input-no-spinners::-webkit-outer-spin-button,
          .input-no-spinners::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          
          .input-no-spinners {
            -moz-appearance: textfield;
          }
        `}</style>
      </Head>
      
      {/* Status Bar */}
      <div className="absolute w-[390px] h-[40px] left-0 top-0"></div>
      
      {/* Header */}
      <div className="absolute w-[390px] h-[65px] left-0 top-[40px] flex flex-col">
        <div className="flex flex-row justify-center items-center p-[20px_10px] w-[390px] h-[65px]">
          <button 
            className="absolute w-[24px] h-[24px] left-[20px] top-[20.5px]"
            onClick={() => router.push(`/properties/details?propertyId=${id}`)}
            aria-label="Go back"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="w-[270px] h-[25px] font-semibold text-[18px] leading-[25px] text-center text-[#0B1420]">
            Update Lease Details
          </h1>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Lease Details Title */}
        <h2 className="absolute w-[121px] h-[22px] left-[20px] top-[121px] font-bold text-[16px] leading-[22px] text-[#0B1420]">
          Lease Details 📂
        </h2>
        
        {/* Lease Duration Section */}
        <div className="absolute w-[350px] h-[83px] left-[20px] top-[167px] flex flex-col gap-[8px]">
          <div className="w-[350px] h-[19px] font-bold text-[14px] leading-[19px] text-[#0B1420]">
            Lease Duration
          </div>
          
          <div className="flex flex-row items-center gap-[16px] w-[350px] h-[56px]">
            {/* Duration Input */}
            <div className="box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-[167px] h-[56px] bg-white border border-[#D1E7D5] rounded-[16px]">
              <ClockIcon />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={leaseDuration}
                onChange={(e) => setLeaseDuration(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Duration"
                className="w-[99px] h-[19px] font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none input-no-spinners"
                required
              />
            </div>
            
            {/* Duration Type Select */}
            <div className="box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-[167px] h-[56px] bg-white border border-[#D1E7D5] rounded-[16px]">
              <ClockIcon />
              <select
                value={leaseDurationType}
                onChange={(e) => setLeaseDurationType(e.target.value)}
                className="w-[99px] h-[19px] font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none appearance-none"
              >
                {durationTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-[30px]">
                <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.6666 1.16667L5.99998 5.83334L1.33331 1.16667" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contract Start Date */}
        <div onClick={() => document.getElementById('contract-start-date').showPicker()} 
            className="absolute box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-[350px] h-[56px] left-[20px] top-[266px] bg-white border border-[#D1E7D5] rounded-[16px] cursor-pointer">
          <CalendarIcon />
          <div className="relative flex-1">
            <div className="text-[#515964] text-[14px] leading-[19px] font-bold w-[282px] h-[19px]">
              {!contractStartDate ? "Lease start date" : contractStartDate}
            </div>
            <input
              type="date"
              id="contract-start-date"
              value={contractStartDate}
              onChange={(e) => setContractStartDate(e.target.value)}
              className="absolute w-full h-full top-0 left-0 opacity-0 z-10 cursor-pointer"
              required
            />
          </div>
        </div>
        
        {/* Contract End Date (Move out Date) */}
        <div className="absolute w-[350px] h-[83px] left-[20px] top-[338px] flex flex-col gap-[8px]">
          <div className="w-[350px] h-[19px] font-bold text-[14px] leading-[19px] text-[#0B1420]">
            Move out Date
          </div>
          <div className="box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-[350px] h-[56px] bg-white border border-[#D1E7D5] rounded-[16px]">
            <CalendarIcon />
            <div className="w-[282px] h-[19px] font-bold text-[14px] leading-[19px] text-[#515964]">
              {contractEndDate || "Will be calculated"}
            </div>
          </div>
        </div>
        
        {/* Deposit Amount */}
        <div className="absolute w-[350px] h-[83px] left-[20px] top-[437px] flex flex-col gap-[8px]">
          <div className="w-[350px] h-[19px] font-bold text-[14px] leading-[19px] text-[#0B1420]">
            Deposit Amount
          </div>
          <div className="box-border flex flex-row items-center p-[18px_20px] gap-[8px] w-[350px] h-[56px] bg-white border border-[#D1E7D5] rounded-[16px]">
            <DollarIcon />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Deposit amount"
              className="w-[254px] h-[19px] font-bold text-[14px] leading-[19px] text-[#515964] bg-transparent border-none outline-none input-no-spinners"
              required
            />
          </div>
        </div>
        
        {/* Upload Lease Document Button */}
        <div className="absolute box-border flex flex-row justify-center items-center p-[16px_20px] gap-[8px] w-[350px] h-[83px] left-[20px] top-[550px] bg-white border border-dashed border-[#D1E7D5] rounded-[16px]">
          <div className="flex flex-col justify-center items-center gap-[8px] w-[105px] h-[51px]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 17V11L7 13" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 11L11 13" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 10V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2H14" stroke="#515964" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 10H18C15 10 14 9 14 6V2L22 10Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="w-[105px] h-[19px] font-bold text-[14px] leading-[19px] text-center text-[#515964]">
              lease-2025-.pdf
            </span>
          </div>
        </div>
        
        {/* Save Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="absolute flex flex-row justify-center items-center p-[18px_147px] gap-[10px] w-[350px] h-[56px] left-[20px] top-[748px] bg-[#1C2C40] rounded-[16px]"
        >
          <span className="w-[40px] h-[22px] font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
            {isSubmitting ? 'Saving...' : 'Save'}
          </span>
        </button>
      </form>
    </div>
  );
}