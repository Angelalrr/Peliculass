
import React from 'react';

export const CardSkeleton = () => (
  <div className="flex-none w-40 md:w-56 aspect-[2/3] bg-zinc-800 rounded-md animate-pulse"></div>
);

export const HeroSkeleton = () => (
  <div className="w-full h-[80vh] bg-zinc-900 animate-pulse relative">
    <div className="absolute bottom-10 left-10 space-y-4 max-w-xl">
      <div className="h-12 w-3/4 bg-zinc-800 rounded"></div>
      <div className="h-20 w-full bg-zinc-800 rounded"></div>
      <div className="flex gap-4">
        <div className="h-10 w-24 bg-zinc-800 rounded"></div>
        <div className="h-10 w-24 bg-zinc-800 rounded"></div>
      </div>
    </div>
  </div>
);
