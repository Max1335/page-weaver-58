-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$;

-- Fix search_path for deactivate_old_vacancies function
CREATE OR REPLACE FUNCTION deactivate_old_vacancies()
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;