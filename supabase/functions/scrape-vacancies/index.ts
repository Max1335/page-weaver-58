import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { DOMParser } from 'https://esm.sh/linkedom@0.14.26';

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
    const response = await fetch('https://www.work.ua/jobs-it/?page=1', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await response.text();
    
    console.log(`work.ua HTML length: ${html.length}`);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    if (!doc) {
      console.error('Failed to parse work.ua HTML');
      return vacancies;
    }
    
    const jobCards = doc.querySelectorAll('div.card.card-hover, div[class*="job"], div[class*="vacancy"]');
    console.log(`work.ua found ${jobCards.length} potential job cards`);
    
    let count = 0;
    for (const card of Array.from(jobCards)) {
      if (count >= 20) break;
      
      try {
        const linkElement = card.querySelector('h2 a, a[href*="/jobs/"]');
        if (!linkElement) continue;
        
        const href = linkElement.getAttribute('href');
        if (!href) continue;
        
        const url = href.startsWith('http') ? href : `https://www.work.ua${href}`;
        const title = linkElement.textContent?.trim() || '';
        
        if (!title) continue;
        
        const companyElement = card.querySelector('span.add-top-xs, [class*="company"]');
        const company = companyElement?.textContent?.trim() || 'Не вказано';
        
        // Extract location, salary, and other details from card text
        const cardText = card.textContent?.toLowerCase() || '';
        
        // Parse location
        let location = 'Україна';
        const locationElement = card.querySelector('[class*="location"], [class*="city"]');
        if (locationElement) {
          location = locationElement.textContent?.trim() || 'Україна';
        } else if (cardText.includes('київ')) location = 'Київ';
        else if (cardText.includes('харків')) location = 'Харків';
        else if (cardText.includes('львів')) location = 'Львів';
        else if (cardText.includes('одеса')) location = 'Одеса';
        else if (cardText.includes('дніпро')) location = 'Дніпро';
        else if (cardText.includes('remote') || cardText.includes('віддалено')) location = 'Віддалена робота';
        
        // Parse salary
        let salary_min: number | undefined;
        let salary_max: number | undefined;
        let salary_currency = 'UAH';
        
        const salaryMatch = cardText.match(/(\d+)\s*(?:000)?\s*[-–—]\s*(\d+)\s*(?:000)?\s*(грн|uah|₴|\$|usd)/i);
        if (salaryMatch) {
          salary_min = parseInt(salaryMatch[1]) * (salaryMatch[0].includes('000') ? 1000 : 1);
          salary_max = parseInt(salaryMatch[2]) * (salaryMatch[0].includes('000') ? 1000 : 1);
          if (salaryMatch[3].includes('$') || salaryMatch[3].toLowerCase().includes('usd')) {
            salary_currency = 'USD';
          }
        }
        
        // Parse employment type
        let employment_type: string;
        if (cardText.includes('part-time') || cardText.includes('часткова')) {
          employment_type = 'part-time';
        } else if (cardText.includes('contract') || cardText.includes('контракт')) {
          employment_type = 'contract';
        } else if (cardText.includes('internship') || cardText.includes('стажування')) {
          employment_type = 'internship';
        } else if (cardText.includes('temporary') || cardText.includes('тимчасова')) {
          employment_type = 'temporary';
        } else {
          employment_type = 'full-time';
        }
        
        // Parse experience level
        let experience_required: string;
        if (cardText.includes('no experience') || cardText.includes('без досвіду') || cardText.includes('junior')) {
          experience_required = 'no-experience';
        } else if (cardText.includes('1 рік') || cardText.includes('1 year')) {
          experience_required = '1-year';
        } else if (cardText.includes('1-3') || cardText.includes('2-3') || cardText.includes('middle')) {
          experience_required = '1-5-years';
        } else if (cardText.includes('5-10') || cardText.includes('senior')) {
          experience_required = '5-10-years';
        } else if (cardText.includes('10+') || cardText.includes('lead') || cardText.includes('architect')) {
          experience_required = '10-plus-years';
        } else {
          experience_required = '1-5-years';
        }
        
        // Extract short description
        const descElement = card.querySelector('p, div[class*="description"]');
        const short_description = descElement?.textContent?.trim().substring(0, 200) || 
          `Вакансія ${title} від компанії ${company}`;
        
        vacancies.push({
          title,
          company_name: company,
          location,
          salary_min,
          salary_max,
          salary_currency,
          employment_type,
          experience_required,
          short_description,
          full_description: `<p>${short_description}</p><p>Для отримання детальної інформації, відвідайте сторінку вакансії.</p>`,
          source: 'work.ua',
          source_url: url,
          posted_date: new Date().toISOString(),
        });
        count++;
      } catch (itemError) {
        console.error('Error parsing work.ua item:', itemError);
      }
    }
    
    console.log(`work.ua successfully parsed ${count} vacancies`);
  } catch (error) {
    console.error('Error scraping work.ua:', error);
  }
  
  return vacancies;
}

async function scrapeRobotaUa(): Promise<VacancyData[]> {
  const vacancies: VacancyData[] = [];
  
  try {
    const response = await fetch('https://robota.ua/zapros/it/ukraine', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await response.text();
    
    console.log(`robota.ua HTML length: ${html.length}`);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    if (!doc) {
      console.error('Failed to parse robota.ua HTML');
      return vacancies;
    }
    
    const jobCards = doc.querySelectorAll('[class*="job-tile"], [class*="vacancy"], article, div[class*="santa"]');
    console.log(`robota.ua found ${jobCards.length} potential job cards`);
    
    let count = 0;
    for (const card of Array.from(jobCards)) {
      if (count >= 20) break;
      
      try {
        const linkElement = card.querySelector('h3 a, a[href*="/company"]');
        if (!linkElement) continue;
        
        const href = linkElement.getAttribute('href');
        if (!href) continue;
        
        const url = href.startsWith('http') ? href : `https://robota.ua${href}`;
        const title = linkElement.textContent?.trim() || '';
        
        if (!title || title.length < 3) continue;
        
        const companyElement = card.querySelector('[class*="company"]');
        const company = companyElement?.textContent?.trim() || 'Не вказано';
        
        const cardText = card.textContent?.toLowerCase() || '';
        
        // Parse location
        let location = 'Україна';
        const locationElement = card.querySelector('[class*="location"], [class*="city"]');
        if (locationElement) {
          location = locationElement.textContent?.trim() || 'Україна';
        } else if (cardText.includes('київ')) location = 'Київ';
        else if (cardText.includes('харків')) location = 'Харків';
        else if (cardText.includes('львів')) location = 'Львів';
        else if (cardText.includes('одеса')) location = 'Одеса';
        else if (cardText.includes('дніпро')) location = 'Дніпро';
        else if (cardText.includes('remote') || cardText.includes('віддалено')) location = 'Віддалена робота';
        
        // Parse salary
        let salary_min: number | undefined;
        let salary_max: number | undefined;
        let salary_currency = 'UAH';
        
        const salaryElement = card.querySelector('[class*="salary"]');
        const salaryText = salaryElement?.textContent?.toLowerCase() || cardText;
        const salaryMatch = salaryText.match(/(\d+)\s*(?:000)?\s*[-–—]\s*(\d+)\s*(?:000)?\s*(грн|uah|₴|\$|usd)/i);
        if (salaryMatch) {
          salary_min = parseInt(salaryMatch[1]) * (salaryMatch[0].includes('000') ? 1000 : 1);
          salary_max = parseInt(salaryMatch[2]) * (salaryMatch[0].includes('000') ? 1000 : 1);
          if (salaryMatch[3].includes('$') || salaryMatch[3].toLowerCase().includes('usd')) {
            salary_currency = 'USD';
          }
        }
        
        // Parse employment type
        let employment_type: string;
        if (cardText.includes('part-time') || cardText.includes('часткова')) {
          employment_type = 'part-time';
        } else if (cardText.includes('contract') || cardText.includes('контракт')) {
          employment_type = 'contract';
        } else if (cardText.includes('internship') || cardText.includes('стажування')) {
          employment_type = 'internship';
        } else if (cardText.includes('temporary') || cardText.includes('тимчасова')) {
          employment_type = 'temporary';
        } else {
          employment_type = 'full-time';
        }
        
        // Parse experience level
        let experience_required: string;
        if (cardText.includes('no experience') || cardText.includes('без досвіду') || cardText.includes('junior')) {
          experience_required = 'no-experience';
        } else if (cardText.includes('1 рік') || cardText.includes('1 year')) {
          experience_required = '1-year';
        } else if (cardText.includes('1-3') || cardText.includes('2-3') || cardText.includes('middle')) {
          experience_required = '1-5-years';
        } else if (cardText.includes('5-10') || cardText.includes('senior')) {
          experience_required = '5-10-years';
        } else if (cardText.includes('10+') || cardText.includes('lead') || cardText.includes('architect')) {
          experience_required = '10-plus-years';
        } else {
          experience_required = '1-5-years';
        }
        
        const descElement = card.querySelector('p, div[class*="description"]');
        const short_description = descElement?.textContent?.trim().substring(0, 200) || 
          `Вакансія ${title} від компанії ${company}`;
        
        vacancies.push({
          title,
          company_name: company,
          location,
          salary_min,
          salary_max,
          salary_currency,
          employment_type,
          experience_required,
          short_description,
          full_description: `<p>${short_description}</p><p>Для отримання детальної інформації, відвідайте сторінку вакансії.</p>`,
          source: 'robota.ua',
          source_url: url,
          posted_date: new Date().toISOString(),
        });
        count++;
      } catch (itemError) {
        console.error('Error parsing robota.ua item:', itemError);
      }
    }
    
    console.log(`robota.ua successfully parsed ${count} vacancies`);
  } catch (error) {
    console.error('Error scraping robota.ua:', error);
  }
  
  return vacancies;
}

async function scrapeDouUa(): Promise<VacancyData[]> {
  const vacancies: VacancyData[] = [];
  
  try {
    const response = await fetch('https://jobs.dou.ua/vacancies/?category=All', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await response.text();
    
    console.log(`dou.ua HTML length: ${html.length}`);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    if (!doc) {
      console.error('Failed to parse dou.ua HTML');
      return vacancies;
    }
    
    const jobCards = doc.querySelectorAll('li.l-vacancy, li[class*="vacancy"], div.vacancy, article');
    console.log(`dou.ua found ${jobCards.length} potential job cards`);
    
    let count = 0;
    for (const card of Array.from(jobCards)) {
      if (count >= 20) break;
      
      try {
        const linkElement = card.querySelector('a.vt, a[class*="title"], h2 a, h3 a');
        if (!linkElement) continue;
        
        const href = linkElement.getAttribute('href');
        if (!href || !href.includes('dou.ua')) continue;
        
        const url = href;
        const title = linkElement.textContent?.trim() || '';
        
        if (!title || title.length < 3) continue;
        
        const companyElement = card.querySelector('a.company, [class*="company"]');
        const company = companyElement?.textContent?.trim() || 'Не вказано';
        
        const locationElement = card.querySelector('span.cities, [class*="location"], [class*="city"]');
        const location = locationElement?.textContent?.trim() || 'Україна';
        
        const cardText = card.textContent?.toLowerCase() || '';
        
        // Parse salary
        let salary_min: number | undefined;
        let salary_max: number | undefined;
        let salary_currency = 'UAH';
        
        const salaryElement = card.querySelector('[class*="salary"]');
        const salaryText = salaryElement?.textContent?.toLowerCase() || cardText;
        const salaryMatch = salaryText.match(/(\d+)\s*(?:000)?\s*[-–—]\s*(\d+)\s*(?:000)?\s*(грн|uah|₴|\$|usd)/i);
        if (salaryMatch) {
          salary_min = parseInt(salaryMatch[1]) * (salaryMatch[0].includes('000') ? 1000 : 1);
          salary_max = parseInt(salaryMatch[2]) * (salaryMatch[0].includes('000') ? 1000 : 1);
          if (salaryMatch[3].includes('$') || salaryMatch[3].toLowerCase().includes('usd')) {
            salary_currency = 'USD';
          }
        }
        
        // Parse employment type
        let employment_type: string;
        if (cardText.includes('part-time') || cardText.includes('часткова')) {
          employment_type = 'part-time';
        } else if (cardText.includes('contract') || cardText.includes('контракт')) {
          employment_type = 'contract';
        } else if (cardText.includes('internship') || cardText.includes('стажування')) {
          employment_type = 'internship';
        } else if (cardText.includes('temporary') || cardText.includes('тимчасова')) {
          employment_type = 'temporary';
        } else {
          employment_type = 'full-time';
        }
        
        // Parse experience level
        let experience_required: string;
        if (cardText.includes('no experience') || cardText.includes('без досвіду') || cardText.includes('junior')) {
          experience_required = 'no-experience';
        } else if (cardText.includes('1 рік') || cardText.includes('1 year')) {
          experience_required = '1-year';
        } else if (cardText.includes('1-3') || cardText.includes('2-3') || cardText.includes('middle')) {
          experience_required = '1-5-years';
        } else if (cardText.includes('5-10') || cardText.includes('senior')) {
          experience_required = '5-10-years';
        } else if (cardText.includes('10+') || cardText.includes('lead') || cardText.includes('architect')) {
          experience_required = '10-plus-years';
        } else {
          experience_required = '1-5-years';
        }
        
        const descElement = card.querySelector('p, div[class*="description"]');
        const short_description = descElement?.textContent?.trim().substring(0, 200) || 
          `Вакансія ${title} від компанії ${company}`;
        
        vacancies.push({
          title,
          company_name: company,
          location,
          salary_min,
          salary_max,
          salary_currency,
          employment_type,
          experience_required,
          short_description,
          full_description: `<p>${short_description}</p><p>Для отримання детальної інформації, відвідайте сторінку вакансії.</p>`,
          source: 'dou.ua',
          source_url: url,
          posted_date: new Date().toISOString(),
        });
        count++;
      } catch (itemError) {
        console.error('Error parsing dou.ua item:', itemError);
      }
    }
    
    console.log(`dou.ua successfully parsed ${count} vacancies`);
  } catch (error) {
    console.error('Error scraping dou.ua:', error);
  }
  
  return vacancies;
}