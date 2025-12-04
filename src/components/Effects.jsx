import React, { useEffect } from 'react';
import { X, Cloud, FlaskConical, AlertOctagon } from 'lucide-react';

export const VisualEffects = ({ type, onComplete, text, onClose }) => {
  useEffect(() => {
    if (type === 'alchemy_fail' || type === 'alchemy_success' || type === 'level_up' || type === 'breakthrough_fail' || type === 'victory') {
        return; 
    }
    const duration = 2000;
    const timer = setTimeout(onComplete, duration);
    return () => clearTimeout(timer);
  }, [onComplete, type, onClose]);

  return (
    <>
      <style>{`
        @keyframes floatUp { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-50px); opacity: 0; } }
        @keyframes shake { 0% { transform: translate(1px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -2px) rotate(-1deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 30% { transform: translate(3px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 70% { transform: translate(3px, 1px) rotate(-1deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 90% { transform: translate(1px, 2px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
      `}</style>
      
      {type === 'toast' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none animate-in fade-in zoom-in duration-300">
           <div className="bg-stone-900/90 border-2 border-amber-500/50 px-6 py-4 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.8)] text-center">
              <div className="text-amber-100 font-serif text-lg font-bold">{text}</div>
           </div>
        </div>
      )}
      
      {type === 'consume_pill' && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-end justify-center pb-20">
           <div className="text-green-400 text-2xl font-bold animate-[floatUp_1s_ease-out_forwards] drop-shadow-md">
              + 灵力/气血
           </div>
           <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>
        </div>
      )}
      
      {type === 'attack' && <div className="absolute inset-0 bg-white/10 animate-ping z-40 pointer-events-none"></div>}
      
      {type === 'hit' && <div className="absolute inset-0 bg-red-500/30 animate-pulse z-40 pointer-events-none border-4 border-red-600"></div>}
      
      {type === 'escape' && <div className="absolute inset-0 bg-white/50 animate-pulse z-50 pointer-events-none flex items-center justify-center text-4xl font-bold text-stone-800">遁！</div>}
      
      {type === 'alchemy_fail' && (
         <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60">
            <div className="relative" style={{ animation: 'shake 0.5s infinite' }}>
               <button onClick={onClose} className="absolute -top-8 -right-8 text-white hover:text-red-500 z-50"><X size={32}/></button>
               <Cloud size={100} className="text-stone-600 filter blur-sm"/>
               <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-stone-300 font-bold text-xl">
                  炸炉！黑烟滚滚...
               </div>
               <div className="absolute -top-10 left-10 w-4 h-4 bg-stone-700 rounded-full" style={{ animation: 'floatUp 2s infinite' }}></div>
               <div className="absolute -top-16 left-20 w-6 h-6 bg-stone-800 rounded-full" style={{ animation: 'floatUp 2.5s infinite' }}></div>
               <div className="absolute -top-12 left-5 w-5 h-5 bg-stone-900 rounded-full" style={{ animation: 'floatUp 1.5s infinite' }}></div>
            </div>
         </div>
      )}
      
      {type === 'alchemy_success' && (
         <div className="absolute inset-0 z-[60] flex items-center justify-center bg-amber-500/20">
            <div className="relative flex flex-col items-center animate-in zoom-in duration-500">
               <button onClick={onClose} className="absolute -top-8 -right-8 text-white hover:text-amber-300 z-50"><X size={32}/></button>
               <div className="absolute inset-0 bg-amber-400 blur-3xl opacity-50 animate-pulse"></div>
               <FlaskConical size={80} className="text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,1)] rotate-12" />
               <div className="mt-4 text-2xl font-bold text-amber-100 font-serif drop-shadow-md">丹成！金光乍现</div>
            </div>
         </div>
      )}

      {type === 'breakthrough_fail' && (
         <div className="absolute inset-0 z-[60] flex items-center justify-center bg-red-900/40 backdrop-blur-sm animate-in fade-in duration-300">
             <div className="flex flex-col items-center relative">
                <button onClick={onClose} className="absolute -top-12 right-0 text-white hover:text-red-500 z-50"><X size={32}/></button>
                <AlertOctagon size={80} className="text-red-500 mb-4 animate-bounce" />
                <h2 className="text-4xl font-bold text-red-500 font-serif mb-2">走火入魔</h2>
                <p className="text-red-200 text-lg">经脉逆行，口吐鲜血！</p>
                <div className="mt-8">
                   <svg width="100" height="60" viewBox="0 0 100 60" className="text-stone-400">
                      <path d="M20 50 L80 50" stroke="currentColor" strokeWidth="4" />
                      <circle cx="15" cy="45" r="8" fill="currentColor" />
                      <path d="M20 55 Q25 60 30 55" stroke="#ef4444" strokeWidth="3" fill="none" />
                   </svg>
                </div>
             </div>
         </div>
      )}
    </>
  );
};