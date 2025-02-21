'use client'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'
import i18n from '@/translation/i18n'
import { useLanguage } from '../provider/LanguageContext'


const languages = [
  { code: 'en', label: 'English' },
  { code: 'fil', label: 'Filipino' },
];

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 px-4 flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>{languages.find((lang) => lang.code === language)?.label || 'Language'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`cursor-pointer ${lang.code === language ? 'font-bold' : ''}`}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
