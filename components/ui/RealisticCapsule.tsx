import React from 'react';

export const RealisticCapsule = ({ className }: { className?: string }) => (
  <div className={`relative flex ${className}`} style={{ filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.15))' }}>
    {/* Red Half */}
    <div 
      className="w-1/2 h-full rounded-l-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #ff4d4d 0%, #cc0000 50%, #990000 100%)',
        boxShadow: 'inset -5px 0 10px rgba(0,0,0,0.2), inset 0 5px 10px rgba(255,255,255,0.4)',
      }}
    >
      {/* Specular highlight */}
      <div className="absolute top-1/4 left-1/4 right-0 h-1/4 bg-gradient-to-b from-white/60 to-transparent rounded-full blur-[2px] transform -rotate-12"></div>
    </div>
    
    {/* White Half */}
    <div 
      className="w-1/2 h-full rounded-r-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #e6e6e6 50%, #cccccc 100%)',
        boxShadow: 'inset 5px 0 10px rgba(0,0,0,0.1), inset 0 -5px 10px rgba(0,0,0,0.1)',
      }}
    >
      {/* Specular highlight */}
       <div className="absolute top-1/4 left-0 right-1/4 h-1/4 bg-gradient-to-b from-white/80 to-transparent rounded-full blur-[2px] transform -rotate-12"></div>
    </div>
    
    {/* Middle joining band (optional realism) */}
    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-black/5 -translate-x-1/2"></div>
  </div>
);
