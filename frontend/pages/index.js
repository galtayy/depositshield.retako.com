import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { toast } from 'react-toastify';
import { useAuth } from '../lib/auth';
import { apiService } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

// Improved Menu Icon component
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="18" height="2" rx="1" fill="#1C2C40"/>
    <rect x="2" y="10" width="18" height="2" rx="1" fill="#1C2C40"/>
    <rect x="2" y="15" width="18" height="2" rx="1" fill="#1C2C40"/>
  </svg>
);

// PNG ikonları kullanıyoruz, SVG bileşenleri artık gerekli değil

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    properties: 0,
    reports: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [properties, setProperties] = useState([]);
  const [showSideMenu, setShowSideMenu] = useState(false); // Default olarak kapalı
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const sideMenuRef = useRef(null);
  const bottomSheetRef = useRef(null);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
    } else if (user) {
      // Check if this is a newly verified user that should be redirected to onboarding
      const isNewlyVerified = localStorage.getItem('newlyVerified') === 'true';
      if (isNewlyVerified) {
        // Clear the flag and redirect to onboarding
        localStorage.removeItem('newlyVerified');
        router.push('/onboarding');
      } else {
        // Regular user, just make sure menu is closed
        setShowSideMenu(false);
      }
    }
  }, [user, loading, router]);
  
  // Close side menu and bottom sheet when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // No need to check sideMenuRef here since we handle this with the backdrop click
      
      // Only handle bottom sheet clicks
      if (bottomSheetRef.current && !bottomSheetRef.current.contains(event.target) && showBottomSheet) {
        setShowBottomSheet(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [bottomSheetRef, showBottomSheet]);
  
  // Handle menu closing with AnimatePresence
  const closeMenu = () => {
    // With AnimatePresence, we can simply set the state directly
    // The exit animation will be handled automatically
    setShowSideMenu(false);
  };

  useEffect(() => {
    if (user) {
      // Kullanıcı girişi yapıldığında verileri yükle
      fetchDashboardData();
    }
  }, [user]);
  
  // İlk giriş yaptığında, eğer hiç mülk yoksa direkt olarak addunit sayfasına yönlendir
  useEffect(() => {
    // İlk render'da değil, veri yüklendiğinde ve properties'in 0 olduğu durumda
    if (!loading && properties.length === 0 && stats.properties === 0 && user) {
      // Ancak doğrudan gelinen sayfa properties ise (direkt URL'den giriş yapıldıysa)
      const isDirectNavigation = typeof window !== 'undefined' && 
        window.performance?.navigation?.type === window.performance?.navigation?.TYPE_NAVIGATE;
      
      // Otomatik yönlendirme yapmayı burada devre dışı bırakıyoruz, çünkü kullanıcı
      // zaten doğrudan properties/addunit'e gitmiş olacak
      
      // Debugger amaçlı yönlendirme görünümü
      console.log("Properties length:", properties.length);
      console.log("Stats properties:", stats.properties);
    }
  }, [loading, properties, stats.properties, user, router]);

  // Mülk silme fonksiyonu
  const deleteProperty = async (e, propertyId) => {
    // Event yayılmasını engelle
    e.stopPropagation();

    // Silme işlemini onaylama
    if (confirm('Bu mülkü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        // API üzerinden silme işlemi
        const token = localStorage.getItem('token');

        if (!token) {
          toast.error('Oturum doğrulanmadı');
          return;
        }

        const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : false;
        const apiUrl = isProduction ? 'https://api.depositshield.retako.com' : 'http://localhost:5050';

        try {
          // API'ye silme isteği gönder
          const axios = (await import('axios')).default;
          await axios.delete(`${apiUrl}/api/properties/${propertyId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Başarılı silme durumunda state'i güncelle
          setProperties(properties.filter(prop => prop.id !== propertyId));
          setStats(prev => ({ ...prev, properties: prev.properties - 1 }));

          toast.success('Mülk başarıyla silindi');
        } catch (apiError) {
          console.error('API silme hatası:', apiError);

          // API hatası durumunda yine de UI'dan kaldır
          setProperties(properties.filter(prop => prop.id !== propertyId));
          toast.success('Mülk yerel olarak silindi');
        }
      } catch (error) {
        console.error('Mülk silme hatası:', error);
        toast.error('Mülk silinirken bir hata oluştu');
      }
    }
  };

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      
      // doğrudan API URL'sini kullanarak veri çekelim
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
      console.log('Using API URL:', apiUrl);
      
      // Properties verisini çek
      let propertiesList = [];
      try {
        console.log('Fetching properties from', `${apiUrl}/api/properties`);
        const propertiesResponse = await axios.get(`${apiUrl}/api/properties`, { headers });
        propertiesList = propertiesResponse.data || [];
        console.log(`Loaded ${propertiesList.length} properties`);
        
        // Mülkleri state'e kaydet
        setProperties(propertiesList);
      } catch (propError) {
        console.error('Failed to load properties:', propError);
        propertiesList = [];
      }
      
      // Reports verisini çek
      let reports = [];
      try {
        console.log('Fetching reports from', `${apiUrl}/api/reports`);
        const reportsResponse = await axios.get(`${apiUrl}/api/reports`, { headers });
        reports = reportsResponse.data || [];
        console.log(`Loaded ${reports.length} reports`);
      } catch (reportError) {
        console.error('Failed to load reports:', reportError);
        reports = [];
      }
      
      // İstatistikleri güncelle
      setStats({
        properties: propertiesList.length,
        reports: reports.length
      });
      
      // Aktiviteleri oluştur
      try {
        const activities = [];
        
        // Report activity
        if (reports && reports.length > 0) {
          // Sort by date (newest first)
          reports.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          
          // Add most recent report
          activities.push({
            id: `report-${reports[0].id || 1}`,
            type: 'create_report',
            title: 'Created new report',
            description: reports[0].title ? 
              `${reports[0].type || 'Report'}: ${reports[0].title}` : 
              'Property Report',
            time: '2 hours ago',
            icon: 'report'
          });
        }
        
        // Property activity
        if (propertiesList && propertiesList.length > 0) {
          // Add most recent property
          activities.push({
            id: `property-${propertiesList[0].id || 2}`,
            type: 'add_property',
            title: 'Added new property',
            description: propertiesList[0].address || 'Property Address',
            time: '3 days ago',
            icon: 'property'
          });
        }
        
        // Fallback for empty activities
        if (activities.length === 0) {
          activities.push({
            id: 'welcome-1',
            type: 'system',
            title: 'System Message',
            description: 'Welcome to DepositShield',
            time: 'Just now',
            icon: 'report'
          });
        }
        
        setRecentActivity(activities);
        console.log('Recent activities created:', activities.length);
      } catch (activityError) {
        console.error('Error creating activities:', activityError);
        // Simple fallback
        setRecentActivity([{
          id: 'fallback-1',
          type: 'system',
          title: 'System Message',
          description: 'Welcome to DepositShield',
          time: 'Just now',
          icon: 'report'
        }]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Icon component for the activity feed
  const ActivityIcon = ({ type }) => {
    switch (type) {
      case 'report':
        return (
          <div className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 rounded-full p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'property':
        return (
          <div className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 rounded-full p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
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
    <div className="flex flex-col items-center bg-[#FBF5DA] font-['Nunito'] min-h-screen relative overflow-hidden">
      <Head>
        <title>DepositShield - My Home</title>
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
          @keyframes slideIn {
            from {
              transform: translateX(-100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-slideIn {
            animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .side-menu-backdrop {
            background-color: rgba(0, 0, 0, 0.4);
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 30;
            transition: opacity 0.4s;
            opacity: 0;
            animation: fadeIn 0.4s forwards;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes fadeOut {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }
          @keyframes slideOut {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(-100%);
              opacity: 0;
            }
          }
          .animate-slideOut {
            animation: slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
        `}</style>
      </Head>
      
      {/* Side Menu */}
      <AnimatePresence>
        {showSideMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="side-menu-backdrop" 
              onClick={closeMenu}
            />
            <motion.div 
              ref={sideMenuRef}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 40,
                duration: 0.5
              }}
              className={`fixed top-0 left-0 h-full w-[280px] bg-[#F5F6F8] z-40`}
              style={{
                borderRadius: '0px',
                position: 'fixed',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
            {/* Header */}
            <div className="w-full h-[65px] mt-[20px]">
              <div className="flex flex-row justify-center items-center p-[16px] w-full h-[65px] relative">
                <button 
                  className="absolute w-[32px] h-[32px] left-[16px] top-[50%] transform -translate-y-1/2 p-1 bg-gray-100 rounded-full flex items-center justify-center"
                  onClick={closeMenu}
                  aria-label="Go back"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 19L8 12L15 5" stroke="#2E3642" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420]">
                  Menu
                </h1>
              </div>
            </div>
            
            {/* Navigation Menu - Frame 873 */}
            <div className="w-full flex flex-col items-center p-[16px] mt-[10px]">
              {/* Move Out Option */}
              <div className="w-full h-[64px] mb-0 relative">
                <div className="flex flex-row items-center p-[12px_0px] gap-[16px] w-full h-[64px]">
                  <div className="w-[40px] h-[40px] flex items-center justify-center rounded-[225px]">
                    <img src="/images/iconss/moveout.png" alt="Move out" className="w-[40px] h-[40px]" />
                  </div>
                  <Link href="/move-out" className="font-['Nunito'] font-semibold text-[16px] leading-[22px] text-[#111519]">
                    Move out
                  </Link>
                </div>
                <div className="w-full h-0 border-b border-[#ECF0F5]"></div>
              </div>
              
              {/* Password Change Option */}
              <div className="w-full h-[64px] mb-0 relative">
                <div className="flex flex-row items-center p-[12px_0px] gap-[16px] w-full h-[64px]">
                  <div className="w-[40px] h-[40px] flex items-center justify-center rounded-[225px]">
                    <img src="/images/iconss/passwordchange.png" alt="Password Change" className="w-[40px] h-[40px]" />
                  </div>
                  <Link href="/profile/change-password" className="font-['Nunito'] font-semibold text-[16px] leading-[22px] text-[#111519]">
                    Password Change
                  </Link>
                </div>
                <div className="w-full h-0 border-b border-[#ECF0F5]"></div>
              </div>
              
              {/* Support Option */}
              <div className="w-full h-[64px] mb-0 relative">
                <div className="flex flex-row items-center p-[12px_0px] gap-[16px] w-full h-[64px]">
                  <div className="w-[40px] h-[40px] flex items-center justify-center rounded-[225px]">
                    <img src="/images/iconss/24support.png" alt="Support" className="w-[22px] h-[22px]" />
                  </div>
                  <button 
                    onClick={() => console.log('Support functionality not yet implemented')}
                    className="font-['Nunito'] font-semibold text-[16px] leading-[22px] text-[#111519] text-left"
                  >
                    Support
                  </button>
                </div>
                <div className="w-full h-0 border-b border-[#ECF0F5]"></div>
              </div>
              
              {/* Logout Option */}
              <div className="w-full h-[64px] mb-0 relative">
                <div className="flex flex-row items-center p-[12px_0px] gap-[16px] w-full h-[64px]">
                  <div className="w-[40px] h-[40px] flex items-center justify-center rounded-[225px]">
                    <img src="/images/iconss/logout.png" alt="Logout" className="w-[22px] h-[22px]" />
                  </div>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('token');
                      router.push('/login');
                    }}
                    className="font-['Nunito'] font-semibold text-[16px] leading-[22px] text-[#111519] text-left"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <div className="w-full max-w-[390px] relative">
        {/* Status Bar Space */}
        <div className="h-[40px] w-full safe-area-top"></div>
        
        {/* Header */}
        <div className="w-full h-[65px]">
          <div className="flex flex-row justify-center items-center px-[10px] py-[20px] w-full h-[65px] relative">
            <button 
              className="absolute left-[20px] top-[50%] transform -translate-y-1/2 z-10"
              onClick={() => setShowSideMenu(true)}
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>
            <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420]">
              My Home
            </h1>
          </div>
        </div>
      
        {/* Main Content */}
        <div className="w-full px-4">
          {properties.length === 0 ? (
            // Empty state when no properties exist
            <div className="w-full flex flex-col justify-end items-center gap-[20px] mb-8">
              <div className="w-[248.82px] h-[135.29px] mt-[10px]">
                <img
                  src="/images/dashboard.png"
                  alt="Home illustration"
                  className="w-full h-full object-contain"
                  style={{ mixBlendMode: 'Luminosity' }}
                  loading="eager"
                />
              </div>

              <p className="w-full max-w-[311px] font-bold text-[16px] leading-[22px] text-center text-[#515964]">
                Add the place you're renting so we can help protect your deposit.
              </p>
            </div>
          ) : (
            // Property list view
            <div className="w-full">
              <h2 className="font-bold text-[16px] leading-[22px] text-[#0B1420] mb-4">
                Your Properties
              </h2>

              <div className="flex flex-col gap-[10px] w-full mb-6">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="w-full p-[16px] bg-white border border-[#D1E7D5] rounded-[16px] cursor-pointer relative active:bg-gray-50 transition-colors touch-manipulation"
                    onClick={() => router.push(`/properties/details?propertyId=${property.id}`)}
                  >
                    {/* Delete Button - improved touch target */}
                    <button
                      className="absolute bottom-[8px] right-[8px] w-[32px] h-[32px] flex items-center justify-center z-10 opacity-80 hover:opacity-100 active:opacity-100 transition-opacity touch-manipulation"
                      onClick={(e) => deleteProperty(e, property.id)}
                      aria-label="Delete property"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 3.98667C11.78 3.76667 9.54667 3.65333 7.32 3.65333C6 3.65333 4.68 3.72 3.36 3.85333L2 3.98667" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5.66669 3.31999L5.81335 2.43999C5.92002 1.80666 6.00002 1.33333 7.12669 1.33333H8.87335C10 1.33333 10.0867 1.83999 10.1867 2.44666L10.3334 3.31999" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12.5667 6.09333L12.1334 12.8067C12.06 13.8533 12 14.6667 10.14 14.6667H5.86002C4.00002 14.6667 3.94002 13.8533 3.86668 12.8067L3.43335 6.09333" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.88669 11H9.10669" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.33331 8.33333H9.66665" stroke="#D14848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

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
          
        {/* Add Property Button - Moved to bottom */}
        <div className="w-full px-4 fixed bottom-0 left-0 right-0 flex flex-col items-center pb-6 pt-4 bg-gradient-to-t from-[#FBF5DA] to-transparent max-w-[390px] mx-auto safe-area-bottom">
          <button
            onClick={() => router.push('/properties/addunit')}
            className="w-full h-[56px] flex flex-row justify-center items-center py-[18px] bg-[#1C2C40] rounded-[16px] active:bg-[#283c56] transition-colors touch-manipulation"
          >
            <span className="font-bold text-[16px] leading-[22px] text-[#D1E7E2]">
              {properties.length > 0 ? 'Add Another Home' : 'Add New Home'}
            </span>
          </button>
          
          {/* Why Add Your Home? text */}
          <button 
            className="mt-3 text-center font-semibold text-[#0B1420] text-sm"
            onClick={() => setShowBottomSheet(true)}
          >
            Why Add Your Home?
          </button>
        </div>
        
        {/* Bottom Sheet */}
        <AnimatePresence>
          {showBottomSheet && (
            <>
              {/* Backdrop overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-40 h-full w-full"
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                onClick={() => setShowBottomSheet(false)}
              />
              
              {/* Bottom sheet */}
              <motion.div
                ref={bottomSheetRef}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="flex flex-col items-center p-0 pb-8 fixed w-full max-w-[390px] h-[318px] left-0 right-0 bottom-0 mx-auto bg-white rounded-t-2xl z-50"
              >
                {/* Drag handle */}
                <div className="flex flex-col items-center p-2.5 w-full">
                  <div className="w-24 h-1.5 bg-[#ECECEC] rounded-3xl" />
                </div>
                
                {/* Content */}
                <div className="flex flex-col items-center gap-4 px-8">
                  {/* Icon - Container with background */}
                  <div className="w-20 h-20 relative bg-[#FFF6ED] rounded-full flex items-center justify-center overflow-hidden">
                    {/* PNG görselinizi buraya ekleyebilirsiniz */}
                    <img 
                      src="/images/home.png"
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        // Fallback if image doesn't load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    {/* Fallback icon if image fails to load */}
                    <div style={{display: 'none'}} className="text-[#55A363] text-4xl">
                      🏠
                    </div>
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex flex-col items-center gap-1">
                    <h2 className="font-bold text-lg text-center text-[#0B1420]">
                      Why Add Your Home?
                    </h2>
                    <p className="font-normal text-sm text-center text-[#2E3642] mt-1">
                      Adding your home creates a private, time-stamped record that protects your deposit like a digital receipt for move-in day.
                    </p>
                  </div>
                  
                  {/* Close Button */}
                  <button
                    onClick={() => setShowBottomSheet(false)}
                    className="mt-4 w-full h-[56px] flex justify-center items-center bg-[#1C2C40] rounded-[16px]"
                  >
                    <span className="font-bold text-[16px] text-[#D1E7E2]">
                      Got it
                    </span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}