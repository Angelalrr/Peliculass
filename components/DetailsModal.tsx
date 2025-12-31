
import React, { useEffect, useState, useRef } from 'react';
import { X, Play, Plus, ThumbsUp, Calendar, Clock, ExternalLink, AlertCircle, Info, Star, Users, User, MapPin, Award, Heart, RotateCcw } from 'lucide-react';
import { TMDBService } from '../services/tmdb';
import { ContentDetails, CastMember, PersonDetails } from '../types';
import YouTubeEmbed from './YouTubeEmbed';

interface DetailsModalProps {
  item: any;
  service: TMDBService;
  onClose: () => void;
  onOpenDetails: (item: any) => void;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ item, service, onClose, onOpenDetails }) => {
  const [details, setDetails] = useState<ContentDetails | null>(null);
  const [personDetails, setPersonDetails] = useState<PersonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const mediaType = item.media_type || ((item.title || item.release_date) ? 'movie' : (item.name && item.first_air_date ? 'tv' : (item.name && !item.first_air_date ? 'person' : 'movie')));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setShowPlayer(false);
        
        if (mediaType === 'person') {
          const data = await service.getPersonDetails(item.id);
          setPersonDetails(data);
        } else {
          const data = await service.getDetails(mediaType as 'movie' | 'tv', item.id);
          setDetails(data);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError("Error de conexión. Inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [item.id, mediaType, service]);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [item.id]);

  if (!item) return null;

  // Person Specific Logic
  if (mediaType === 'person') {
    const filmography = personDetails?.combined_credits?.cast
      .filter(i => i.poster_path)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 18) || [];

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-0 md:p-6 lg:p-12 overflow-hidden">
        <div 
          ref={modalRef}
          className="relative w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] bg-[#141414] md:rounded-3xl overflow-y-auto overflow-x-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-300"
        >
          <button 
            onClick={onClose}
            className="fixed md:absolute top-6 right-6 z-[120] bg-black/60 text-white p-3 rounded-full hover:bg-red-600 transition-all border border-white/10 shadow-2xl"
          >
            <X className="w-6 h-6" />
          </button>

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-6">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-xs">Conociendo a la estrella...</p>
            </div>
          ) : personDetails ? (
            <div className="animate-in fade-in duration-700">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-8">
                {/* Profile Photo Side */}
                <div className="md:col-span-4 relative aspect-[2/3] md:aspect-auto">
                  <img 
                    src={service.getPosterUrl(personDetails.profile_path, 'original')} 
                    alt={personDetails.name}
                    className="w-full h-full object-cover md:rounded-l-3xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent md:hidden" />
                  <div className="absolute bottom-6 left-6 md:hidden">
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter drop-shadow-2xl">
                      {personDetails.name}
                    </h1>
                  </div>
                </div>

                {/* Info Side */}
                <div className="md:col-span-8 p-8 md:p-12 space-y-10">
                  <div className="hidden md:block space-y-2">
                    <div className="flex items-center gap-3 text-red-600 font-black text-xs uppercase tracking-[0.3em]">
                      <Award className="w-4 h-4" /> Perfil de Artista
                    </div>
                    <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
                      {personDetails.name}
                    </h1>
                  </div>

                  <div className="flex flex-wrap gap-6 text-xs font-black uppercase tracking-widest text-zinc-500">
                    {personDetails.birthday && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-red-600" />
                        <span>Nació: {personDetails.birthday}</span>
                      </div>
                    )}
                    {personDetails.place_of_birth && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span>{personDetails.place_of_birth}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-600" />
                      <span>{Math.round(personDetails.popularity)} Puntos de Fama</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                      <Info className="w-4 h-4" /> Biografía
                    </h3>
                    <p className="text-zinc-300 leading-relaxed text-lg font-medium max-w-4xl line-clamp-[12] md:line-clamp-none">
                      {personDetails.biography || `${personDetails.name} es un profesional reconocido en la industria de ${personDetails.known_for_department.toLowerCase()}.`}
                    </p>
                  </div>

                  {filmography.length > 0 && (
                    <div className="space-y-8 pt-8 border-t border-zinc-800/40">
                      <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                        <Users className="w-6 h-6 text-red-600" /> Filmografía Destacada
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {filmography.map((work: any) => (
                          <div 
                            key={`${work.id}-${work.media_type}`} 
                            onClick={() => onOpenDetails(work)}
                            className="group cursor-pointer space-y-2"
                          >
                            <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/5 relative bg-zinc-900">
                              <img 
                                src={service.getPosterUrl(work.poster_path, 'w342')} 
                                alt={work.title || work.name}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                                <p className="text-[10px] font-black uppercase tracking-tighter text-white">
                                  {work.title || work.name}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // Movie/TV Logic
  const videos = details?.videos?.results || [];
  const trailer = 
    videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') ||
    videos.find(v => v.site === 'YouTube' && v.type === 'Teaser') ||
    videos.find(v => v.site === 'YouTube' && v.type === 'Clip') ||
    videos.find(v => v.site === 'YouTube');

  const cast = details?.credits?.cast.slice(0, 15);
  const recommendations = details?.recommendations?.results.slice(0, 12);
  const providers = details?.['watch/providers']?.results?.['ES']?.flatrate || [];

  const handlePlayTrailer = () => {
    if (trailer) {
      setShowPlayer(true);
    }
  };

  const getHeroImage = () => {
    if (trailer) return `https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`;
    return service.getBackdropUrl(item.backdrop_path, 'original');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-0 md:p-6 lg:p-12 overflow-hidden">
      <div 
        ref={modalRef}
        className="relative w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] bg-[#141414] md:rounded-3xl overflow-y-auto overflow-x-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-300"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="fixed md:absolute top-6 right-6 z-[120] bg-black/60 text-white p-3 rounded-full hover:bg-red-600 transition-all border border-white/10 shadow-2xl"
          aria-label="Cerrar"
        >
          <X className="w-6 h-6" />
        </button>

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-xs">Cargando...</p>
          </div>
        ) : error ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4 text-center px-10">
            <AlertCircle className="w-16 h-16 text-red-600" />
            <h3 className="text-2xl font-black italic">{error}</h3>
            <button onClick={onClose} className="mt-4 bg-white text-black px-8 py-3 rounded-full font-black uppercase tracking-tighter">Volver</button>
          </div>
        ) : (
          <div className="animate-in fade-in duration-700">
            {/* Media Header / Video Player con YouTubeEmbed */}
            <div className="relative aspect-video w-full bg-zinc-900 group overflow-hidden">
              {showPlayer && trailer ? (
                <div className="absolute inset-0 animate-in fade-in zoom-in duration-500 bg-black">
                  <YouTubeEmbed 
                    videoId={trailer.key} 
                    className="w-full h-full md:rounded-t-3xl shadow-2xl"
                  />
                  <div className="absolute top-4 left-4 z-20 pointer-events-none">
                     <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                        Reproduciendo Trailer
                     </div>
                  </div>
                  <button 
                    onClick={() => setShowPlayer(false)}
                    className="absolute bottom-4 right-4 bg-black/80 hover:bg-red-600 text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-white/10 transition-all z-20 shadow-2xl active:scale-95 hover:scale-105"
                  >
                    <RotateCcw className="w-4 h-4" /> Cerrar Trailer
                  </button>
                </div>
              ) : (
                <div onClick={trailer ? handlePlayTrailer : undefined} className="w-full h-full cursor-pointer overflow-hidden relative">
                  <img
                    src={getHeroImage()}
                    alt={item.title || item.name}
                    className={`w-full h-full object-cover transition-transform duration-1000 ${trailer ? 'group-hover:scale-105' : ''}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src.includes('maxresdefault')) {
                        target.src = `https://img.youtube.com/vi/${trailer?.key}/hqdefault.jpg`;
                      } else {
                        target.src = service.getBackdropUrl(item.backdrop_path, 'original');
                      }
                    }}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/10 to-transparent flex items-center justify-center">
                    {trailer && (
                      <div className="bg-red-600/90 p-6 rounded-full shadow-[0_0_50px_rgba(229,9,20,0.5)] scale-100 group-hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center border border-white/20">
                        <Play className="w-12 h-12 text-white fill-current translate-x-1" />
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 space-y-6 pointer-events-none">
                    <h1 className="text-3xl md:text-6xl font-black uppercase italic tracking-tighter drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] leading-[0.9]">
                      {item.title || item.name}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-4 pointer-events-auto">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handlePlayTrailer(); }}
                        disabled={!trailer}
                        className={`flex items-center gap-3 px-8 md:px-12 py-3 md:py-4 rounded-xl font-black uppercase tracking-tighter transition-all ${trailer ? 'bg-white text-black hover:bg-zinc-200 active:scale-95 shadow-2xl' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'}`}
                      >
                        <Play className="fill-current w-6 h-6" /> {trailer ? 'Ver Ahora' : 'Sin Video'}
                      </button>
                      <button className="bg-zinc-800/80 backdrop-blur-md text-white p-3 md:p-4 rounded-xl border border-zinc-600 hover:border-white transition-all active:scale-90">
                        <Plus className="w-6 h-6" />
                      </button>
                      <button className="bg-zinc-800/80 backdrop-blur-md text-white p-3 md:p-4 rounded-xl border border-zinc-600 hover:border-white transition-all active:scale-90">
                        <ThumbsUp className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Resto del contenido del modal... */}
            <div className="p-8 md:p-12 space-y-12 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-10">
                  <div className="flex flex-wrap items-center gap-6 text-xs md:text-sm font-black tracking-widest uppercase">
                    <div className="flex items-center gap-1.5 bg-green-500/10 text-green-500 px-3 py-1 rounded-full border border-green-500/20">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{Math.round(item.vote_average * 10)}% Recomendado</span>
                    </div>
                    <span className="text-zinc-400">{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}</span>
                    {details?.runtime ? (
                      <span className="text-zinc-400 flex items-center gap-2"><Clock className="w-4 h-4" /> {Math.floor(details.runtime / 60)}h {details.runtime % 60}m</span>
                    ) : details?.number_of_seasons ? (
                      <span className="text-zinc-400 flex items-center gap-2"><Clock className="w-4 h-4" /> {details.number_of_seasons} Temporadas</span>
                    ) : null}
                    <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700 text-[10px]">4K HDR</span>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                      <Info className="w-4 h-4" /> Sinopsis
                    </h3>
                    <p className="text-zinc-300 leading-relaxed text-lg md:text-xl font-medium max-w-4xl">
                      {item.overview || 'Sinopsis pendiente de actualización.'}
                    </p>
                  </div>

                  {providers.length > 0 && (
                    <div className="space-y-6 pt-6 border-t border-zinc-800/40">
                      <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Canales Disponibles</h4>
                      <div className="flex flex-wrap gap-5">
                        {providers.map(p => (
                          <div key={p.provider_id} className="group/prov relative cursor-pointer">
                            <img 
                              src={`https://image.tmdb.org/t/p/original${p.logo_path}`} 
                              className="w-14 h-14 rounded-2xl shadow-xl transition-all group-hover/prov:scale-110 group-hover/prov:-translate-y-1 border border-white/5" 
                              alt={p.provider_name} 
                            />
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-black/90 text-white px-3 py-1 rounded-full border border-zinc-800 opacity-0 group-hover/prov:opacity-100 transition-opacity whitespace-nowrap z-50">
                              {p.provider_name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-4 space-y-10">
                  <div className="bg-zinc-900/40 p-8 rounded-3xl border border-white/5 space-y-8">
                    <div className="space-y-3">
                      <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Etiquetas</span>
                      <div className="flex flex-wrap gap-2">
                        {details?.genres?.map(g => (
                          <span key={g.id} className="bg-zinc-800/50 text-zinc-400 px-3 py-1 rounded-full text-xs font-bold border border-zinc-700/50">
                            {g.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    {details?.status && (
                      <div className="pt-4 border-t border-zinc-800">
                        <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Producción</span>
                        <p className="text-red-600 font-black text-sm uppercase mt-1 tracking-tighter">{details.status}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {cast && cast.length > 0 && (
                <div className="space-y-8 pt-8 border-t border-zinc-800/40">
                  <div className="flex items-center gap-4">
                    <Users className="w-5 h-5 text-red-600" />
                    <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">Reparto Principal</h3>
                  </div>
                  <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar -mx-2 px-2">
                    {cast.map((person) => (
                      <div 
                        key={person.id} 
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDetails({...person, media_type: 'person'});
                        }}
                        className="flex-none w-32 md:w-40 group/cast cursor-pointer"
                      >
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-3 shadow-lg border border-white/5 bg-zinc-900 relative">
                          {person.profile_path ? (
                            <img 
                              src={`https://image.tmdb.org/t/p/w342${person.profile_path}`} 
                              alt={person.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/cast:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                              <User className="w-12 h-12" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/cast:opacity-100 transition-opacity" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-white font-black text-xs uppercase tracking-tighter truncate group-hover/cast:text-red-600 transition-colors">
                            {person.name}
                          </p>
                          <p className="text-zinc-500 text-[10px] font-bold italic truncate">
                            {person.character}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {recommendations && recommendations.length > 0 && (
              <div className="px-8 md:px-12 pb-20 space-y-10">
                <div className="flex items-center gap-6">
                  <h3 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter shrink-0">Contenido Similar</h3>
                  <div className="h-px w-full bg-gradient-to-r from-zinc-800 to-transparent" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                   {recommendations.map(rec => (
                     <div 
                        key={rec.id} 
                        onClick={() => onOpenDetails(rec)} 
                        className="group bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-red-600/50 hover:shadow-[0_10px_30px_rgba(229,9,20,0.1)] active:scale-95"
                      >
                        <div className="aspect-[2/3] relative overflow-hidden">
                          <img 
                            src={service.getPosterUrl(rec.poster_path, 'w342')} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            alt={rec.title || rec.name} 
                            loading="lazy"
                          />
                        </div>
                        <div className="p-4 space-y-1">
                           <p className="text-[10px] font-black truncate text-zinc-200 uppercase tracking-tighter">{rec.title || rec.name}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsModal;
