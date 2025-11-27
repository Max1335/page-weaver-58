import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VacancyData {
  title: string;
  company_name: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  employment_type: string;
  experience_required: string;
  short_description: string;
  full_description: string;
  source: string;
  source_url: string;
  posted_date: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { source } = await req.json();
    
    if (!source || !['work.ua', 'robota.ua', 'dou.ua', 'all'].includes(source)) {
      return new Response(
        JSON.stringify({ error: 'Invalid source. Must be work.ua, robota.ua, dou.ua, or all' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting scrape for source: ${source}`);

    const sources = source === 'all' ? ['work.ua', 'robota.ua', 'dou.ua'] : [source];
    const results = [];

    for (const currentSource of sources) {
      // Create scraping log entry
      const { data: logEntry } = await supabase
        .from('scraping_logs')
        .insert({
          source: currentSource,
          status: 'in_progress',
        })
        .select()
        .single();

      try {
        console.log(`Scraping ${currentSource}...`);
        const vacancies = await scrapeSource(currentSource);
        
        console.log(`Found ${vacancies.length} vacancies from ${currentSource}`);

        let added = 0;
        let updated = 0;

        // Insert or update vacancies
        for (const vacancy of vacancies) {
          const { data: existing } = await supabase
            .from('vacancies')
            .select('id')
            .eq('source_url', vacancy.source_url)
            .single();

          if (existing) {
            await supabase
              .from('vacancies')
              .update(vacancy)
              .eq('id', existing.id);
            updated++;
          } else {
            await supabase
              .from('vacancies')
              .insert(vacancy);
            added++;
          }
        }

        // Update log entry
        await supabase
          .from('scraping_logs')
          .update({
            completed_at: new Date().toISOString(),
            status: 'completed',
            vacancies_found: vacancies.length,
            vacancies_added: added,
            vacancies_updated: updated,
          })
          .eq('id', logEntry.id);

        results.push({
          source: currentSource,
          success: true,
          vacancies_found: vacancies.length,
          vacancies_added: added,
          vacancies_updated: updated,
        });

        console.log(`Completed scraping ${currentSource}: ${added} added, ${updated} updated`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error scraping ${currentSource}:`, error);
        
        // Update log with error
        await supabase
          .from('scraping_logs')
          .update({
            completed_at: new Date().toISOString(),
            status: 'failed',
            error_message: errorMessage,
          })
          .eq('id', logEntry.id);

        results.push({
          source: currentSource,
          success: false,
          error: errorMessage,
        });
      }
    }

    // Deactivate old vacancies
    const { data: deactivatedCount } = await supabase.rpc('deactivate_old_vacancies');
    console.log(`Deactivated ${deactivatedCount} old vacancies`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        deactivated_vacancies: deactivatedCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in scrape-vacancies function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function scrapeSource(source: string): Promise<VacancyData[]> {
  switch (source) {
    case 'work.ua':
      return scrapeWorkUa();
    case 'robota.ua':
      return scrapeRobotaUa();
    case 'dou.ua':
      return scrapeDouUa();
    default:
      throw new Error(`Unknown source: ${source}`);
  }
}

async function scrapeWorkUa(): Promise<VacancyData[]> {
  const vacancies: VacancyData[] = [];
  
  try {
    // Fetch IT jobs from work.ua
    const response = await fetch('https://www.work.ua/jobs-it/?page=1');
    const html = await response.text();
    
    // Simple regex-based parsing (in production, use a proper HTML parser)
    const jobPattern = /<div class="card card-hover card-visited card-list-item"[^>]*>[\s\S]*?<h2[^>]*>[\s\S]*?<a href="([^"]*)"[^>]*>([^<]+)<\/a>[\s\S]*?<span class="add-top-xs">([^<]+)<\/span>[\s\S]*?<\/div>/gi;
    
    let match;
    let count = 0;
    while ((match = jobPattern.exec(html)) !== null && count < 20) {
      const url = match[1].startsWith('http') ? match[1] : `https://www.work.ua${match[1]}`;
      const title = match[2].trim();
      const company = match[3].trim();
      
      vacancies.push({
        title,
        company_name: company || 'Не вказано',
        location: 'Україна',
        salary_currency: 'UAH',
        employment_type: 'full-time',
        experience_required: '1-5-years',
        short_description: `Вакансія ${title} від компанії ${company}`,
        full_description: `<p>Вакансія ${title} від компанії ${company}. Для отримання детальної інформації, відвідайте сторінку вакансії.</p>`,
        source: 'work.ua',
        source_url: url,
        posted_date: new Date().toISOString(),
      });
      count++;
    }
  } catch (error) {
    console.error('Error scraping work.ua:', error);
  }
  
  return vacancies;
}

async function scrapeRobotaUa(): Promise<VacancyData[]> {
  const vacancies: VacancyData[] = [];
  
  try {
    // Fetch IT jobs from robota.ua
    const response = await fetch('https://robota.ua/zapros/it/ukraine');
    const html = await response.text();
    
    // Simple parsing for robota.ua
    const jobPattern = /<h3[^>]*class="[^"]*santa-job-tile-title[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>[\s\S]*?<p[^>]*class="[^"]*santa-company-name[^"]*"[^>]*>([^<]+)<\/p>/gi;
    
    let match;
    let count = 0;
    while ((match = jobPattern.exec(html)) !== null && count < 20) {
      const url = match[1].startsWith('http') ? match[1] : `https://robota.ua${match[1]}`;
      const title = match[2].trim();
      const company = match[3].trim();
      
      vacancies.push({
        title,
        company_name: company || 'Не вказано',
        location: 'Україна',
        salary_currency: 'UAH',
        employment_type: 'full-time',
        experience_required: '1-5-years',
        short_description: `Вакансія ${title} від компанії ${company}`,
        full_description: `<p>Вакансія ${title} від компанії ${company}. Для отримання детальної інформації, відвідайте сторінку вакансії.</p>`,
        source: 'robota.ua',
        source_url: url,
        posted_date: new Date().toISOString(),
      });
      count++;
    }
  } catch (error) {
    console.error('Error scraping robota.ua:', error);
  }
  
  return vacancies;
}

async function scrapeDouUa(): Promise<VacancyData[]> {
  const vacancies: VacancyData[] = [];
  
  try {
    // Fetch jobs from dou.ua
    const response = await fetch('https://jobs.dou.ua/vacancies/?category=All');
    const html = await response.text();
    
    // Simple parsing for dou.ua
    const jobPattern = /<li class="l-vacancy"[^>]*>[\s\S]*?<a class="vt"[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>[\s\S]*?<a class="company"[^>]*>([^<]+)<\/a>[\s\S]*?<span class="cities">([^<]+)<\/span>/gi;
    
    let match;
    let count = 0;
    while ((match = jobPattern.exec(html)) !== null && count < 20) {
      const url = match[1];
      const title = match[2].trim();
      const company = match[3].trim();
      const location = match[4].trim();
      
      vacancies.push({
        title,
        company_name: company || 'Не вказано',
        location: location || 'Україна',
        salary_currency: 'UAH',
        employment_type: 'full-time',
        experience_required: '1-5-years',
        short_description: `Вакансія ${title} від компанії ${company}`,
        full_description: `<p>Вакансія ${title} від компанії ${company}. Для отримання детальної інформації, відвідайте сторінку вакансії.</p>`,
        source: 'dou.ua',
        source_url: url,
        posted_date: new Date().toISOString(),
      });
      count++;
    }
  } catch (error) {
    console.error('Error scraping dou.ua:', error);
  }
  
  return vacancies;
}