import { Vacancy } from '@/types/vacancy';

export const mockVacancies: Vacancy[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer (React)',
    companyName: 'TechHub Ukraine',
    location: 'Київ',
    salaryMin: 80000,
    salaryMax: 120000,
    salaryCurrency: 'UAH',
    employmentType: 'full-time',
    experienceRequired: '1-5-years',
    shortDescription: 'Шукаємо досвідченого Frontend розробника для роботи над інноваційними проєктами. Необхідний досвід з React, TypeScript.',
    fullDescription: `<p>Ми шукаємо талановитого Senior Frontend Developer для приєднання до нашої команди.</p>
    
<h3>Вимоги:</h3>
<ul>
<li>3+ років досвіду з React</li>
<li>Відмінне знання TypeScript</li>
<li>Досвід з Redux/MobX</li>
<li>Знання сучасних CSS фреймворків (Tailwind, Styled Components)</li>
</ul>

<h3>Ми пропонуємо:</h3>
<ul>
<li>Конкурентну зарплату</li>
<li>Гнучкий графік роботи</li>
<li>Можливість віддаленої роботи</li>
<li>Професійний розвиток</li>
</ul>`,
    source: 'work.ua',
    sourceUrl: 'https://work.ua/jobs/1',
    postedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: '2',
    title: 'Python Backend Developer',
    companyName: 'DataCore Solutions',
    location: 'Львів',
    salaryMin: 60000,
    salaryMax: 90000,
    salaryCurrency: 'UAH',
    employmentType: 'full-time',
    experienceRequired: '1-5-years',
    shortDescription: 'Потрібен розробник для створення масштабованих backend систем на Python. Знання Django, PostgreSQL.',
    fullDescription: `<p>Приєднуйтесь до команди DataCore Solutions!</p>
    
<h3>Обов\'язки:</h3>
<ul>
<li>Розробка та підтримка backend систем</li>
<li>Робота з базами даних</li>
<li>Написання API</li>
<li>Оптимізація продуктивності</li>
</ul>

<h3>Вимоги:</h3>
<ul>
<li>2+ років досвіду з Python</li>
<li>Знання Django або Flask</li>
<li>Досвід роботи з PostgreSQL</li>
<li>Розуміння REST API</li>
</ul>`,
    source: 'robota.ua',
    sourceUrl: 'https://robota.ua/jobs/2',
    postedDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    companyName: 'Creative Agency',
    location: 'Одеса',
    salaryMin: 50000,
    salaryMax: 75000,
    salaryCurrency: 'UAH',
    employmentType: 'full-time',
    experienceRequired: '1-5-years',
    shortDescription: 'Креативне агентство шукає UI/UX дизайнера для роботи над веб та мобільними додатками.',
    fullDescription: `<p>Ми шукаємо талановитого дизайнера для нашої команди.</p>
    
<h3>Що потрібно вміти:</h3>
<ul>
<li>Figma, Sketch, Adobe XD</li>
<li>Створення прототипів</li>
<li>User research</li>
<li>Адаптивний дизайн</li>
</ul>

<h3>Буде плюсом:</h3>
<ul>
<li>Знання HTML/CSS</li>
<li>Досвід з анімацією</li>
<li>Портфоліо робіт</li>
</ul>`,
    source: 'dou.ua',
    sourceUrl: 'https://dou.ua/jobs/3',
    postedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    companyName: 'CloudTech',
    location: 'Харків',
    salaryMin: 70000,
    salaryMax: 100000,
    salaryCurrency: 'UAH',
    employmentType: 'full-time',
    experienceRequired: '1-5-years',
    shortDescription: 'Шукаємо DevOps інженера для управління інфраструктурою та автоматизації процесів.',
    fullDescription: `<p>CloudTech розширює команду DevOps інженерів.</p>
    
<h3>Основні завдання:</h3>
<ul>
<li>Управління Kubernetes кластерами</li>
<li>Налаштування CI/CD pipelines</li>
<li>Моніторинг та логування</li>
<li>Автоматизація інфраструктури</li>
</ul>

<h3>Технології:</h3>
<ul>
<li>Docker, Kubernetes</li>
<li>Jenkins, GitLab CI</li>
<li>AWS/Azure/GCP</li>
<li>Terraform, Ansible</li>
</ul>`,
    source: 'work.ua',
    sourceUrl: 'https://work.ua/jobs/4',
    postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: '5',
    title: 'QA Automation Engineer',
    companyName: 'TestPro',
    location: 'Дніпро',
    salaryMin: 55000,
    salaryMax: 80000,
    salaryCurrency: 'UAH',
    employmentType: 'full-time',
    experienceRequired: '1-year',
    shortDescription: 'Потрібен QA automation engineer для створення та підтримки автоматизованих тестів.',
    fullDescription: `<p>Приєднуйтесь до команди QA в TestPro!</p>
    
<h3>Вимоги:</h3>
<ul>
<li>Досвід автоматизації тестування</li>
<li>Знання Selenium, Cypress або Playwright</li>
<li>JavaScript/TypeScript</li>
<li>Розуміння CI/CD</li>
</ul>

<h3>Буде плюсом:</h3>
<ul>
<li>Досвід API тестування</li>
<li>Знання Postman</li>
<li>Досвід performance testing</li>
</ul>`,
    source: 'robota.ua',
    sourceUrl: 'https://robota.ua/jobs/5',
    postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: '6',
    title: 'Java Developer',
    companyName: 'Enterprise Solutions',
    location: 'Київ',
    salaryMin: 65000,
    salaryMax: 95000,
    salaryCurrency: 'UAH',
    employmentType: 'full-time',
    experienceRequired: '1-5-years',
    shortDescription: 'Розробник Java для роботи над корпоративними системами. Spring Boot, Microservices.',
    fullDescription: `<p>Enterprise Solutions шукає Java розробника.</p>
    
<h3>Технічні вимоги:</h3>
<ul>
<li>Java 11+</li>
<li>Spring Boot, Spring Cloud</li>
<li>Microservices architecture</li>
<li>REST API, gRPC</li>
<li>MySQL/PostgreSQL</li>
</ul>

<h3>Обов\'язки:</h3>
<ul>
<li>Розробка нових фіч</li>
<li>Підтримка існуючого коду</li>
<li>Code review</li>
<li>Документація</li>
</ul>`,
    source: 'dou.ua',
    sourceUrl: 'https://dou.ua/jobs/6',
    postedDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: '7',
    title: 'Mobile Developer (React Native)',
    companyName: 'MobileFirst',
    location: 'Львів',
    salaryMin: 70000,
    salaryMax: 100000,
    salaryCurrency: 'UAH',
    employmentType: 'full-time',
    experienceRequired: '1-5-years',
    shortDescription: 'Шукаємо React Native розробника для створення cross-platform мобільних додатків.',
    fullDescription: `<p>MobileFirst розширює команду мобільних розробників.</p>
    
<h3>Що потрібно знати:</h3>
<ul>
<li>React Native</li>
<li>JavaScript/TypeScript</li>
<li>Redux або MobX</li>
<li>REST API інтеграція</li>
<li>iOS та Android платформи</li>
</ul>

<h3>Ми пропонуємо:</h3>
<ul>
<li>Цікаві проєкти</li>
<li>Конкурентну зарплату</li>
<li>Професійний розвиток</li>
<li>Гнучкий графік</li>
</ul>`,
    source: 'work.ua',
    sourceUrl: 'https://work.ua/jobs/7',
    postedDate: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
  {
    id: '8',
    title: 'Data Analyst',
    companyName: 'Analytics Pro',
    location: 'Київ',
    salaryMin: 50000,
    salaryMax: 75000,
    salaryCurrency: 'UAH',
    employmentType: 'full-time',
    experienceRequired: '1-5-years',
    shortDescription: 'Потрібен аналітик даних для роботи з великими обсягами даних та створення звітів.',
    fullDescription: `<p>Analytics Pro шукає Data Analyst.</p>
    
<h3>Обов\'язки:</h3>
<ul>
<li>Аналіз даних</li>
<li>Створення звітів та дашбордів</li>
<li>Робота з SQL</li>
<li>Візуалізація даних</li>
</ul>

<h3>Вимоги:</h3>
<ul>
<li>SQL (PostgreSQL, MySQL)</li>
<li>Python (pandas, numpy)</li>
<li>Tableau або Power BI</li>
<li>Excel (advanced)</li>
</ul>`,
    source: 'robota.ua',
    sourceUrl: 'https://robota.ua/jobs/8',
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
  },
];
