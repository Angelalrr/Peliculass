
import React from 'react';
import { Play, Info } from 'lucide-react';
import { Movie, TVShow } from '../types';
import { TMDBService } from '../services/tmdb';

interface HeroProps {
  item: Movie | TVShow;
  service: TMDBService;
  onOpenDetails: (item: any) => void;
}

const Hero: React.FC<HeroProps> = ({ item, service, onOpenDetails }) => {
  const title = (item as Movie).title || (item as TVShow).name;
  const overview = item.overview.length > 200 ? item.overview.substring(0, 200) + '...' : item.overview;

  return (
    <div className="relative h-[80vh] w-full overflow-hidden">
      <img
        src={service.getBackdropUrl(item.backdrop_path, 'original')}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 netflix-gradient" />
      
      <div className="absolute bottom-1/4 left-4 md:left-12 max-w-2xl space-y-4">
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase drop-shadow-xl">
          {title}
        </h1>
        <p className="text-sm md:text-lg text-zinc-200 drop-shadow-md">
          {overview}
        </p>
        <div className="flex gap-4 pt-2">
          <button 
            onClick={() => onOpenDetails(item)}
            className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-md font-bold hover:bg-zinc-200 transition-colors">
            <Play className="fill-current" /> Reproducir
          </button>
          <button 
            onClick={() => onOpenDetails(item)}
            className="flex items-center gap-2 bg-zinc-600/80 text-white px-6 py-2 rounded-md font-bold hover:bg-zinc-600 transition-colors backdrop-blur-sm">
            <Info /> Más información
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
