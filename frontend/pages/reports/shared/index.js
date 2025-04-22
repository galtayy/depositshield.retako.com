import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { useAuth } from '../../../lib/auth';
import { apiService } from '../../../lib/api';

export default function SharedReportsIndex() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    fetchReports();
  }, [user, authLoading, router]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // API'den paylaşılan raporları al
      // Bu endpoint'i API'ye eklemek gerekebilir - şimdilik tüm raporları kullanalım
      const response = await apiService.reports.getAll();
      setReports(response.data || []);
    } catch (error) {
      console.error('Error fetching shared reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Report type badge
  const getReportTypeBadge = (type) => {
    switch (type) {
      case 'move-in':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Pre-Move-In</span>;
      case 'move-out':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Post-Move-Out</span>;
      case 'general':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">General</span>;
      default:
        return null;
    }
  };

  // Paylaşım linki oluştur
  const getShareLink = (report) => {
    if (!report || !report.uuid) return '#';
    return `${window.location.origin}/reports/shared/${report.uuid}`;
  };

  // Paylaşım linkini kopyala
  const copyShareLink = (report) => {
    const link = getShareLink(report);
    navigator.clipboard.writeText(link).then(() => {
      // Kullanıcıya başarılı bir şekilde kopyalandığını bildir
      alert('Share link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy link: ', err);
    });
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Shared Reports</h1>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Shared Reports</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">You have no reports to share yet.</p>
            <Link href="/reports/new" className="btn btn-primary">
              Create a Report
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(report => (
              <div key={report.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-semibold">{report.title}</h2>
                        {getReportTypeBadge(report.type)}
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        {new Date(report.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      
                      <p className="text-gray-700 dark:text-gray-300">{report.address}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyShareLink(report)}
                        className="btn btn-secondary flex items-center text-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Copy Link
                      </button>
                      
                      <Link
                        href={`/reports/${report.id}`}
                        className="btn btn-primary flex items-center text-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </Link>
                    </div>
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
