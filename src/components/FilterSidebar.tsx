import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, X } from 'lucide-react';
import { EmploymentType, ExperienceLevel, Source, DateFilter } from '@/types/vacancy';

interface FilterSidebarProps {
  salaryMin?: number;
  salaryMax?: number;
  employmentTypes: EmploymentType[];
  experienceLevels: ExperienceLevel[];
  datePosted?: DateFilter;
  sources: Source[];
  onSalaryMinChange: (value: number | undefined) => void;
  onSalaryMaxChange: (value: number | undefined) => void;
  onEmploymentTypeToggle: (type: EmploymentType) => void;
  onExperienceLevelToggle: (level: ExperienceLevel) => void;
  onDatePostedChange: (filter: DateFilter | undefined) => void;
  onSourceToggle: (source: Source) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export const FilterSidebar = ({
  salaryMin,
  salaryMax,
  employmentTypes,
  experienceLevels,
  datePosted,
  sources,
  onSalaryMinChange,
  onSalaryMaxChange,
  onEmploymentTypeToggle,
  onExperienceLevelToggle,
  onDatePostedChange,
  onSourceToggle,
  onClearFilters,
  activeFilterCount,
}: FilterSidebarProps) => {
  const [openSections, setOpenSections] = useState<string[]>([
    'salary',
    'employment',
    'experience',
    'date',
    'source',
  ]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Фільтри
          {activeFilterCount > 0 && (
            <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
              {activeFilterCount}
            </span>
          )}
        </h2>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Очистити
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4 pr-4">
          {/* Salary */}
          <Collapsible open={openSections.includes('salary')} onOpenChange={() => toggleSection('salary')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
              <Label className="font-medium cursor-pointer">Зарплата</Label>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('salary') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="salary-min" className="text-xs text-muted-foreground">
                    Від
                  </Label>
                  <Input
                    id="salary-min"
                    type="number"
                    placeholder="0"
                    value={salaryMin || ''}
                    onChange={(e) => onSalaryMinChange(e.target.value ? Number(e.target.value) : undefined)}
                    className="h-9"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="salary-max" className="text-xs text-muted-foreground">
                    До
                  </Label>
                  <Input
                    id="salary-max"
                    type="number"
                    placeholder="∞"
                    value={salaryMax || ''}
                    onChange={(e) => onSalaryMaxChange(e.target.value ? Number(e.target.value) : undefined)}
                    className="h-9"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">грн/місяць</p>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Employment Type */}
          <Collapsible open={openSections.includes('employment')} onOpenChange={() => toggleSection('employment')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
              <Label className="font-medium cursor-pointer">Тип зайнятості</Label>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('employment') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              {[
                { value: 'full-time', label: 'Повна зайнятість' },
                { value: 'part-time', label: 'Часткова зайнятість' },
                { value: 'temporary', label: 'Тимчасова робота' },
                { value: 'contract', label: 'Контракт' },
                { value: 'internship', label: 'Стажування' },
              ].map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.value}
                    checked={employmentTypes.includes(type.value as EmploymentType)}
                    onCheckedChange={() => onEmploymentTypeToggle(type.value as EmploymentType)}
                  />
                  <Label htmlFor={type.value} className="text-sm cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Experience Level */}
          <Collapsible open={openSections.includes('experience')} onOpenChange={() => toggleSection('experience')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
              <Label className="font-medium cursor-pointer">Досвід роботи</Label>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('experience') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              {[
                { value: 'no-experience', label: 'Без досвіду' },
                { value: '1-year', label: 'До 1 року' },
                { value: '1-5-years', label: '1-5 років' },
                { value: '5-10-years', label: '5-10 років' },
                { value: '10-plus-years', label: 'Більше 10 років' },
              ].map((exp) => (
                <div key={exp.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={exp.value}
                    checked={experienceLevels.includes(exp.value as ExperienceLevel)}
                    onCheckedChange={() => onExperienceLevelToggle(exp.value as ExperienceLevel)}
                  />
                  <Label htmlFor={exp.value} className="text-sm cursor-pointer">
                    {exp.label}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Date Posted */}
          <Collapsible open={openSections.includes('date')} onOpenChange={() => toggleSection('date')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
              <Label className="font-medium cursor-pointer">Дата публікації</Label>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('date') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <RadioGroup value={datePosted || ''} onValueChange={(value) => onDatePostedChange(value as DateFilter || undefined)}>
                {[
                  { value: 'last_24h', label: 'Остання доба' },
                  { value: 'last_3_days', label: 'Останні 3 дні' },
                  { value: 'last_week', label: 'Останній тиждень' },
                  { value: 'last_month', label: 'Останній місяць' },
                ].map((date) => (
                  <div key={date.value} className="flex items-center space-x-2 py-1">
                    <RadioGroupItem value={date.value} id={date.value} />
                    <Label htmlFor={date.value} className="text-sm cursor-pointer">
                      {date.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Source */}
          <Collapsible open={openSections.includes('source')} onOpenChange={() => toggleSection('source')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
              <Label className="font-medium cursor-pointer">Джерело</Label>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes('source') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              {[
                { value: 'work.ua', label: 'work.ua' },
                { value: 'robota.ua', label: 'robota.ua' },
                { value: 'dou.ua', label: 'dou.ua' },
                { value: 'other', label: 'інші' },
              ].map((source) => (
                <div key={source.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={source.value}
                    checked={sources.includes(source.value as Source)}
                    onCheckedChange={() => onSourceToggle(source.value as Source)}
                  />
                  <Label htmlFor={source.value} className="text-sm cursor-pointer">
                    {source.label}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
};
