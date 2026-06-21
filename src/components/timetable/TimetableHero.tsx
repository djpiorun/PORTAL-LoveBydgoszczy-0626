import React from "react";

export default function TimetableHero() {
  return (
    <div className="relative bg-blue-600 overflow-hidden rounded-3xl shadow-2xl">
      <div className="absolute inset-0 bg-blue-700">
        <img 
          src="/assets/timetable-bus.png" 
          alt="Autobus" 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[90%] w-auto object-contain opacity-20 blur-md z-0 pointer-events-none" 
        />
        <img 
          src="/assets/timetable-tram.png" 
          alt="Tramwaj" 
          className="absolute right-0 top-1/2 -translate-y-1/2 h-[90%] w-auto object-contain opacity-20 blur-md z-0 pointer-events-none" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 via-blue-600/50 to-blue-900/80 z-10" />
      </div>
      <div className="relative py-20 sm:py-24 flex flex-col items-center justify-center text-center z-20 min-h-[200px]">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">
          Rozkład Jazdy MZK
        </h1>
      </div>
    </div>
  );
}