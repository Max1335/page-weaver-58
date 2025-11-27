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
import { Filter, Briefcase } from 'lucide-react';
import { mockVacancies } from '@/data/mockVacancies';
import { SearchFilters, SortOption, EmploymentType, ExperienceLevel, Source, DateFilter } from '@/types/vacancy';

const HomePage = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    location: '',
    employmentTypes: [],
    experienceLevels: [],
    sources: [],
    companies: [],
    sortBy: 'date_desc',
  });

  const [filteredVacancies, setFilteredVacancies] = useState(mockVacancies);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    filterVacancies();
  }, [filters]);

  const filterVacancies = () => {
    let result = [...mockVacancies];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(searchLower) ||
          v.shortDescription.toLowerCase().includes(searchLower) ||
          v.fullDescription.toLowerCase().includes(searchLower)
      );
    }

    // Location filter
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      result = result.filter((v) => v.location.toLowerCase().includes(locationLower));
    }

    // Salary filter
    if (filters.salaryMin) {
      result = result.filter((v) => !v.salaryMax || v.salaryMax >= filters.salaryMin!);
    }
    if (filters.salaryMax) {
      result = result.filter((v) => !v.salaryMin || v.salaryMin <= filters.salaryMax!);
    }

    // Employment type filter
    if (filters.employmentTypes.length > 0) {
      result = result.filter((v) => filters.employmentTypes.includes(v.employmentType));
    }

    // Experience level filter
    if (filters.experienceLevels.length > 0) {
      result = result.filter((v) => filters.experienceLevels.includes(v.experienceRequired));
    }

    // Date filter
    if (filters.datePosted) {
      const now = Date.now();
      const dateThresholds = {
        last_24h: 24 * 60 * 60 * 1000,
        last_3_days: 3 * 24 * 60 * 60 * 1000,
        last_week: 7 * 24 * 60 * 60 * 1000,
        last_month: 30 * 24 * 60 * 60 * 1000,
      };
      const threshold = dateThresholds[filters.datePosted];
      result = result.filter((v) => now - new Date(v.postedDate).getTime() <= threshold);
    }

    // Source filter
    if (filters.sources.length > 0) {
      result = result.filter((v) => filters.sources.includes(v.source));
    }

    // Sorting
    switch (filters.sortBy) {
      case 'date_desc':
        result.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
        break;
      case 'date_asc':
        result.sort((a, b) => new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime());
        break;
      case 'salary_desc':
        result.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
        break;
      case 'salary_asc':
        result.sort((a, b) => (a.salaryMin || Infinity) - (b.salaryMin || Infinity));
        break;
    }

    setFilteredVacancies(result);
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
            <Briefcase className="h-10 w-10" />
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
            onSearch={filterVacancies}
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
                  Знайдено <span className="text-primary font-bold">{filteredVacancies.length}</span> вакансій
                </p>
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
              {filteredVacancies.length > 0 ? (
                filteredVacancies.map((vacancy) => (
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
