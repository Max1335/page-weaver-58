import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const AdminScrapingPanel = () => {
  const { toast } = useToast();
  const [isScraping, setIsScraping] = useState(false);

  // Fetch scraping logs
  const { data: logs, refetch } = useQuery({
    queryKey: ['scraping-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scraping_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const handleScrape = async (source: 'work.ua' | 'robota.ua' | 'dou.ua' | 'all') => {
    setIsScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-vacancies', {
        body: { source },
      });

      if (error) throw error;

      toast({
        title: 'Scraping розпочато',
        description: `Завантаження вакансій з ${source}...`,
      });

      // Refetch logs after a delay
      setTimeout(() => {
        refetch();
      }, 2000);
    } catch (error) {
      console.error('Error triggering scraping:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося запустити scraping',
        variant: 'destructive',
      });
    } finally {
      setIsScraping(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ручне оновлення вакансій</CardTitle>
          <CardDescription>
            Запустіть scraping вакансій з обраних джерел
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => handleScrape('work.ua')}
              disabled={isScraping}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isScraping ? 'animate-spin' : ''}`} />
              work.ua
            </Button>
            <Button
              onClick={() => handleScrape('robota.ua')}
              disabled={isScraping}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isScraping ? 'animate-spin' : ''}`} />
              robota.ua
            </Button>
            <Button
              onClick={() => handleScrape('dou.ua')}
              disabled={isScraping}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isScraping ? 'animate-spin' : ''}`} />
              dou.ua
            </Button>
            <Button
              onClick={() => handleScrape('all')}
              disabled={isScraping}
              variant="default"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isScraping ? 'animate-spin' : ''}`} />
              Всі джерела
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Історія Scraping</CardTitle>
          <CardDescription>Останні 10 запусків scraping</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs?.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(log.status)}
                  <div>
                    <div className="font-medium">{log.source}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(log.started_at).toLocaleString('uk-UA')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {log.status === 'completed' && (
                      <>
                        +{log.vacancies_added} нових, ~{log.vacancies_updated} оновлено
                      </>
                    )}
                    {log.status === 'failed' && (
                      <span className="text-red-500">Помилка</span>
                    )}
                    {log.status === 'in_progress' && (
                      <span className="text-yellow-500">В процесі...</span>
                    )}
                  </div>
                  {log.status === 'completed' && (
                    <div className="text-xs text-muted-foreground">
                      Знайдено: {log.vacancies_found}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {!logs || logs.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Історія scraping порожня
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};