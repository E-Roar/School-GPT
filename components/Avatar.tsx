
import React, { useEffect, useState, Suspense } from 'react';
import Spline from '@splinetool/react-spline';

interface AvatarProps {
  state: 'idle' | 'listening' | 'speaking';
}

const Avatar: React.FC<AvatarProps> = ({ state }) => {
  // Visual simulation of audio visualization bars
  const [bars, setBars] = useState<number[]>([10, 20, 15, 30, 10]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (state === 'speaking') {
      const interval = setInterval(() => {
        setBars(prev => prev.map(() => Math.floor(Math.random() * 40) + 10));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setBars([10, 20, 15, 30, 10]);
    }
  }, [state]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    console.error("Spline avatar failed to load.");
    setHasError(true);
    setIsLoading(false);
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      
      {/* 3D Scene Container */}
      <div className="absolute inset-0 flex items-center justify-center top-[-20px]">
        {/* Loading State */}
        {isLoading && !hasError && (
           <div className="absolute flex flex-col items-center space-y-4 z-10">
              <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-brand-300 font-display text-sm animate-pulse">Building Robot...</span>
           </div>
        )}

        {/* Fallback State (If Spline Fails) */}
        {hasError && (
            <div className="flex flex-col items-center justify-center opacity-50 animate-pulse">
                <div className="w-32 h-32 bg-brand-500/10 rounded-full flex items-center justify-center border border-brand-500/30">
                   <svg className="w-16 h-16 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
            </div>
        )}
        
        {/* Spline Robot Scene */}
        {!hasError && (
            <div className={`w-full h-[120%] transition-transform duration-500 ${
                state === 'listening' 
                    ? 'scale-105' 
                    : state === 'speaking' 
                        ? 'animate-speaking' 
                        : 'scale-100'
            }`}>
                <Spline 
                    scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" 
                    onLoad={handleLoad}
                    onError={handleError}
                />
            </div>
        )}
      </div>

      {/* Overlay UI for Status (Lipsync visualizer) */}
      <div className="absolute bottom-8 flex flex-col items-center z-20 space-y-3">
          
          {/* Speech Visualizer */}
          {state === 'speaking' && (
             <div className="h-8 flex items-end space-x-1 mb-2 bg-black/20 backdrop-blur-sm p-2 rounded-lg border border-white/10">
                 {bars.map((height, i) => (
                   <div key={i} style={{ height: `${height}px` }} className="w-1.5 bg-accent-400 rounded-t-sm transition-all duration-75 shadow-[0_0_10px_#a78bfa]"></div>
                 ))}
             </div>
          )}

          {/* Status Pill */}
          <div className={`
            px-4 py-1.5 rounded-full border text-xs uppercase tracking-widest font-bold shadow-lg backdrop-blur-md transition-all duration-300
            ${state === 'listening' 
                ? 'bg-brand-500/20 border-brand-400 text-brand-300 animate-pulse shadow-[0_0_20px_rgba(14,165,233,0.4)]' 
                : state === 'speaking' 
                    ? 'bg-accent-500/20 border-accent-400 text-accent-300 shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                    : 'bg-slate-900/60 border-slate-700 text-slate-500'}
          `}>
            {state === 'listening' ? 'Listening...' : state === 'speaking' ? 'Speaking' : 'Online'}
          </div>
      </div>

      {/* Decorative Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-600/20 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
};

export default Avatar;
    