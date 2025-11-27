import { AdminScrapingPanel } from '@/components/AdminScrapingPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-white py-8 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10 mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад до головної
          </Button>
          <h1 className="text-4xl font-bold">Адміністрування</h1>
          <p className="text-xl text-blue-50 mt-2">
            Керування вакансіями та scraping
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminScrapingPanel />
      </div>
    </div>
  );
};

export default Admin;