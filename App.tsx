
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Row from './components/Row';
import DetailsModal from './components/DetailsModal';
import ApiKeyPrompt from './components/ApiKeyPrompt';
import FilterBar from './components/FilterBar';
import { HeroSkeleton } from './components/Skeleton';
import { TMDBService } from './services/tmdb';
import { Movie, TVShow, TMDBResponse } from './types';
import { Search, Loader2, Sparkles, CheckCircle2, History, Filter, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const DEFAULT_TMDB_KEY = 'f2a126cbc8534aef0b72f0bbad4e437c';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(() => {
    const saved = localStorage.getItem('tmdb_api_key');
    return saved || DEFAULT_TMDB_KEY;
  });
  
  const [activeTab, setActiveTab] = useState<'home' | 'movies' | 'tv'>('home');
  const [heroItem, setHeroItem] = useState<Movie | TVShow | null>(null);
  const [sections, setSections] = useState<{title: string, items: any[]}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [originalQuery, setOriginalQuery] = useState('');
  const [correctedQuery, setCorrectedQuery] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showKeyResetConfirm, setShowKeyResetConfirm] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(null);

  const service = useMemo(() => (apiKey ? new TMDBService(apiKey) : null), [apiKey]);

  const fetchHomeData = useCallback(async () => {
    if (!service) return;
    try {
      setLoading(true);
      setError(null);
      
      const [trending, popularMovies, topMovies, upcoming, popularTV, topTV] = await Promise.all([
        service.getTrending('all', 'day'),
        service.getMovies('popular'),
        service.getMovies('top_rated'),
        service.getMovies('upcoming'),
        service.getTVShows('popular'),
        service.getTVShows('top_rated'),
      ]);

      const validHeroItems = trending.results.filter(i => i.backdrop_path && i.overview);
      setHeroItem(validHeroItems[Math.floor(Math.random() * validHeroItems.length)]);

      setSections([
        { title: 'Tendencias hoy', items: trending.results },
        { title: 'Películas Populares', items: popularMovies.results },
        { title: 'Lo más valorado', items: topMovies.results },
        { title: 'Series de TV Populares', items: popularTV.results },
        { title: 'Próximos lanzamientos', items: upcoming.results },
        { title: 'Joyas de la televisión', items: topTV.results },
      ]);
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes('401') || err.message.toLowerCase().includes('api key')) {
        handleResetKey();
      }
    } finally {
      setLoading(false);
    }
  }, [service]);

  const fetchMoviesData = useCallback(async () => {
    if (!service) return;
    try {
      setLoading(true);
      const [popular, top, upcoming, now] = await Promise.all([
        service.getMovies('popular'),
        service.getMovies('top_rated'),
        service.getMovies('upcoming'),
        service.getMovies('now_playing'),
      ]);
      setHeroItem(popular.results[0]);
      setSections([
        { title: 'En cartelera', items: now.results },
        { title: 'Populares', items: popular.results },
        { title: 'Mejor valoradas', items: top.results },
        { title: 'Próximamente', items: upcoming.results },
      ]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [service]);

  const fetchTVData = useCallback(async () => {
    if (!service) return;
    try {
      setLoading(true);
      const [popular, top, onAir, today] = await Promise.all([
        service.getTVShows('popular'),
        service.getTVShows('top_rated'),
        service.getTVShows('on_the_air'),
        service.getTVShows('airing_today'),
      ]);
      setHeroItem(popular.results[0]);
      setSections([
        { title: 'Series populares', items: popular.results },
        { title: 'Aclamadas por la crítica', items: top.results },
        { title: 'Nuevos episodios', items: onAir.results },
        { title: 'Hoy en televisión', items: today.results },
      ]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    if (!apiKey) return;
    if (searchQuery || activeFilters) return; 

    if (activeTab === 'home') fetchHomeData();
    else if (activeTab === 'movies') fetchMoviesData();
    else if (activeTab === 'tv') fetchTVData();
  }, [activeTab, apiKey, fetchHomeData, fetchMoviesData, fetchTVData, searchQuery, activeFilters]);

  const getAIOptimizedQuery = async (query: string): Promise<string> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Actúa como un experto en cine. Analiza esta búsqueda: "${query}". Si tiene errores ortográficos o es un nombre de película/actor mal escrito, devuelve ÚNICAMENTE la versión correcta más probable. Si ya es correcto, devuelve el texto original. No añadas notas ni explicaciones. Solo el nombre limpio.`,
      });
      const result = response.text?.trim() || query;
      return result.replace(/['"]+/g, '');
    } catch (e) {
      console.error("AI Correction failed", e);
      return query;
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchQuery('');
      setOriginalQuery('');
      setSearchResults([]);
      setActiveFilters(null);
      return;
    }

    setOriginalQuery(query);
    setSearchQuery(query);
    setCorrectedQuery(null);
    setActiveFilters(null);
    setSearching(true);

    if (!service) return;
    
    try {
      const aiCorrected = await getAIOptimizedQuery(query);
      let finalQuery = query;
      if (aiCorrected.toLowerCase() !== query.toLowerCase()) {
        setCorrectedQuery(aiCorrected);
        finalQuery = aiCorrected;
      }

      const results = await service.search(finalQuery);
      if (results.results.length === 0 && finalQuery !== query) {
        const originalResults = await service.search(query);
        setSearchResults(originalResults.results.filter(i => i.poster_path || i.profile_path || i.backdrop_path));
        setCorrectedQuery(null);
      } else {
        setSearchResults(results.results.filter(i => i.poster_path || i.profile_path || i.backdrop_path));
      }
    } catch (err) {
      console.error(err);
      setError("Error durante la búsqueda.");
    } finally {
      setSearching(false);
    }
  };

  const handleApplyFilters = async (filters: any) => {
    if (!service) return;
    setIsFilterOpen(false);
    setSearching(true);
    setSearchQuery('filtro_activo'); // Trigger search view
    setOriginalQuery('Filtros aplicados');
    setActiveFilters(filters);
    setCorrectedQuery(null);

    try {
      const type = filters.type;
      const discoverParams = { ...filters };
      delete discoverParams.type;
      const results = await service.discover(type, discoverParams);
      setSearchResults(results.results.map((i: any) => ({ ...i, media_type: type })));
    } catch (err) {
      console.error(err);
      setError("Error al aplicar filtros.");
    } finally {
      setSearching(false);
    }
  };

  const saveKey = (key: string) => {
    localStorage.setItem('tmdb_api_key', key);
    setApiKey(key);
    setError(null);
  };

  const handleResetKey = () => {
    localStorage.removeItem('tmdb_api_key');
    setApiKey(null);
    setShowKeyResetConfirm(false);
  };

  const openDetails = (item: any) => setSelectedItem(item);
  const closeDetails = () => setSelectedItem(null);

  if (!apiKey) {
    return <ApiKeyPrompt onKeySubmit={saveKey} />;
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Header 
        onSearch={handleSearch} 
        onOpenSettings={() => setShowKeyResetConfirm(true)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSearchQuery('');
          setActiveFilters(null);
          setCorrectedQuery(null);
          setActiveTab(tab);
        }}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
      />

      <div className="pt-[72px]">
        {service && (
          <FilterBar 
            service={service} 
            isOpen={isFilterOpen} 
            onClose={() => setIsFilterOpen(false)}
            onApplyFilters={handleApplyFilters}
          />
        )}
      </div>

      <main className="pb-20">
        {(searchQuery || activeFilters) ? (
          <div className="pt-12 px-4 md:px-12 animate-in fade-in duration-500">
            <div className="mb-10 space-y-4">
              <div className="flex items-center gap-3 text-zinc-500 uppercase tracking-widest text-[10px] font-black">
                {activeFilters ? <Filter className="w-4 h-4 text-red-600" /> : <Search className="w-4 h-4" />}
                Explorador CineWave
              </div>
              <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">
                {activeFilters ? 'Resultados de Filtro' : <>Resultados para <span className="text-red-600">"{originalQuery}"</span></>}
              </h2>
              
              {correctedQuery && (
                <div className="flex flex-wrap items-center gap-4 bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl w-fit animate-in slide-in-from-top-4 shadow-2xl">
                  <div className="bg-yellow-500/20 p-2.5 rounded-xl">
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Sugerencia IA</p>
                    <button 
                      onClick={() => handleSearch(correctedQuery)}
                      className="text-lg font-bold hover:text-red-500 transition-colors flex items-center gap-2 group"
                    >
                      ¿Buscabas <span className="underline decoration-red-600 decoration-2 underline-offset-8 group-hover:decoration-white transition-all">{correctedQuery}</span>?
                    </button>
                  </div>
                </div>
              )}
            </div>

            {searching ? (
              <div className="flex flex-col items-center justify-center py-40 gap-8">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-red-600 animate-pulse" />
                </div>
                <div className="text-center space-y-3">
                  <p className="text-2xl font-black uppercase italic tracking-tighter">Escaneando la base de datos...</p>
                  <p className="text-zinc-500 font-medium">Estamos procesando tu solicitud con los mejores resultados.</p>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
                {searchResults.map((item) => (
                  <div
                    key={`${item.media_type}-${item.id}`}
                    onClick={() => openDetails(item)}
                    className="group cursor-pointer relative rounded-2xl overflow-hidden bg-zinc-900 transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/5"
                  >
                    <div className="aspect-[2/3] overflow-hidden">
                      <img
                        src={item.media_type === 'person' 
                          ? (item.profile_path ? `https://image.tmdb.org/t/p/w342${item.profile_path}` : 'https://via.placeholder.com/342x513?text=Sin+Foto')
                          : service?.getPosterUrl(item.poster_path, 'w342')
                        }
                        alt={item.title || item.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5">
                      <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 space-y-2">
                        <p className="font-black text-sm uppercase italic tracking-tighter leading-tight drop-shadow-xl">{item.title || item.name}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-red-600 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded border border-red-600/30">
                            {item.media_type === 'movie' ? 'Cine' : item.media_type === 'tv' ? 'Serie' : 'Artista'}
                          </span>
                          {item.vote_average > 0 && (
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-yellow-500" />
                              <span className="text-[10px] font-black text-white">
                                {Math.round(item.vote_average * 10)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 bg-zinc-900/30 rounded-3xl border border-zinc-800/50">
                <div className="bg-zinc-800/50 p-10 rounded-full border border-white/5">
                  <Search className="w-16 h-16 text-zinc-700" />
                </div>
                <div className="space-y-3 px-6">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter">"Escena no encontrada"</h3>
                  <p className="text-zinc-500 font-medium max-w-md mx-auto">
                    No hay coincidencias para tu búsqueda. Intenta con términos más generales o ajusta tus filtros avanzados.
                  </p>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setActiveFilters(null);
                      setOriginalQuery('');
                    }}
                    className="mt-8 text-red-600 font-black uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-3 mx-auto text-xs"
                  >
                    <History className="w-4 h-4" /> Reiniciar Búsqueda
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {loading ? (
              <HeroSkeleton />
            ) : (
              heroItem && service && (
                <Hero item={heroItem} service={service} onOpenDetails={openDetails} />
              )
            )}

            <div className={`transition-all duration-700 ${loading ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'} ${heroItem ? '-mt-32' : 'pt-24'} relative z-10`}>
              {sections.map((section, idx) => (
                service && <Row 
                  key={idx} 
                  title={section.title} 
                  items={section.items} 
                  service={service} 
                  onOpenDetails={openDetails} 
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Settings / Reset Key Modal */}
      {showKeyResetConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-500 bg-green-500/10 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4" /> CineWave Autenticado
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Ajustes de API</h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                Tu clave de TMDB está configurada correctamente. Si deseas usar una cuenta diferente o la clave ha expirado, puedes restablecerla aquí.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 pt-2">
              <button 
                onClick={handleResetKey}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition-all active:scale-95 shadow-xl shadow-red-600/20 uppercase tracking-widest text-xs"
              >
                RESTABLECER API KEY
              </button>
              <button 
                onClick={() => setShowKeyResetConfirm(false)}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-black py-4 rounded-xl transition-colors uppercase tracking-widest text-xs"
              >
                Cerrar panel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedItem && service && (
        <DetailsModal 
          item={selectedItem} 
          service={service} 
          onClose={closeDetails} 
          onOpenDetails={openDetails}
        />
      )}

      {error && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[250] bg-red-600 text-white px-8 py-4 rounded-full shadow-[0_20px_50px_rgba(229,9,20,0.5)] flex items-center gap-4 animate-in slide-in-from-bottom-10 border border-white/20 whitespace-nowrap">
          <AlertCircle className="w-5 h-5" />
          <p className="font-black text-xs uppercase tracking-widest">{error}</p>
          <button onClick={() => setError(null)} className="ml-4 bg-black/20 hover:bg-black/40 w-6 h-6 rounded-full flex items-center justify-center font-bold">×</button>
        </div>
      )}
    </div>
  );
};

export default App;
