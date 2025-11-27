import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SearchFilters } from '@/types/vacancy';

export const useVacancies = (filters: SearchFilters) => {
  return useQuery({
    queryKey: ['vacancies', filters],
    queryFn: async () => {
      let query = supabase
        .from('vacancies')
        .select('*')
        .eq('is_active', true);

      // Search filter
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%,full_description.ilike.%${filters.search}%`);
      }

      // Location filter
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      // Salary filter
      if (filters.salaryMin) {
        query = query.or(`salary_max.gte.${filters.salaryMin},salary_max.is.null`);
      }
      if (filters.salaryMax) {
        query = query.or(`salary_min.lte.${filters.salaryMax},salary_min.is.null`);
      }

      // Employment type filter
      if (filters.employmentTypes.length > 0) {
        query = query.in('employment_type', filters.employmentTypes);
      }

      // Experience level filter
      if (filters.experienceLevels.length > 0) {
        query = query.in('experience_required', filters.experienceLevels);
      }

      // Date filter
      if (filters.datePosted) {
        const now = new Date();
        let dateThreshold: Date;
        
        switch (filters.datePosted) {
          case 'last_24h':
            dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case 'last_3_days':
            dateThreshold = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
            break;
          case 'last_week':
            dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'last_month':
            dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            dateThreshold = new Date(0);
        }
        
        query = query.gte('posted_date', dateThreshold.toISOString());
      }

      // Source filter
      if (filters.sources.length > 0) {
        query = query.in('source', filters.sources);
      }

      // Sorting
      switch (filters.sortBy) {
        case 'date_desc':
          query = query.order('posted_date', { ascending: false });
          break;
        case 'date_asc':
          query = query.order('posted_date', { ascending: true });
          break;
        case 'salary_desc':
          query = query.order('salary_max', { ascending: false, nullsFirst: false });
          break;
        case 'salary_asc':
          query = query.order('salary_min', { ascending: true, nullsFirst: false });
          break;
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    },
  });
};

export const useVacancyById = (id: string) => {
  return useQuery({
    queryKey: ['vacancy', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vacancies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};

export const useTriggerScraping = () => {
  return async (source: 'work.ua' | 'robota.ua' | 'dou.ua' | 'all' = 'all') => {
    const { data, error } = await supabase.functions.invoke('scrape-vacancies', {
      body: { source },
    });

    if (error) {
      throw error;
    }

    return data;
  };
};