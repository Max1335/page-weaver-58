import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Building2, MapPin, Calendar, Briefcase, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { useVacancyById } from '@/hooks/useVacancies';

const employmentTypeLabels: Record<string, string> = {
  'full-time': 'Повна зайнятість',
  'part-time': 'Часткова зайнятість',
  'temporary': 'Тимчасова',
  'contract': 'Контракт',
  'internship': 'Стажування',
};

const experienceLabels: Record<string, string> = {
  'no-experience': 'Без досвіду',
  '1-year': 'До 1 року',
  '1-5-years': '1-5 років',
  '5-10-years': '5-10 років',
  '10-plus-years': 'Більше 10 років',
};

const sourceColors: Record<string, string> = {
  'work.ua': 'bg-blue-500',
  'robota.ua': 'bg-green-500',
  'dou.ua': 'bg-orange-500',
  'other': 'bg-gray-500',
};

const VacancyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: vacancy, isLoading } = useVacancyById(id!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold">Завантаження...</h2>
        </div>
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Вакансію не знайдено</h1>
          <Button onClick={() => navigate('/')}>Повернутися до пошуку</Button>
        </div>
      </div>
    );
  }

  const formattedDate = formatDistanceToNow(new Date(vacancy.posted_date), {
    addSuffix: true,
    locale: uk,
  });

  const formattedSalary =
    vacancy.salary_min && vacancy.salary_max
      ? `${vacancy.salary_min.toLocaleString()} - ${vacancy.salary_max.toLocaleString()} ${vacancy.salary_currency}`
      : vacancy.salary_min
      ? `Від ${vacancy.salary_min.toLocaleString()} ${vacancy.salary_currency}`
      : 'За домовленістю';

  const handleApply = () => {
    window.open(vacancy.source_url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-white py-8 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10 mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Повернутися до результатів
          </Button>
          <div className="flex items-center gap-2 text-sm text-blue-100 mb-2">
            <span>Головна</span>
            <span>/</span>
            <span>Вакансії</span>
            <span>/</span>
            <span className="text-white">{vacancy.title}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 shadow-lg border-border">
          {/* Title and Salary */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4 text-foreground">{vacancy.title}</h1>
            <div className="text-2xl font-semibold text-accent mb-6">{formattedSalary}</div>
          </div>

          {/* Company Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">Компанія</div>
                <div className="font-medium text-lg">{vacancy.company_name}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground">Локація</div>
                <div className="font-medium text-lg">{vacancy.location}</div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Опубліковано {formattedDate}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Badge variant="secondary" className="gap-1">
              <Briefcase className="h-3 w-3" />
              {experienceLabels[vacancy.experience_required]}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {employmentTypeLabels[vacancy.employment_type]}
            </Badge>
            <Badge className={`${sourceColors[vacancy.source]} text-white`}>
              {vacancy.source}
            </Badge>
          </div>

          <Separator className="my-8" />

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Опис вакансії</h2>
            <div
              className="prose prose-blue max-w-none"
              dangerouslySetInnerHTML={{ __html: vacancy.full_description }}
              style={{
                lineHeight: '1.75',
              }}
            />
          </div>

          {/* Apply Button */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
            <Button
              onClick={handleApply}
              size="lg"
              className="bg-gradient-hero hover:opacity-90 gap-2 flex-1"
            >
              Відгукнутися на вакансію
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад до пошуку
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VacancyDetail;
