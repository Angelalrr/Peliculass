
import React, { useState, useEffect } from 'react';
import { Filter, X, Calendar, Film, Users, Trash2, Search as SearchIcon } from 'lucide-react';
import { TMDBService } from '../services/tmdb';
import { Genre } from '../types';

interface FilterBarProps {
  service: TMDBService;
  onApplyFilters: (filters: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ service, onApplyFilters, isOpen, onClose }) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedType, setSelectedType] = useState<'movie' | 'tv'>('movie');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [year, setYear] = useState('');
  const [actorName, setActorName] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const movieGenres = await service.getGenres('movie');
        const tvGenres = await service.getGenres('tv');
        // Merge and unique genres
        const allGenres = [...movieGenres.genres, ...tvGenres.genres];
        const uniqueGenres = Array.from(new Map(allGenres.map(item => [item.id, item])).values());
        setGenres(uniqueGenres);
      } catch (err) {
        console.error("Error fetching genres", err);
      }
    };
    fetchGenres();
  }, [service]);

  const handleApply = async () => {
    const filters: any = {
      sort_by: sortBy,
      type: selectedType,
    };

    if (selectedGenre) filters.with_genres = selectedGenre;
    if (year) filters.primary_release_year = year;
    
    // If actor is specified, we need to find their ID first
    if (actorName.trim()) {
      try {
        const personSearch = await service.searchPerson(actorName);
        if (personSearch.results.length > 0) {
          filters.with_cast = personSearch.results[0].id.toString();
        }
      } catch (e) {
        console.error("Actor search failed", e);
      }
    }

    onApplyFilters(filters);
  };

  const handleReset = () => {
    setSelectedGenre('');
    setYear('');
    setActorName('');
    setSortBy('popularity.desc');
    setSelectedType('movie');
  };

  if (!isOpen) return null;

  return (
    <div className="bg-zinc-900/90 backdrop-blur-2xl border-b border-zinc-800 animate-in slide-in-from-top duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Filtros Avanzados</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-zinc-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Type & Sort */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Film className="w-3 h-3" /> Formato
              </label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedType('movie')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${selectedType === 'movie' ? 'bg-white text-black border-white' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
                >
                  Películas
                </button>
                <button 
                  onClick={() => setSelectedType('tv')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${selectedType === 'tv' ? 'bg-white text-black border-white' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
                >
                  Series
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Ordenar por</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-600 appearance-none"
              >
                <option value="popularity.desc">Más Populares</option>
                <option value="vote_average.desc">Mejor Valoradas</option>
                <option value="primary_release_date.desc">Más Recientes</option>
              </select>
            </div>
          </div>

          {/* Genres */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Film className="w-3 h-3" /> Género
            </label>
            <select 
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-600 appearance-none h-10"
            >
              <option value="">Todos los géneros</option>
              {genres.map(g => (
                <option key={g.id} value={g.id.toString()}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Año de lanzamiento
            </label>
            <input 
              type="number"
              placeholder="Ej: 2024"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-red-600 h-10"
            />
          </div>

          {/* Actor */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Users className="w-3 h-3" /> Con la actuación de...
            </label>
            <div className="relative">
              <input 
                type="text"
                placeholder="Nombre del actor/actriz"
                value={actorName}
                onChange={(e) => setActorName(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-red-600 h-10"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 mt-10 pt-6 border-t border-zinc-800">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Limpiar Todo
          </button>
          <button 
            onClick={handleApply}
            className="bg-red-600 hover:bg-red-700 text-white px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-600/20 active:scale-95 transition-all"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
