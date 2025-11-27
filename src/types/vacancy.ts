export type EmploymentType = 'full-time' | 'part-time' | 'temporary' | 'contract' | 'internship';
export type ExperienceLevel = 'no-experience' | '1-year' | '1-5-years' | '5-10-years' | '10-plus-years';
export type Source = 'work.ua' | 'robota.ua' | 'dou.ua' | 'other';
export type DateFilter = 'last_24h' | 'last_3_days' | 'last_week' | 'last_month';
export type SortOption = 'date_desc' | 'date_asc' | 'salary_desc' | 'salary_asc';

export interface Vacancy {
  id: string;
  title: string;
  company_name: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  employment_type: EmploymentType;
  experience_required: ExperienceLevel;
  short_description: string;
  full_description: string;
  source: Source;
  source_url: string;
  posted_date: string;
  is_active: boolean;
}

export interface SearchFilters {
  search: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  employmentTypes: EmploymentType[];
  experienceLevels: ExperienceLevel[];
  datePosted?: DateFilter;
  sources: Source[];
  companies: string[];
  sortBy: SortOption;
}
