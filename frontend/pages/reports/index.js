import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { apiService } from '../../lib/api';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'landlord', 'renter'
  const router = useRouter();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await apiService.reports.getAll();
      setReports(response.data);
    } catch (error) {
      console.error('Reports fetch error:', error);
      toast.error('An error occurred while loading the report list.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        await apiService.reports.delete(id);
        toast.success('Report successfully deleted.');
        fetchReports(); // Refresh reports
      } catch (error) {
        console.error('Report delete error:', error);
        toast.error('An error occurred while deleting the report.');
      }
    }
  };

  // Report type badge
  const getReportTypeBadge = (type) => {
    switch (type) {
      case 'move-in':
        return <span className="badge badge-move-in">Pre-Move-In</span>;
      case 'move-out':
        return <span className="badge badge-move-out">Post-Move-Out</span>;
      case 'general':
        return <span className="badge badge-general">General</span>;
      default:
        return null;
    }
  };

  // Helper function to display role badge
  const getRoleBadge = (role) => {
    if (role === 'landlord') {
      return <span className="badge badge-landlord">Landlord</span>;
    } else if (role === 'renter') {
      return <span className="badge badge-tenant">Tenant</span>;
    } else {
      return <span className="badge badge-other">Other</span>;
    }
  };

  // Filtering
  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(report => report.property?.role_at_this_property === filter);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">My Reports</h1>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-primary-light"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">My Reports</h1>
          <Link href="/reports/new" className="btn btn-primary btn-elevated">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Report
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white dark:bg-primary-light dark:text-gray-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Reports
            </button>
            <button
              onClick={() => setFilter('landlord')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'landlord'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Landlord Reports
            </button>
            <button
              onClick={() => setFilter('renter')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'renter'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Tenant Reports
            </button>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="empty-state-title">No reports created yet</h3>
            <p className="empty-state-description">
              You can create reports to document the condition of your properties.
            </p>
            <Link href="/reports/new" className="btn btn-primary btn-elevated">
              Create Your First Report
            </Link>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="empty-state-title">No reports found for this filter</h3>
            <p className="empty-state-description">
              There are no reports matching the selected filter criteria.
            </p>
            <button onClick={() => setFilter('all')} className="btn btn-primary btn-elevated">
              Show All Reports
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 hover-card">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="font-semibold text-lg">{report.title}</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                          {new Date(report.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col md:flex-row items-end md:items-start space-y-2 md:space-y-0 md:space-x-2">
                        {getReportTypeBadge(report.type)}
                        {report.property && getRoleBadge(report.property.role_at_this_property)}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mt-2 mb-3 line-clamp-2">
                      {report.description || 'No description available.'}
                    </p>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{report.property?.address || 'Unknown address'}</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center mt-4 md:mt-0 md:ml-6 space-x-2">
                    <button
                      onClick={() => router.push(`/reports/${report.id}`)}
                      className="btn btn-primary px-4 py-2 text-sm flex-shrink-0"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                    
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                      aria-label="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
