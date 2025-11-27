import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  searchTerm: string;
  location: string;
  onSearchChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch: () => void;
}

export const SearchBar = ({
  searchTerm,
  location,
  onSearchChange,
  onLocationChange,
  onSearch,
}: SearchBarProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col md:flex-row gap-3 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Назва вакансії або ключові слова"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12 bg-card border-border"
          />
        </div>
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Місто або регіон"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="pl-10 h-12 bg-card border-border"
          />
        </div>
        <Button type="submit" size="lg" className="h-12 px-8 bg-gradient-hero hover:opacity-90">
          Шукати
        </Button>
      </div>
    </form>
  );
};
