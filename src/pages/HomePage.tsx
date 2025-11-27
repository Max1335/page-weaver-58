import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { FilterSidebar } from '@/components/FilterSidebar';
import { VacancyCard } from '@/components/VacancyCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Filter, Briefcase, RefreshCw } from 'lucide-react';
import { SearchFilters, SortOption, EmploymentType, ExperienceLevel, Source, DateFilter } from '@/types/vacancy';
import { useVacancies, useTriggerScraping } from '@/hooks/useVacancies';
import { useToast } from '@/hooks/use-toast';

const HomePage = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    location: '',
    employmentTypes: [],
    experienceLevels: [],
    sources: [],
    companies: [],
    sortBy: 'date_desc',
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  const { data: vacancies = [], isLoading, refetch } = useVacancies(filters);
  const triggerScraping = useTriggerScraping();

  const handleScrapingTrigger = async () => {
    setIsScraping(true);
    try {
      await triggerScraping('all');
      toast({
        title: 'Оновлення розпочато',
        description: 'Завантаження нових вакансій може зайняти кілька хвилин',
      });
      
      // Refetch after a delay to get new data
      setTimeout(() => {
        refetch();
        toast({
          title: 'Вакансії оновлено',
          description: 'Список вакансій успішно оновлено',
        });
      }, 5000);
    } catch (error) {
      console.error('Error triggering scraping:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося оновити вакансії',
        variant: 'destructive',
      });
    } finally {
      setIsScraping(false);
    }
  };

  const activeFilterCount =
    (filters.salaryMin ? 1 : 0) +
    (filters.salaryMax ? 1 : 0) +
    filters.employmentTypes.length +
    filters.experienceLevels.length +
    (filters.datePosted ? 1 : 0) +
    filters.sources.length;

  const clearFilters = () => {
    setFilters({
      search: filters.search,
      location: filters.location,
      employmentTypes: [],
      experienceLevels: [],
      sources: [],
      companies: [],
      sortBy: filters.sortBy,
    });
  };

  const FilterContent = () => (
    <FilterSidebar
      salaryMin={filters.salaryMin}
      salaryMax={filters.salaryMax}
      employmentTypes={filters.employmentTypes}
      experienceLevels={filters.experienceLevels}
      datePosted={filters.datePosted}
      sources={filters.sources}
      onSalaryMinChange={(value) => setFilters({ ...filters, salaryMin: value })}
      onSalaryMaxChange={(value) => setFilters({ ...filters, salaryMax: value })}
      onEmploymentTypeToggle={(type) => {
        const newTypes = filters.employmentTypes.includes(type)
          ? filters.employmentTypes.filter((t) => t !== type)
          : [...filters.employmentTypes, type];
        setFilters({ ...filters, employmentTypes: newTypes });
      }}
      onExperienceLevelToggle={(level) => {
        const newLevels = filters.experienceLevels.includes(level)
          ? filters.experienceLevels.filter((l) => l !== level)
          : [...filters.experienceLevels, level];
        setFilters({ ...filters, experienceLevels: newLevels });
      }}
      onDatePostedChange={(dateFilter) => setFilters({ ...filters, datePosted: dateFilter })}
      onSourceToggle={(source) => {
        const newSources = filters.sources.includes(source)
          ? filters.sources.filter((s) => s !== source)
          : [...filters.sources, source];
        setFilters({ ...filters, sources: newSources });
      }}
      onClearFilters={clearFilters}
      activeFilterCount={activeFilterCount}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-white py-12 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-4xl font-bold">Робота в Україні</h1>
          </div>
          <p className="text-xl text-blue-50 mb-8">
            Знайдіть роботу своєї мрії серед тисяч актуальних вакансій
          </p>
          <SearchBar
            searchTerm={filters.search}
            location={filters.location}
            onSearchChange={(value) => setFilters({ ...filters, search: value })}
            onLocationChange={(value) => setFilters({ ...filters, location: value })}
            onSearch={() => refetch()}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-6 bg-card rounded-lg shadow-md p-6 border border-border">
              <FilterContent />
            </div>
          </aside>

          {/* Vacancy List */}
          <main className="flex-1 min-w-0">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <p className="text-lg font-medium">
                  Знайдено <span className="text-primary font-bold">{vacancies.length}</span> вакансій
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleScrapingTrigger}
                  disabled={isScraping}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isScraping ? 'animate-spin' : ''}`} />
                  {isScraping ? 'Оновлення...' : 'Оновити'}
                </Button>
                {/* Mobile Filter Button */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden gap-2">
                      <Filter className="h-4 w-4" />
                      Фільтри
                      {activeFilterCount > 0 && (
                        <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <div className="pt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <Select
                value={filters.sortBy}
                onValueChange={(value) => setFilters({ ...filters, sortBy: value as SortOption })}
              >
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Сортувати за" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">Датою (нові-старі)</SelectItem>
                  <SelectItem value="date_asc">Датою (старі-нові)</SelectItem>
                  <SelectItem value="salary_desc">Зарплатою (спадання)</SelectItem>
                  <SelectItem value="salary_asc">Зарплатою (зростання)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vacancy Cards */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Завантаження...</h3>
                  <p className="text-muted-foreground">Зачекайте, будь ласка</p>
                </div>
              ) : vacancies.length > 0 ? (
                vacancies.map((vacancy) => (
                  <VacancyCard key={vacancy.id} vacancy={vacancy} />
                ))
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Не знайдено вакансій</h3>
                  <p className="text-muted-foreground mb-6">
                    Спробуйте змінити параметри пошуку або фільтри
                  </p>
                  {activeFilterCount > 0 && (
                    <Button onClick={clearFilters} variant="outline">
                      Очистити всі фільтри
                    </Button>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
