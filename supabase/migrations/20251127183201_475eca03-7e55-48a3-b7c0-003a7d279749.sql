-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for vacancy fields
CREATE TYPE employment_type AS ENUM ('full-time', 'part-time', 'temporary', 'contract', 'internship');
CREATE TYPE experience_level AS ENUM ('no-experience', '1-year', '1-5-years', '5-10-years', '10-plus-years');
CREATE TYPE vacancy_source AS ENUM ('work.ua', 'robota.ua', 'dou.ua', 'other');

-- Create vacancies table
CREATE TABLE public.vacancies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    company_name VARCHAR(300) NOT NULL,
    location VARCHAR(200) NOT NULL,
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    salary_currency VARCHAR(10) DEFAULT 'UAH',
    employment_type employment_type NOT NULL,
    experience_required experience_level NOT NULL,
    short_description TEXT,
    full_description TEXT,
    source vacancy_source NOT NULL,
    source_url TEXT NOT NULL UNIQUE,
    posted_date TIMESTAMPTZ NOT NULL,
    scraped_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX idx_vacancies_title ON public.vacancies(title);
CREATE INDEX idx_vacancies_company_name ON public.vacancies(company_name);
CREATE INDEX idx_vacancies_location ON public.vacancies(location);
CREATE INDEX idx_vacancies_posted_date ON public.vacancies(posted_date DESC);
CREATE INDEX idx_vacancies_source ON public.vacancies(source);
CREATE INDEX idx_vacancies_employment_type ON public.vacancies(employment_type);
CREATE INDEX idx_vacancies_experience_required ON public.vacancies(experience_required);
CREATE INDEX idx_vacancies_is_active ON public.vacancies(is_active);
CREATE INDEX idx_vacancies_salary_min ON public.vacancies(salary_min) WHERE salary_min IS NOT NULL;
CREATE INDEX idx_vacancies_salary_max ON public.vacancies(salary_max) WHERE salary_max IS NOT NULL;

-- Full text search index for title and description
CREATE INDEX idx_vacancies_search ON public.vacancies 
USING gin(to_tsvector('english', title || ' ' || COALESCE(short_description, '') || ' ' || COALESCE(full_description, '')));

-- Create scraping_logs table to track scraping activity
CREATE TABLE public.scraping_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source vacancy_source NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress',
    vacancies_found INTEGER DEFAULT 0,
    vacancies_added INTEGER DEFAULT 0,
    vacancies_updated INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scraping_logs_source ON public.scraping_logs(source);
CREATE INDEX idx_scraping_logs_started_at ON public.scraping_logs(started_at DESC);

-- Enable Row Level Security
ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vacancies (public read access)
CREATE POLICY "Anyone can view active vacancies"
    ON public.vacancies
    FOR SELECT
    USING (is_active = true);

-- RLS Policies for scraping_logs (public read access)
CREATE POLICY "Anyone can view scraping logs"
    ON public.scraping_logs
    FOR SELECT
    USING (true);

-- Function to automatically update last_updated timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_updated on vacancies
CREATE TRIGGER update_vacancies_updated_at
    BEFORE UPDATE ON public.vacancies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to deactivate old vacancies (older than 60 days)
CREATE OR REPLACE FUNCTION deactivate_old_vacancies()
RETURNS INTEGER AS $$
DECLARE
    deactivated_count INTEGER;
BEGIN
    UPDATE public.vacancies
    SET is_active = false
    WHERE is_active = true 
    AND posted_date < NOW() - INTERVAL '60 days';
    
    GET DIAGNOSTICS deactivated_count = ROW_COUNT;
    RETURN deactivated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;