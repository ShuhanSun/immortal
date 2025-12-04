import React, { useState, useEffect } from 'react';
import SFX from '../utils/sfx';
import { Lock, ShoppingBag } from 'lucide-react';
import { getSpriteStyle } from '../data/constants';

// 新增：物品图片组件，支持精灵图和 Lucide 图标回退
export const ItemImage = ({ item, className = "", size = "w-full h-full" }) => {
  if (!item) return null;

  const Icon = item.icon || ShoppingBag;

  if (item.spritePos) {
    return (
      <div
        className={`rounded-md overflow-hidden ${size} ${className}`}
        style={getSpriteStyle(item.spritePos.row, item.spritePos.col)}
        title={item.name}
      />
    );
  }

  return <Icon className={`${size} ${className}`} />;
};

export const Card = ({ children, className = "", title, glow = false }) => (
  <div className={`bg-stone-900 border-2 ${glow ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-amber-800/50'} rounded-lg p-4 shadow-xl relative overflow-hidden ${className}`}>
    {title && (
      <div className="absolute top-0 left-0 right-0 bg-amber-900/20 border-b border-amber-800/30 px-3 py-1 z-10">
        <h3 className="text-amber-500 font-serif font-bold text-sm tracking-widest flex items-center gap-2">
           {title}
        </h3>
      </div>
    )}
    <div className={`relative z-10 ${title ? "mt-6" : ""}`}>{children}</div>
    <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5 pointer-events-none">
      <svg viewBox="0 0 100 100" fill="currentColor" className="text-amber-500">
        <path d="M50 0 C70 20 80 40 80 50 C80 60 70 80 50 100 C30 80 20 60 20 50 C20 40 30 20 50 0 Z" />
      </svg>
    </div>
  </div>
);

export const Button = ({ onClick, disabled, children, variant = "primary", className = "", sound = "click" }) => {
  const [ripples, setRipples] = useState([]);
  
  const baseStyle = "relative overflow-hidden px-4 py-2 rounded font-serif transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 select-none group";
  const variants = {
    primary: "bg-amber-800 hover:bg-amber-700 text-amber-100 border border-amber-600 shadow-[0_2px_0_rgb(120,53,15)]",
    secondary: "bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-600",
    danger: "bg-red-900/50 hover:bg-red-800/50 text-red-200 border border-red-800",
    outline: "bg-transparent border border-amber-800/50 text-amber-700 hover:bg-amber-900/10",
    success: "bg-green-800 hover:bg-green-700 text-green-100 border border-green-600",
    warning: "bg-yellow-700 hover:bg-yellow-600 text-yellow-100 border border-yellow-600"
  };

  const createRipple = (event) => {
    if (disabled) { SFX.play('error'); return; }
    SFX.play(sound);
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    const newRipple = { x, y, size, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);
    if (onClick) onClick(event);
  };

  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => setRipples([]), 600);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  return (
    <button onClick={createRipple} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      <div className="relative z-10 flex items-center gap-2">{children}</div>
      <div className={`absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity`} />
      {ripples.map((ripple) => (
        <span key={ripple.id} className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none" style={{ top: ripple.y, left: ripple.x, width: ripple.size, height: ripple.size }} />
      ))}
      <style>{`@keyframes ripple { 0% { transform: scale(0); opacity: 0.5; } 100% { transform: scale(2.5); opacity: 0; } } .animate-ripple { animation: ripple 0.6s linear; }`}</style>
    </button>
  );
};

export const ProgressBar = ({ value, max, color = "bg-amber-600", label, showText = true, height = "h-2", isBottleneck = false }) => (
  <div className="w-full relative">
    {showText && (
      <div className="flex justify-between text-xs mb-1 text-stone-400 font-serif">
        <span className="flex items-center gap-1">
           {label} 
           {isBottleneck && <span className="text-[10px] text-red-500 font-bold bg-red-900/20 px-1 rounded animate-pulse">[瓶颈]</span>}
        </span>
        <span>{Math.floor(value)} / {max}</span>
      </div>
    )}
    <div className={`${height} bg-stone-900 rounded-full overflow-hidden border ${isBottleneck ? 'border-red-500' : 'border-stone-700'} relative`}>
      <div className={`h-full ${isBottleneck ? 'bg-red-600' : color} transition-all duration-300`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      {isBottleneck && (
         <div className="absolute inset-0 bg-stripes-red pointer-events-none"></div>
      )}
    </div>
    <style>{`
      .bg-stripes-red {
         background-image: linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent);
         background-size: 0.5rem 0.5rem;
      }
    `}</style>
  </div>
);