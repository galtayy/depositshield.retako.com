import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import Layout from '../components/Layout';
import { apiService } from '../lib/api';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    properties: 0,
    reports: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      // Kullanıcı girişi yapıldığında verileri yükle
      fetchDashboardData();
    }
  }, [user]);

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
      let properties = [];
      try {
        console.log('Fetching properties from', `${apiUrl}/api/properties`);
        const propertiesResponse = await axios.get(`${apiUrl}/api/properties`, { headers });
        properties = propertiesResponse.data || [];
        console.log(`Loaded ${properties.length} properties`);
      } catch (propError) {
        console.error('Failed to load properties:', propError);
        properties = [];
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
        properties: properties.length,
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
        if (properties && properties.length > 0) {
          // Add most recent property
          activities.push({
            id: `property-${properties[0].id || 2}`,
            type: 'add_property',
            title: 'Added new property',
            description: properties[0].address || 'Property Address',
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
      <div className="flex justify-center items-center min-h-screen bg-background dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-primary-light"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login page
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Banner - Daha modern tasarım */}
        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl p-8 mb-10 shadow-lg overflow-hidden relative">
          <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-white/10 -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute left-10 bottom-0 w-32 h-32 rounded-full bg-white/10 -mb-10 blur-2xl"></div>
          
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white tracking-tight">Welcome back, {user.name}</h1>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">Manage your properties and document their condition with detailed reports and high-quality photos.</p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/properties/new" className="btn bg-white text-blue-600 hover:bg-blue-50 rounded-xl shadow-md font-medium py-3 px-6 flex items-center transition-all">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Property
              </Link>
              
              <Link href="/reports/new" className="btn bg-indigo-700 bg-opacity-50 text-white hover:bg-opacity-70 rounded-xl shadow-md font-medium py-3 px-6 flex items-center border border-white/20 backdrop-blur-sm transition-all">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Create New Report
              </Link>
            </div>
          </div>
        </div>
        
        {/* Stats Cards - Modern Tasarım */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Properties Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full -mt-8 -mr-8 opacity-70"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 rounded-xl p-3 mr-4">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Properties</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your real estate</p>
                </div>
              </div>
              
              <div className="my-6">
                <div className="flex items-baseline">
                  <p className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.properties}</p>
                  <p className="ml-2 text-gray-500 dark:text-gray-400">total</p>
                  
                  {stats.properties > 0 && (
                    <span className="ml-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      Active
                    </span>
                  )}
                </div>
              </div>
              
              <Link 
                href="/properties" 
                className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
              >
                View all properties
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          
          {/* Reports Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full -mt-8 -mr-8 opacity-70"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 rounded-xl p-3 mr-4">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reports</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Document property conditions</p>
                </div>
              </div>
              
              <div className="my-6">
                <div className="flex items-baseline">
                  <p className="text-4xl font-extrabold text-purple-600 dark:text-purple-400">{stats.reports}</p>
                  <p className="ml-2 text-gray-500 dark:text-gray-400">total</p>
                  
                  {stats.reports > 0 && (
                    <span className="ml-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      Created
                    </span>
                  )}
                </div>
              </div>
              
              <Link 
                href="/reports" 
                className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium transition-colors"
              >
                View all reports
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Recent Activity and Quick Actions - Modern Tasarım */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center mb-6">
                <svg className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Activity
              </h2>
              
              {recentActivity.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No recent activities yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-start p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-all duration-200 hover:shadow-md">
                      <ActivityIcon type={activity.icon} />
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <p className="text-gray-900 dark:text-white font-medium">{activity.title}</p>
                          <span className="text-gray-500 dark:text-gray-400 text-xs">{activity.time}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-right">
                <Link href="/activity" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors">
                  View all activity
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center mb-6">
                <svg className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h2>
              
              <div className="space-y-4">
                <Link href="/properties/new" className="flex items-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl transition-all duration-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 group">
                  <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-lg p-3 mr-4 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-gray-900 dark:text-white font-medium block">Add New Property</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Register a new real estate</span>
                  </div>
                </Link>
                
                <Link href="/reports/new" className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl transition-all duration-200 hover:bg-purple-100 dark:hover:bg-purple-900/30 group">
                  <div className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-lg p-3 mr-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-gray-900 dark:text-white font-medium block">Create New Report</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Document property condition</span>
                  </div>
                </Link>
                
                <Link href="/reports/shared" className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl transition-all duration-200 hover:bg-green-100 dark:hover:bg-green-900/30 group">
                  <div className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg p-3 mr-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-gray-900 dark:text-white font-medium block">Share Reports</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Share with tenants or landlords</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}