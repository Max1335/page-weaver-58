import { Building2, MapPin, Calendar, Briefcase, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Vacancy } from '@/types/vacancy';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface VacancyCardProps {
  vacancy: Vacancy;
}

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

export const VacancyCard = ({ vacancy }: VacancyCardProps) => {
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

  return (
    <Link to={`/vacancy/${vacancy.id}`}>
      <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer bg-gradient-card border-border">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors">
              {vacancy.title}
            </h3>
            <Badge className={`${sourceColors[vacancy.source]} text-white flex-shrink-0`}>
              {vacancy.source}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-lg font-medium text-accent">
            <span>{formattedSalary}</span>
          </div>

          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            {vacancy.short_description}
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <Briefcase className="h-3 w-3" />
              {experienceLabels[vacancy.experience_required]}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {employmentTypeLabels[vacancy.employment_type]}
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-border">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{vacancy.company_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{vacancy.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
