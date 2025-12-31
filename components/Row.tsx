
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Star } from 'lucide-react';
import { TMDBService } from '../services/tmdb';

interface RowProps {
  title: string;
  items: any[];
  service: TMDBService;
  onOpenDetails: (item: any) => void;
}

const Row: React.FC<RowProps> = ({ title, items, service, onOpenDetails }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="group relative space-y-4 mb-10 px-4 md:px-12">
      <div className="flex items-center justify-between pr-4 md:pr-12">
        <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-zinc-100 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block"></span>
          {title}
        </h2>
      </div>
      
      <div className="relative group/row">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-40 bg-black/70 hover:bg-black/90 px-4 opacity-0 group-hover/row:opacity-100 transition-all hidden md:flex items-center backdrop-blur-sm"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-10 h-10 text-white" />
        </button>

        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-4 -my-4 px-1"
        >
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenDetails(item)}
              className="flex-none w-36 md:w-56 aspect-[2/3] relative cursor-pointer group/card overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 hover:z-50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.9)] border border-white/5 bg-zinc-900"
            >
              <img
                src={service.getPosterUrl(item.poster_path, 'w500')}
                alt={item.title || item.name}
                className="w-full h-full object-cover transition-transform group-hover/card:scale-110 duration-700"
                loading="lazy"
              />
              
              {/* Info Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                <div className="translate-y-4 group-hover/card:translate-y-0 transition-transform duration-300">
                  <p className="font-black uppercase italic text-sm tracking-tighter text-white drop-shadow-lg leading-none mb-2">
                    {item.title || item.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded border border-red-600/30">
                      {item.media_type === 'tv' || (!item.title && item.name) ? 'Serie' : 'Cine'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-white font-black text-xs">
                        {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Play Hover State */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-red-600 p-3 rounded-full shadow-2xl scale-50 group-hover/card:scale-100 transition-transform duration-500">
                   <Play className="w-6 h-6 text-white fill-current" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-40 bg-black/70 hover:bg-black/90 px-4 opacity-0 group-hover/row:opacity-100 transition-all hidden md:flex items-center backdrop-blur-sm"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-10 h-10 text-white" />
        </button>
      </div>
    </div>
  );
};

export default Row;
