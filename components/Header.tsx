
import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Settings, LogOut, Menu, X, Trash2, Filter } from 'lucide-react';

interface HeaderProps {
  onSearch: (query: string) => void;
  onOpenSettings: () => void;
  activeTab: 'home' | 'movies' | 'tv';
  setActiveTab: (tab: 'home' | 'movies' | 'tv') => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onOpenSettings, activeTab, setActiveTab, isFilterOpen, setIsFilterOpen }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearch('');
    searchInputRef.current?.focus();
  };

  return (
    <nav className={`fixed top-0 w-full z-[150] transition-all duration-500 px-4 md:px-12 py-3 md:py-4 flex items-center justify-between ${isScrolled ? 'bg-black shadow-2xl py-2' : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent'}`}>
      <div className="flex items-center gap-4 md:gap-12">
        <h1 
          className="text-red-600 text-2xl md:text-4xl font-black tracking-tighter cursor-pointer hover:scale-105 transition-transform italic" 
          onClick={() => {
            setActiveTab('home');
            setSearchQuery('');
          }}
        >
          CINEWAVE
        </h1>
        
        <div className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-zinc-400">
          <button 
            onClick={() => setActiveTab('home')}
            className={`hover:text-white transition-all relative py-2 ${activeTab === 'home' ? 'text-white' : ''}`}>
            Inicio
            {activeTab === 'home' && <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 rounded-full animate-in zoom-in" />}
          </button>
          <button 
            onClick={() => setActiveTab('movies')}
            className={`hover:text-white transition-all relative py-2 ${activeTab === 'movies' ? 'text-white' : ''}`}>
            Películas
            {activeTab === 'movies' && <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 rounded-full animate-in zoom-in" />}
          </button>
          <button 
            onClick={() => setActiveTab('tv')}
            className={`hover:text-white transition-all relative py-2 ${activeTab === 'tv' ? 'text-white' : ''}`}>
            Series
            {activeTab === 'tv' && <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 rounded-full animate-in zoom-in" />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <div className="flex items-center gap-2">
          <form 
            onSubmit={handleSearchSubmit} 
            className={`relative group transition-all duration-300 ${isSearchActive ? 'w-48 md:w-80' : 'w-40 md:w-64'}`}
            onFocus={() => setIsSearchActive(true)}
            onBlur={() => !searchQuery && setIsSearchActive(false)}
          >
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Películas, actores..."
              className="w-full bg-black/40 backdrop-blur-md border border-zinc-800 text-white pl-10 pr-10 py-2 rounded-full text-xs font-bold focus:outline-none focus:border-red-600 focus:bg-black/80 transition-all placeholder:text-zinc-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearchActive ? 'text-red-600' : 'text-zinc-500'}`} />
            {searchQuery && (
              <button 
                type="button" 
                onClick={handleClearSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:text-white text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2.5 rounded-full border transition-all ${isFilterOpen ? 'bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white'}`}
            title="Filtros avanzados"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={onOpenSettings} 
            className="p-2 text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 rounded-full hover:bg-zinc-800"
            title="Configuración de API"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button className="md:hidden p-2 text-white bg-red-600 rounded-full ml-2 shadow-lg shadow-red-600/20" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[60px] w-full bg-black/98 z-[60] p-8 flex flex-col gap-6 text-2xl font-black uppercase italic md:hidden animate-in slide-in-from-right duration-300">
           <button 
            className={`text-left border-b border-zinc-900 pb-4 ${activeTab === 'home' ? 'text-red-600' : ''}`}
            onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); setSearchQuery(''); }}>
            Inicio
          </button>
           <button 
            className={`text-left border-b border-zinc-900 pb-4 ${activeTab === 'movies' ? 'text-red-600' : ''}`}
            onClick={() => { setActiveTab('movies'); setIsMobileMenuOpen(false); setSearchQuery(''); }}>
            Películas
          </button>
           <button 
            className={`text-left border-b border-zinc-900 pb-4 ${activeTab === 'tv' ? 'text-red-600' : ''}`}
            onClick={() => { setActiveTab('tv'); setIsMobileMenuOpen(false); setSearchQuery(''); }}>
            Series
          </button>
        </div>
      )}
    </nav>
  );
};

export default Header;
