import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Mountain, FlaskConical, Map as MapIcon, ShoppingBag, Leaf, Coins, 
  User, Skull, Sword, Swords, Wind, Compass, Plus, ArrowUpCircle, AlertTriangle,
  Eye, Package, X, Hand, Volume2, VolumeX, Shield, Scroll, Zap, Flame, Sparkles,
  AlertOctagon, Brain, Circle
} from 'lucide-react';

/**
 * ==============================================================================
 * 1. CONSTANTS & DATA
 * ==============================================================================
 */

// 境界数据
const REALMS = [
  { name: "凡人", maxExp: 100, hp: 50, atk: 5, def: 0, spirit: 1, pill: "pillQi", color: "text-stone-400", life: 60 },
  { name: "炼气一层", maxExp: 200, hp: 100, atk: 15, def: 2, spirit: 3, pill: "pillQi", color: "text-stone-300", life: 63 },
  { name: "炼气二层", maxExp: 400, hp: 150, atk: 25, def: 5, spirit: 5, pill: "pillQi", color: "text-stone-300", life: 66 },
  { name: "炼气三层", maxExp: 800, hp: 220, atk: 40, def: 8, spirit: 8, pill: "pillQi", color: "text-stone-300", life: 69 },
  { name: "炼气四层", maxExp: 1500, hp: 300, atk: 60, def: 12, spirit: 12, pill: "pillQi", color: "text-emerald-200", life: 72 },
  { name: "炼气五层", maxExp: 2500, hp: 400, atk: 85, def: 18, spirit: 15, pill: "pillQi", color: "text-emerald-300", life: 75 },
  { name: "炼气六层", maxExp: 4000, hp: 550, atk: 110, def: 25, spirit: 20, pill: "pillQi", color: "text-emerald-400", life: 78 },
  { name: "炼气七层", maxExp: 6000, hp: 700, atk: 140, def: 35, spirit: 25, pill: "pillRare", color: "text-cyan-300", life: 81 },
  { name: "炼气八层", maxExp: 9000, hp: 900, atk: 180, def: 45, spirit: 30, pill: "pillRare", color: "text-cyan-300", life: 84 },
  { name: "炼气九层", maxExp: 13000, hp: 1200, atk: 230, def: 60, spirit: 40, pill: "pillRare", color: "text-cyan-400", life: 87 },
  { name: "炼气十层", maxExp: 18000, hp: 1500, atk: 280, def: 80, spirit: 50, pill: "pillRare", color: "text-cyan-400", life: 90 },
  { name: "炼气十一层", maxExp: 24000, hp: 1900, atk: 340, def: 100, spirit: 65, pill: "pillRare", color: "text-cyan-500", life: 93 },
  { name: "炼气十二层", maxExp: 32000, hp: 2400, atk: 410, def: 120, spirit: 80, pill: "pillRare", color: "text-cyan-500", life: 96 },
  { name: "炼气十三层 (圆满)", maxExp: 42000, hp: 3000, atk: 500, def: 150, spirit: 100, pill: "pillZhuJi", color: "text-cyan-600", life: 99 },
  { name: "筑基初期", maxExp: 100000, hp: 8000, atk: 1200, def: 400, spirit: 300, pill: "pillJieDan", color: "text-indigo-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]", life: 200 },
  { name: "筑基中期", maxExp: 200000, hp: 12000, atk: 1800, def: 600, spirit: 500, pill: "pillJieDan", color: "text-indigo-300 drop-shadow-[0_0_15px_rgba(37,99,235,0.8)]", life: 300 },
  { name: "筑基后期", maxExp: 400000, hp: 18000, atk: 2500, def: 900, spirit: 800, pill: "pillJieDan", color: "text-indigo-200 drop-shadow-[0_0_15px_rgba(37,99,235,0.8)]", life: 400 },
];

const ITEMS = {
  // --- 货币与杂项 ---
  spiritStone: { name: "灵石", desc: "修仙界的通用货币。", type: "currency", price: 1, icon: Coins }, 
  inventoryBag: { name: "储物袋", desc: "内有乾坤，可纳万物。", type: "tool", icon: Package },

  // --- 材料 ---
  herbSeed: { name: "黄龙草种子", desc: "低阶灵草种子，可培育出黄龙草。", type: "material", subtype: "seed", price: 5, icon: Leaf }, 
  spiritHerb: { name: "黄龙草", desc: "炼制黄龙丹的主材 (十年份)。", type: "material", subtype: "herb", price: 8, icon: Leaf, quality: 10 }, 
  spiritHerb_100: { name: "百年黄龙草", desc: "药性强劲的百年灵草，炼丹成功率高。", type: "material", subtype: "herb", price: 80, icon: Leaf, quality: 100 }, 
  spiritHerb_1000: { name: "千年黄龙草", desc: "传说中的千年灵药，炼丹必成。", type: "material", subtype: "herb", price: 800, icon: Sparkles, quality: 1000 }, 
  rareHerb: { name: "金髓花", desc: "炼制金髓丸的主材。", type: "material", price: 50, icon: Sparkles }, 
  monsterCore: { name: "低阶妖丹", desc: "妖兽的一身精华。", type: "material", price: 30, icon: Zap },

  // --- 丹药 ---
  pillQi: { name: "黄龙丹", desc: "增加修为，亦可回血。", exp: 80, hpRegen: 50, type: "consumable", price: 25, icon: Circle }, 
  pillRare: { name: "金髓丸", desc: "洗髓伐骨，破境专用。", exp: 200, hpRegen: 200, type: "consumable", price: 200, icon: Circle }, 
  pillZhuJi: { name: "筑基丹", desc: "冲击筑基期的神药。", exp: 0, effect: "breakthrough_major", type: "consumable", price: 2000, icon: Circle }, 

  // --- 法器与符箓 ---
  talismanFire: { name: "火弹符", desc: "一次性消耗品，投掷火球伤敌。", dmg: 150, type: "weapon", price: 15, icon: Flame }, 
  ironSword: { name: "铁精剑", desc: "掺入了铁精的低阶法器。", atkBonus: 15, type: "equip", price: 100, icon: Sword }, 
  goldBrick: { name: "金光砖", desc: "符宝残片，威力巨大。", atkBonus: 45, type: "equip", price: 500, icon: Sword }, 
  flyShield: { name: "玄铁飞天盾", desc: "防御型法器，增加生存能力。", defBonus: 20, type: "equip", price: 400, icon: Shield }, 
  motherSonBlade: { name: "金蚨子母刃", desc: "成套法器，诡异莫测。", atkBonus: 80, type: "equip", price: 1200, icon: Sword }, 

  // --- 功法 ---
  bookChangChun: { name: "长春功", desc: "木属性基础功法，修炼速度微增。", passive: { type: "exp_rate", val: 1.1 }, type: "method", price: 300, icon: Scroll }, 
  bookSword: { name: "眨眼剑法", desc: "世俗武学极致，增加攻击力。", passive: { type: "atk", val: 20 }, type: "method", price: 150, icon: Scroll }, 
};

const ENEMIES = [
  { name: "野狼", realm: "野兽", realmIdx: 0, hp: 30, atk: 8, def: 0, exp: 5, loot: null, desc: "普通的野兽，对修仙者毫无威胁。" },
  { name: "土甲龙", realm: "一级妖兽", realmIdx: 3, hp: 150, atk: 25, def: 10, exp: 25, loot: "monsterCore", desc: "皮糙肉厚的一级妖兽，擅长防御。" },
  { name: "双头鹫", realm: "一级顶阶", realmIdx: 8, hp: 350, atk: 55, def: 20, exp: 60, loot: "monsterCore", desc: "凶猛的飞行妖兽，双头可喷吐风刃。" },
  { name: "墨蛟", realm: "二级妖兽", realmIdx: 14, hp: 5000, atk: 300, def: 150, exp: 1000, loot: "rareHerb", desc: "盘踞在沼泽深处的蛟龙，实力恐怖，非筑基不可敌。" },
];

const SHOP_INVENTORY = [
  { id: "herbSeed", type: "buy" },
  { id: "pillQi", type: "buy" },
  { id: "pillRare", type: "buy" },
  { id: "pillZhuJi", type: "buy" },
  { id: "talismanFire", type: "buy" },
  { id: "ironSword", type: "buy" },
  { id: "goldBrick", type: "buy" },
  { id: "bookChangChun", type: "buy" },
  { id: "spiritHerb", type: "sell" },
  { id: "spiritHerb_100", type: "sell" },
  { id: "spiritHerb_1000", type: "sell" },
  { id: "monsterCore", type: "sell" },
];

/**
 * ==============================================================================
 * 2. UTILS
 * ==============================================================================
 */

const SFX = {
  ctx: null,
  init: () => {
    if (!SFX.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) SFX.ctx = new AudioContext();
    }
  },
  play: (type) => {
    if (!SFX.ctx) SFX.init();
    if (!SFX.ctx) return;
    if (SFX.ctx.state === 'suspended') SFX.ctx.resume();

    const t = SFX.ctx.currentTime;
    const osc = SFX.ctx.createOscillator();
    const gain = SFX.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(SFX.ctx.destination);

    switch (type) {
      case 'click': 
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      case 'breath_in': 
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.linearRampToValueAtTime(150, t + 4);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 2); 
        gain.gain.linearRampToValueAtTime(0.02, t + 4); 
        osc.start(t);
        osc.stop(t + 4);
        break;
      case 'breath_out': 
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(80, t + 4);
        gain.gain.setValueAtTime(0.02, t);
        gain.gain.linearRampToValueAtTime(0, t + 4); 
        osc.start(t);
        osc.stop(t + 4);
        break;
      case 'level_up': 
        const playChord = (freq, delay) => {
           const o = SFX.ctx.createOscillator();
           const g = SFX.ctx.createGain();
           o.connect(g);
           g.connect(SFX.ctx.destination);
           o.type = 'sine';
           o.frequency.value = freq;
           g.gain.setValueAtTime(0, t + delay);
           g.gain.linearRampToValueAtTime(0.1, t + delay + 0.1);
           g.gain.exponentialRampToValueAtTime(0.001, t + delay + 2);
           o.start(t + delay);
           o.stop(t + delay + 2);
        };
        playChord(440, 0); playChord(554, 0.1); playChord(659, 0.2); playChord(880, 0.3); 
        break;
      case 'attack': 
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.1);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      case 'hit': 
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.2);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      case 'fly': 
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.linearRampToValueAtTime(400, t + 0.5);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.start(t);
        osc.stop(t + 0.5);
        break;
      case 'scan': 
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.linearRampToValueAtTime(1200, t + 0.2);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      case 'drip':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      case 'error': 
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(100, t + 0.2);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, t);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.start(t);
        osc.stop(t + 0.5);
        break;
      case 'magic':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.linearRampToValueAtTime(600, t + 0.3);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
      case 'explosion':
        const noiseBuffer = SFX.ctx.createBuffer(1, SFX.ctx.sampleRate * 0.5, SFX.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1;
        const noise = SFX.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const noiseGain = SFX.ctx.createGain();
        noise.connect(noiseGain);
        noiseGain.connect(SFX.ctx.destination);
        noiseGain.gain.setValueAtTime(0.2, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        noise.start(t);
        break;
      default: break;
    }
  }
};

/**
 * ==============================================================================
 * 3. UI COMPONENTS
 * ==============================================================================
 */

// 简化版物品图标组件
const ItemImage = ({ item, className = "", size = "w-full h-full" }) => {
  if (!item) return null;
  const Icon = item.icon || ShoppingBag;
  return <Icon className={`${size} ${className}`} />;
};

const Card = ({ children, className = "", title, glow = false, noBorder = false }) => (
  <div className={`${noBorder ? 'flex flex-col' : 'bg-stone-900 border-2 shadow-xl'} ${glow ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : (noBorder ? '' : 'border-amber-800/50')} rounded-lg ${noBorder ? '' : 'p-4'} relative overflow-hidden ${className}`}>
    {title && (
      <div className={`absolute top-0 left-0 right-0 z-20 px-3 py-1 ${noBorder ? 'bg-gradient-to-b from-black/80 to-transparent' : 'bg-amber-900/20 border-b border-amber-800/30'}`}>
        <h3 className={`text-amber-500 font-serif font-bold text-sm tracking-widest flex items-center gap-2 ${noBorder ? 'drop-shadow-md' : ''}`}>
           {title}
        </h3>
      </div>
    )}
    <div className={`relative z-10 ${title ? (noBorder ? "flex-1 flex flex-col h-full" : "mt-6") : ""}`}>{children}</div>
    {!noBorder && (
      <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="currentColor" className="text-amber-500">
          <path d="M50 0 C70 20 80 40 80 50 C80 60 70 80 50 100 C30 80 20 60 20 50 C20 40 30 20 50 0 Z" />
        </svg>
      </div>
    )}
  </div>
);

const Button = ({ onClick, disabled, children, variant = "primary", className = "", sound = "click" }) => {
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

const ProgressBar = ({ value, max, color = "bg-amber-600", label, showText = true, height = "h-2", isBottleneck = false, showFluctuation = false }) => (
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
      <div className={`h-full ${isBottleneck ? 'bg-red-600' : color} transition-all duration-300 relative overflow-hidden`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }}>
         {/* 修为波动特效 */}
         {showFluctuation && (
            <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite]"></div>
         )}
      </div>
      {isBottleneck && (
         <div className="absolute inset-0 bg-stripes-red pointer-events-none"></div>
      )}
    </div>
    <style>{`
      .bg-stripes-red {
         background-image: linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent);
         background-size: 0.5rem 0.5rem;
      }
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `}</style>
  </div>
);

// 五行雷达图组件
const PentagonChart = ({ roots }) => {
  const size = 100;
  const center = size / 2;
  const radius = 40;
  // 五行：金、木、水、火、土
  const elements = ['金', '木', '水', '火', '土'];
  // 颜色：黄、绿、蓝、红、褐
  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#a8a29e'];
  
  const getCoordinates = (index, value = 10) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const r = (value / 10) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const points = elements.map((_, i) => getCoordinates(i, 10)).map(p => `${p.x},${p.y}`).join(' ');
  
  // 玩家属性点
  const data = [
    roots.metal || 1, 
    roots.wood || 1, 
    roots.water || 1, 
    roots.fire || 1, 
    roots.earth || 1
  ];
  const dataPoints = data.map((v, i) => getCoordinates(i, v)).map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative w-[120px] h-[120px] mx-auto">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
        {/* 背景五边形 */}
        <polygon points={points} fill="none" stroke="#44403c" strokeWidth="1" />
        {[0.2, 0.4, 0.6, 0.8].map(scale => {
           const innerPoints = elements.map((_, i) => getCoordinates(i, 10 * scale)).map(p => `${p.x},${p.y}`).join(' ');
           return <polygon key={scale} points={innerPoints} fill="none" stroke="#292524" strokeWidth="0.5" />
        })}
        
        {/* 轴线 */}
        {elements.map((el, i) => {
           const p = getCoordinates(i, 10);
           return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#44403c" strokeWidth="0.5" />;
        })}

        {/* 数据区域 */}
        <polygon points={dataPoints} fill="rgba(245, 158, 11, 0.3)" stroke="#f59e0b" strokeWidth="1.5" />
        
        {/* 顶点标签 */}
        {elements.map((el, i) => {
           const p = getCoordinates(i, 12.5); // 稍微往外一点
           return (
             <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill={colors[i]} className="font-bold">
               {el}
             </text>
           )
        })}
      </svg>
    </div>
  );
};

/**
 * ==============================================================================
 * 4. EFFECTS COMPONENTS
 * ==============================================================================
 */

const VisualEffects = ({ type, onComplete, text, onClose }) => {
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
        @keyframes floatBreathe {
            0%, 100% { transform: translateY(0) scale(1.1); }
            50% { transform: translateY(-15px) scale(1.15); }
        }
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
               <div className="w-24 h-24 bg-stone-700 rounded-full blur-xl opacity-50 absolute inset-0"></div>
               <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-stone-300 font-bold text-xl whitespace-nowrap">
                  炸炉！黑烟滚滚...
               </div>
            </div>
         </div>
      )}
      
      {type === 'alchemy_success' && (
         <div className="absolute inset-0 z-[60] flex items-center justify-center bg-amber-500/20">
            <div className="relative flex flex-col items-center animate-in zoom-in duration-500">
               {/* 自动收取，无需关闭按钮 */}
               <div className="absolute inset-0 bg-amber-400 blur-3xl opacity-50 animate-pulse"></div>
               <FlaskConical size={80} className="text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,1)] rotate-12" />
               <div className="mt-4 text-2xl font-bold text-amber-100 font-serif drop-shadow-md">丹成！自动收取中...</div>
            </div>
         </div>
      )}

      {type === 'breakthrough_fail' && (
         <div className="absolute inset-0 z-[60] flex items-center justify-center bg-red-900/40 backdrop-blur-sm animate-in fade-in duration-300">
             <div className="flex flex-col items-center relative">
                <button onClick={onClose} className="absolute -top-12 right-0 text-white hover:text-red-500 z-50"><X size={32}/></button>
                <div className="text-red-500 mb-4 animate-bounce text-6xl">⚠️</div>
                <h2 className="text-4xl font-bold text-red-500 font-serif mb-2">走火入魔</h2>
                <p className="text-red-200 text-lg">经脉逆行，口吐鲜血！</p>
             </div>
         </div>
      )}
    </>
  );
};

/**
 * ==============================================================================
 * 5. MODALS
 * ==============================================================================
 */

// 物品详情弹窗
const ItemDetailModal = ({ itemId, onClose, onUse }) => {
  const item = ITEMS[itemId];
  if (!item) return null;

  return (
    <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 border-2 border-amber-600 rounded-lg p-6 max-w-sm w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-2 right-2 text-stone-500 hover:text-red-500"><X/></button>
        <div className="flex flex-col items-center mb-4">
           <div className="w-24 h-24 bg-stone-800 rounded-lg border-2 border-stone-600 flex items-center justify-center mb-3 p-1">
              <ItemImage item={item} className="text-amber-500" size="w-full h-full"/>
           </div>
           <h3 className="text-xl font-bold text-amber-100">{item.name}</h3>
           <span className="text-xs text-stone-500 bg-stone-800 px-2 py-1 rounded mt-1">{item.type.toUpperCase()}</span>
        </div>
        <p className="text-stone-400 text-sm mb-6 text-center leading-relaxed">{item.desc}</p>
        <div className="flex gap-3">
           <Button onClick={onClose} variant="secondary" className="flex-1">关闭</Button>
           {['consumable', 'weapon', 'equip', 'method'].includes(item.type) && (
             <Button onClick={() => { onUse(); onClose(); }} className="flex-1">使用 / 装备</Button>
           )}
        </div>
      </div>
    </div>
  );
};

// 种植选择弹窗
const PlantingModal = ({ inventory, onClose, onPlant }) => {
   const seeds = Object.keys(inventory).filter(k => ITEMS[k].type === 'material' && ITEMS[k].subtype === 'seed');
   return (
      <div className="absolute inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200">
         <div className="bg-stone-900 border-2 border-green-700 rounded-lg p-6 max-w-sm w-full relative shadow-2xl">
            <button onClick={onClose} className="absolute top-2 right-2 text-stone-500 hover:text-red-500"><X/></button>
            <h3 className="text-xl font-bold text-green-500 mb-4 font-serif text-center">选择灵种</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
               {seeds.map(k => (
                  <div key={k} onClick={() => onPlant(k)} className="bg-stone-800 border border-stone-700 hover:border-green-500 cursor-pointer p-2 rounded flex flex-col items-center">
                     <div className="w-10 h-10 mb-1 flex items-center justify-center">
                        <ItemImage item={ITEMS[k]} className="text-green-300" />
                     </div>
                     <span className="text-[10px] text-stone-400 text-center">{ITEMS[k].name}</span>
                     <span className="text-[9px] text-green-700">x{inventory[k]}</span>
                  </div>
               ))}
               {seeds.length === 0 && <div className="col-span-3 text-center text-stone-500 text-sm py-4">储物袋中没有种子</div>}
            </div>
            <Button onClick={onClose} variant="secondary" className="w-full">取消</Button>
         </div>
      </div>
   )
};

// 丹药选择弹窗
const PillSelectModal = ({ inventory, onClose, onUse }) => {
   const pills = Object.keys(inventory).filter(k => ITEMS[k].type === 'consumable');
   return (
      <div className="absolute inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200">
         <div className="bg-stone-900 border-2 border-cyan-700 rounded-lg p-6 max-w-sm w-full relative shadow-2xl">
            <button onClick={onClose} className="absolute top-2 right-2 text-stone-500 hover:text-red-500"><X/></button>
            <h3 className="text-xl font-bold text-cyan-500 mb-4 font-serif text-center">选择丹药</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
               {pills.map(k => (
                  <div key={k} onClick={() => onUse(k)} className="bg-stone-800 border border-stone-700 hover:border-cyan-500 cursor-pointer p-2 rounded flex flex-col items-center">
                     <div className="w-10 h-10 mb-1 flex items-center justify-center">
                        <ItemImage item={ITEMS[k]} className="text-cyan-300" />
                     </div>
                     <span className="text-[10px] text-stone-400 text-center">{ITEMS[k].name}</span>
                     <span className="text-[9px] text-cyan-700">x{inventory[k]}</span>
                  </div>
               ))}
               {pills.length === 0 && <div className="col-span-3 text-center text-stone-500 text-sm py-4">无可用丹药</div>}
            </div>
            <Button onClick={onClose} variant="secondary" className="w-full">取消</Button>
         </div>
      </div>
   )
};

// 炼丹选材弹窗
const AlchemySelectModal = ({ inventory, onClose, onSelect }) => {
   const herbs = Object.keys(inventory).filter(k => ITEMS[k].type === 'material' && ITEMS[k].subtype === 'herb');
   
   return (
      <div className="absolute inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200">
         <div className="bg-stone-900 border-2 border-orange-700 rounded-lg p-6 max-w-sm w-full relative shadow-2xl">
            <button onClick={onClose} className="absolute top-2 right-2 text-stone-500 hover:text-red-500"><X/></button>
            <h3 className="text-xl font-bold text-orange-500 mb-4 font-serif text-center">投入主材</h3>
            <div className="grid grid-cols-1 gap-2 mb-4">
               {herbs.map(k => {
                  const item = ITEMS[k];
                  const rate = item.quality >= 1000 ? 100 : item.quality >= 100 ? (5 + Math.floor(item.quality/100)*10) : 5;
                  const qualityColor = item.quality >= 1000 ? "text-purple-400" : item.quality >= 100 ? "text-amber-200" : "text-stone-300";
                  return (
                  <div key={k} onClick={() => onSelect(k)} className="bg-stone-800 border border-stone-700 hover:border-orange-500 cursor-pointer p-3 rounded flex justify-between items-center group">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                           <ItemImage item={item} className={qualityColor}/>
                        </div>
                        <div>
                           <div className="text-sm font-bold text-stone-300 group-hover:text-orange-400">{item.name}</div>
                           <div className="text-[10px] text-stone-500">库存: {inventory[k]}</div>
                        </div>
                     </div>
                     <div className="text-xs text-orange-300 font-mono">成丹率: {rate}%</div>
                  </div>
               )})}
               {herbs.length === 0 && <div className="text-center text-stone-500 text-sm py-4">没有可用的炼丹灵草</div>}
            </div>
            <Button onClick={onClose} variant="secondary" className="w-full">取消</Button>
         </div>
      </div>
   )
};

// 怪物查看弹窗
const EnemyDetailModal = ({ enemy, onClose }) => {
   return (
      <div className="absolute inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200">
         <div className="bg-stone-900 border-2 border-red-700 rounded-lg p-6 max-w-sm w-full relative shadow-2xl">
            <button onClick={onClose} className="absolute top-2 right-2 text-stone-500 hover:text-red-500"><X/></button>
            <div className="flex flex-col items-center mb-4">
               <div className="w-20 h-20 bg-stone-800 rounded-full border-2 border-red-600 flex items-center justify-center mb-3 animate-pulse">
                  <Skull size={40} className="text-red-500"/>
               </div>
               <h3 className="text-xl font-bold text-red-100">{enemy.name}</h3>
               <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded mt-1">{enemy.realm}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
               <div className="bg-stone-800 p-2 rounded">
                  <div className="text-xs text-stone-500">攻击</div>
                  <div className="text-red-400 font-mono">{enemy.atk}</div>
               </div>
               <div className="bg-stone-800 p-2 rounded">
                  <div className="text-xs text-stone-500">防御</div>
                  <div className="text-stone-300 font-mono">{enemy.def}</div>
               </div>
               <div className="bg-stone-800 p-2 rounded">
                  <div className="text-xs text-stone-500">气血</div>
                  <div className="text-green-400 font-mono">{enemy.hp}</div>
               </div>
            </div>
            <p className="text-stone-400 text-sm mb-6 text-center leading-relaxed">{enemy.desc}</p>
            <Button onClick={onClose} variant="secondary" className="w-full">关闭</Button>
         </div>
      </div>
   )
}

// 玩家详情面板
const PlayerStatsModal = ({ player, stats, onClose }) => {
   const realmColor = REALMS[player.realmIdx].color;
   
   return (
      <div className="absolute inset-0 z-[70] bg-black/95 flex items-center justify-center p-4 animate-in zoom-in duration-300">
         <div className="bg-stone-900 border-2 border-amber-700 rounded-lg w-full max-w-md p-6 relative shadow-[0_0_50px_rgba(180,83,9,0.2)]">
            <button onClick={onClose} className="absolute top-2 right-2 text-stone-500 hover:text-amber-500"><X/></button>
            
            <div className="flex items-center gap-4 mb-6 border-b border-stone-800 pb-4">
               <div className="w-16 h-16 rounded-full bg-stone-800 border-2 border-amber-600 flex items-center justify-center">
                  <User size={32} className={realmColor}/>
               </div>
               <div>
                  <h2 className="text-2xl font-serif font-bold text-amber-100">{player.name}</h2>
                  <div className={`text-sm ${realmColor} font-bold`}>{REALMS[player.realmIdx].name}</div>
               </div>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-stone-800 pb-1">
                        <span className="text-stone-500">骨龄 / 寿元</span>
                        <span className="font-mono text-stone-300">{player.age.toFixed(0)} / {player.maxAge}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-stone-800 pb-1">
                        <span className="text-stone-500">攻击力</span>
                        <span className="font-mono text-amber-400">{REALMS[player.realmIdx].atk} <span className="text-xs text-green-500">+{stats.atk - REALMS[player.realmIdx].atk}</span></span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-stone-800 pb-1">
                        <span className="text-stone-500">防御力</span>
                        <span className="font-mono text-stone-300">{stats.def}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-stone-800 pb-1">
                        <span className="text-stone-500">神识范围</span>
                        <span className="font-mono text-cyan-300">{stats.spirit} 里</span>
                    </div>
                </div>
                
                {/* 五行灵根图 */}
                <div className="w-32 flex flex-col items-center justify-center">
                    <PentagonChart roots={player.spiritRoots} />
                    <span className="text-[10px] text-stone-500 mt-2">五行灵根</span>
                </div>
            </div>

            <div className="mb-4">
               <h3 className="text-amber-500 font-bold mb-2 flex items-center gap-2"><Scroll size={16}/> 已修习功法</h3>
               <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-700">
                  {player.learnedMethods.map((m, i) => (
                     <div key={i} className="flex justify-between items-center bg-stone-800 p-2 rounded text-sm border border-stone-700">
                        <span className="text-stone-300">{ITEMS[m].name}</span>
                        <span className="text-xs text-green-500">
                           {ITEMS[m].passive.type === 'atk' ? `攻击 +${ITEMS[m].passive.val}` : `修炼速度 x${ITEMS[m].passive.val}`}
                        </span>
                     </div>
                  ))}
                  {player.learnedMethods.length === 0 && <div className="text-stone-600 text-xs italic">暂无修习功法</div>}
               </div>
            </div>
         </div>
      </div>
   )
}

// 储物袋界面 (作为主视图使用)
const InventoryView = ({ inventory, onItemClick, player }) => {
    return (
      <div className="h-full flex flex-col">
         <Card title="随身储物袋" className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-stone-900">
               <div className="grid grid-cols-4 md:grid-cols-6 gap-3 content-start">
                  {Object.entries(inventory).map(([k, v]) => {
                        const item = ITEMS[k];
                        const isEquipped = player.equipped?.includes(k);
                        // 根据品质显示颜色
                        let colorClass = "text-stone-400";
                        if (item.quality >= 1000) colorClass = "text-purple-400";
                        else if (item.quality >= 100) colorClass = "text-amber-200";
                        
                        return (
                           <div 
                           key={k} 
                           onClick={() => { onItemClick(k); SFX.play('click'); }}
                           className={`aspect-square bg-stone-800 rounded border ${isEquipped ? 'border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'border-stone-700 hover:border-amber-500'} cursor-pointer flex flex-col items-center justify-center relative group transition-all p-2`}
                           >
                              <div className="w-full h-full flex items-center justify-center mb-1">
                                    <ItemImage item={item} className={`${isEquipped ? 'text-cyan-400' : colorClass} group-hover:text-amber-400`} />
                              </div>
                              <span className="text-[10px] text-stone-500 truncate w-full text-center px-1">{item.name}</span>
                              <span className="absolute top-0 right-0 bg-stone-900 text-amber-600 text-[9px] px-1 rounded-bl border-l border-b border-stone-700">{v}</span>
                              {isEquipped && <div className="absolute top-0 left-0 bg-cyan-900/80 text-cyan-200 text-[8px] px-1 rounded-br">已装备</div>}
                           </div>
                        )
                  })}
                  {[...Array(Math.max(0, 18 - Object.keys(inventory).length))].map((_, i) => (
                        <div key={i} className="aspect-square bg-stone-900/50 rounded border border-stone-800/50"></div>
                  ))}
               </div>
            </div>
         </Card>
      </div>
    );
};

/**
 * ==============================================================================
 * 6. MAIN APP
 * ==============================================================================
 */

export default function CultivationGame() {
  const [player, setPlayer] = useState({
    name: "韩立", realmIdx: 0, exp: 0, hp: 50, maxHp: 50, mp: 100, maxMp: 100, gold: 10, age: 16, maxAge: 100,
    inventory: { pillQi: 5, herbSeed: 5, talismanFire: 3, ironSword: 1 },
    learnedMethods: [], equipped: [],
    spiritRoots: { metal: 3, wood: 8, water: 5, fire: 2, earth: 4 } // 初始灵根
  });

  const [view, setView] = useState("cave");
  const [logs, setLogs] = useState(["欢迎来到凡人修仙传 Origin。你资质平庸，踏上修仙之路。"]);
  const [bottleCharge, setBottleCharge] = useState(0); 
  const [garden, setGarden] = useState([]); 
  const [combatState, setCombatState] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [fx, setFx] = useState(null); 
  const [toast, setToast] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPlanting, setShowPlanting] = useState(false);
  const [showAlchemySelect, setShowAlchemySelect] = useState(false); 
  const [showStats, setShowStats] = useState(false);
  const [showEnemyInfo, setShowEnemyInfo] = useState(false);
  const [showPillSelect, setShowPillSelect] = useState(false); 

  const [alchemyState, setAlchemyState] = useState({ active: false, progress: 0, result: null });

  const [isMeditating, setIsMeditating] = useState(false);
  const [meditationTime, setMeditationTime] = useState(0); 
  const [breathPhase, setBreathPhase] = useState('idle');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [breakthroughRealm, setBreakthroughRealm] = useState(""); 
  const [isDripping, setIsDripping] = useState(false);
  const [ageYearTrigger, setAgeYearTrigger] = useState(false); // 岁数增加特效触发

  const [exploreState, setExploreState] = useState({ active: false, progress: [], result: null, step: 0 });

  const logEndRef = useRef(null);
  const isInitialMount = useRef(true);

  const handleInteraction = useCallback(() => {
    if (soundEnabled && !SFX.ctx) SFX.init();
  }, [soundEnabled]);

  const showToast = (msg) => {
     setToast(msg);
     setTimeout(() => setToast(null), 2500);
  };

  const handleFxClose = useCallback(() => {
     setFx(null);
     if (fx === 'alchemy_fail' || fx === 'alchemy_success') {
        setAlchemyState({ active: false, progress: 0, result: null });
     }
  }, [fx]);

  const handleLevelUpClose = () => {
    setShowLevelUp(false);
  };

  const triggerFx = (type) => {
     setFx(type);
  };

  const toChineseNum = (num) => {
     const chars = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
     return num.toString().split('').map(d => chars[parseInt(d)]).join('');
  }

  const formatAncientTime = (seconds) => {
     const y = Math.floor(seconds / 360);
     const m = Math.floor((seconds % 360) / 30);
     const d = Math.floor(seconds % 30);
     return `${y > 0 ? toChineseNum(y) + '载 ' : ''}${m > 0 ? toChineseNum(m) + '月 ' : ''}${toChineseNum(d)}日`;
  }

  // 切换吐纳状态
  const toggleMeditation = () => {
      // 检查是否处于瓶颈期
      const stats = getStats();
      if (player.exp >= Math.floor(stats.maxExp * 0.95) && player.exp < stats.maxExp) {
          showToast("修为已至瓶颈，无法继续吐纳");
          return;
      }
      
      const newState = !isMeditating;
      setIsMeditating(newState);
      if (newState) {
          if(soundEnabled) SFX.play('breath_in');
      }
  };

  useEffect(() => {
    const savedData = localStorage.getItem('hanli_origin_save_v4_7');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // 合并灵根数据以防旧存档缺失
        setPlayer(prev => ({ 
            ...prev, 
            ...parsed.player,
            spiritRoots: parsed.player.spiritRoots || prev.spiritRoots 
        }));
        setGarden(parsed.garden || []);
        setBottleCharge(parsed.bottleCharge || 0);
        showToast(">>> 读取存档成功 <<<");
      } catch (e) { console.error(e); }
    }
    isInitialMount.current = false;
    window.addEventListener('click', () => SFX.init(), { once: true });
  }, []);

  useEffect(() => {
    if (isInitialMount.current) return;
    localStorage.setItem('hanli_origin_save_v4_7', JSON.stringify({ player, garden, bottleCharge }));
  }, [player, garden, bottleCharge]);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  useEffect(() => {
    const timer = setInterval(() => setBottleCharge(prev => Math.min(prev + 5, 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  // 骨龄增加特效监听
  useEffect(() => {
      if (Math.floor(player.age) > Math.floor(player.age - (1/36))) {
          setAgeYearTrigger(true);
          setTimeout(() => setAgeYearTrigger(false), 2000);
      }
  }, [Math.floor(player.age)]);

  useEffect(() => {
    let interval;
    let timerInterval;
    if (isMeditating) {
      if (breathPhase === 'idle') setBreathPhase('in');
      interval = setInterval(() => {
        setBreathPhase(prev => {
          if (prev === 'in') {
             if(soundEnabled) SFX.play('breath_out');
             processMeditationGain();
             return 'out';
          } else {
             if(soundEnabled) SFX.play('breath_in');
             return 'in';
          }
        });
      }, 5000);
      
      timerInterval = setInterval(() => {
         setMeditationTime(prev => prev + 1);
      }, 1000); 

      if (breathPhase === 'idle' && soundEnabled) SFX.play('breath_in');
    } else {
      setBreathPhase('idle');
      setMeditationTime(0);
    }
    return () => { clearInterval(interval); clearInterval(timerInterval); };
  }, [isMeditating, soundEnabled]);

  const getStats = () => {
    const realm = REALMS[player.realmIdx];
    let atk = realm.atk;
    let def = realm.def;
    let expMult = 1;
    let spirit = realm.spirit || 1;

    player.equipped?.forEach(id => {
      if (ITEMS[id].atkBonus) atk += ITEMS[id].atkBonus;
      if (ITEMS[id].defBonus) def += ITEMS[id].defBonus;
    });
    player.learnedMethods?.forEach(id => {
      const passive = ITEMS[id].passive;
      if (passive.type === 'atk') atk += passive.val;
      if (passive.type === 'exp_rate') expMult *= passive.val;
    });
    return { atk, def, expMult, maxExp: realm.maxExp, spirit };
  };

  const addLog = (msg) => setLogs(prev => [...prev.slice(-29), `[${new Date().toLocaleTimeString().slice(0,5)}] ${msg}`]);

  const gainItem = (key, count = 1) => {
    setPlayer(prev => ({
      ...prev,
      inventory: { ...prev.inventory, [key]: (prev.inventory[key] || 0) + count }
    }));
    SFX.play('success');
    addLog(`获得了 ${ITEMS[key].name} x${count}`);
    showToast(`获得: ${ITEMS[key].name} x${count}`);
  };

  const consumeItem = (key, count = 1) => {
    if ((player.inventory[key] || 0) < count) { 
        SFX.play('error'); 
        showToast(`缺少材料: ${ITEMS[key].name}`);
        return false; 
    }
    setPlayer(prev => {
      const newInv = { ...prev.inventory };
      newInv[key] -= count;
      if (newInv[key] <= 0) delete newInv[key];
      return { ...prev, inventory: newInv };
    });
    return true;
  };

  const processMeditationGain = () => {
    const stats = getStats();
    const currentRealm = REALMS[player.realmIdx];
    if (player.exp >= currentRealm.maxExp * 0.95) {
       showToast("修为瓶颈！需破境丹药");
       setIsMeditating(false);
       return;
    }
    if (player.hp < player.maxHp * 0.2) {
       showToast("身体虚弱，停止吐纳");
       setIsMeditating(false);
       return;
    }
    
    setPlayer(prev => {
        // 1秒增加 1/360 岁 (即1年需要360秒) -> 这里稍微调快一点方便展示，1秒=1天，1年=360秒
        let nextAge = prev.age + (1/360 * 5); // 每次吐纳5秒
        
        const baseGain = 5; 
        const gain = Math.floor(baseGain * stats.expMult);
        const hpRec = Math.floor(player.maxHp * 0.05);
        
        let nextExp = prev.exp + gain;
        const cap = Math.floor(currentRealm.maxExp * 0.95);
        if (nextExp > cap) nextExp = cap;
        
        return { ...prev, exp: nextExp, hp: Math.min(prev.maxHp, prev.hp + hpRec), age: nextAge };
    });
  };

  const useItem = (key) => {
    const item = ITEMS[key];
    const realm = REALMS[player.realmIdx];
    
    if (combatState) {
       if(combatState.turn !== 'player') {
          showToast("还未轮到你的回合");
          return;
       }
       if (item.type === 'weapon') {
          if (consumeItem(key)) {
             executeCombatTurn('item_attack', item.dmg, item.name);
          }
          return;
       }
       if (item.type === 'consumable') {
          if (consumeItem(key)) {
             setPlayer(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + (item.hpRegen || 0)) }));
             showToast(`使用了 ${item.name}`);
             triggerFx('consume_pill');
             setTimeout(() => {
                setCombatState(prev => ({ ...prev, turn: 'enemy', log: [...prev.log, `使用了${item.name}，恢复状态。`] }));
             }, 1000);
          }
          return;
       }
       showToast("战斗中无法使用此物");
       return;
    }

    setShowPillSelect(false);

    if (item.type === 'method') {
      if (player.learnedMethods?.includes(key)) { showToast("已习得此功法"); return; }
      consumeItem(key);
      setPlayer(prev => ({ ...prev, learnedMethods: [...(prev.learnedMethods || []), key] }));
      showToast(`研读成功: ${item.name}`);
      return;
    }
    if (item.type === 'equip') {
      if (player.equipped?.includes(key)) {
         setPlayer(prev => ({ ...prev, equipped: prev.equipped.filter(k => k !== key) }));
         showToast(`卸下: ${item.name}`);
      } else {
         setPlayer(prev => ({ ...prev, equipped: [...(prev.equipped || []), key] }));
         showToast(`装备: ${item.name}`);
      }
      return;
    }
    if (item.type === 'consumable') {
      const isAtBottleneck = player.exp >= Math.floor(realm.maxExp * 0.95);
      const isCorrectPill = realm.pill === key;
      if (isAtBottleneck) {
        if (isCorrectPill) {
           if (consumeItem(key)) {
             setPlayer(prev => ({ ...prev, exp: realm.maxExp })); 
             showToast("瓶颈突破！修为圆满");
             SFX.play('magic');
             triggerFx('consume_pill');
           }
           return;
        } else {
           showToast(`无效！需服用: ${ITEMS[realm.pill].name}`);
           return;
        }
      }
      if (!isAtBottleneck || item.hpRegen) {
         if (consumeItem(key)) {
            setPlayer(prev => {
                const cap = Math.floor(realm.maxExp * 0.95);
                let nextExp = prev.exp;
                if (item.exp) {
                    nextExp = Math.min(prev.exp + item.exp, cap);
                }
                const nextHp = item.hpRegen ? Math.min(prev.maxHp, prev.hp + item.hpRegen) : prev.hp;
                if (item.exp && nextExp === cap && prev.exp < cap) {
                    setTimeout(() => showToast("修为已至瓶颈！"), 500);
                }
                return { ...prev, exp: nextExp, hp: nextHp };
            });
            showToast(`服用: ${item.name}`);
            SFX.play('magic');
            triggerFx('consume_pill');
         }
      } else if (item.effect === 'breakthrough_major') {
         showToast("仅在冲击大境界时使用");
      }
    }
    
    if (combatState && item.type === 'weapon') {
        if (consumeItem(key)) {
            combatAction('item_attack', item.dmg, item.name);
        }
    }
  };

  const attemptBreakthrough = () => {
    const currentRealm = REALMS[player.realmIdx];
    if (player.exp < currentRealm.maxExp) {
      showToast("修为未圆满，不可突破"); return;
    }
    const isMajor = currentRealm.name.includes("圆满");
    if (isMajor && !consumeItem('pillZhuJi')) {
       showToast("无筑基丹，必死无疑！"); return;
    }
    const successRate = isMajor ? 0.5 : 0.8;
    if (Math.random() < successRate) {
       const newIdx = player.realmIdx + 1;
       if (newIdx >= REALMS.length) { showToast("已臻化境，前路未开"); return; }
       setBreakthroughRealm(REALMS[newIdx].name); 
       setShowLevelUp(true);
       SFX.play('level_up');
       
       setPlayer(prev => ({
         ...prev, 
         realmIdx: newIdx, 
         exp: 0, 
         maxHp: REALMS[newIdx].hp, 
         hp: REALMS[newIdx].hp, 
         maxMp: 100 + newIdx * 20, 
         mp: 100 + newIdx * 20,
         maxAge: REALMS[newIdx].life 
       }));
       showToast(`突破成功！晋升${REALMS[newIdx].name}`);
       addLog(`>>> 突破成功！晋升为【${REALMS[newIdx].name}】 <<<`);
    } else {
       const dmg = Math.floor(player.maxHp * 0.5);
       setPlayer(prev => ({ ...prev, hp: Math.max(1, prev.hp - dmg), exp: Math.floor(currentRealm.maxExp * 0.8) }));
       showToast("突破失败！走火入魔");
       triggerFx('breakthrough_fail');
       setIsMeditating(false); // 停止吐纳
       SFX.play('error');
    }
  };

  const startAlchemy = (herbType) => {
      if (!consumeItem(herbType, 1)) {
          showToast(`缺少材料: ${ITEMS[herbType].name}`);
          return;
      }
      setShowAlchemySelect(false);
      
      const item = ITEMS[herbType];
      // 概率：普通5%，每百年+10%，千年100%
      let rate = 0.05;
      if (item.quality >= 1000) rate = 1.0;
      else if (item.quality >= 100) rate = 0.05 + Math.floor(item.quality/100) * 0.1;
      
      setAlchemyState({ active: true, progress: 0, result: null, successRate: rate });
      SFX.play('magic');
  };

  const collectPill = () => {
      gainItem('pillQi'); 
      setAlchemyState({ active: false, progress: 0, result: null });
      setFx(null); 
  };

  useEffect(() => {
      let timer;
      if (alchemyState.active && alchemyState.progress < 100) {
          timer = setInterval(() => {
              setAlchemyState(prev => ({ ...prev, progress: prev.progress + 2 }));
          }, 50);
      } else if (alchemyState.active && alchemyState.progress >= 100 && !alchemyState.result) {
          if (Math.random() < alchemyState.successRate) {
             setAlchemyState(prev => ({ ...prev, result: 'success' }));
             triggerFx('alchemy_success');
             SFX.play('success');
             
             // 自动收取
             setTimeout(() => {
                 collectPill();
                 showToast("丹药已自动收入储物袋");
             }, 1500);

          } else {
             setAlchemyState(prev => ({ ...prev, result: 'fail' }));
             triggerFx('alchemy_fail');
             SFX.play('explosion');
          }
      }
      return () => clearInterval(timer);
  }, [alchemyState]);

  const startExplore = () => {
    if(isMeditating) {
        setIsMeditating(false);
        showToast("停止吐纳，外出历练");
    }
    setExploreState({ active: true, progress: [], result: null, step: 0 });
    SFX.play('fly');
    
    const steps = ["御剑离宗...", "飞越荒山...", "神识扫描..."];
    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setExploreState(prev => ({ ...prev, progress: [...prev.progress, steps[currentStep]], step: currentStep }));
        if (currentStep === 0) SFX.play('fly'); 
        currentStep++;
      } else {
        clearInterval(interval);
        finishExplore();
      }
    }, 800); 
  };

  const finishExplore = () => {
     const rand = Math.random();
     if (rand < 0.3) {
       const itemKeys = Object.keys(ITEMS).filter(k => ITEMS[k].type === "material" || k === "herbSeed");
       if (itemKeys.length > 0) {
         const lootKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
         setExploreState(prev => ({ ...prev, result: { type: 'loot', key: lootKey } }));
         SFX.play('success');
       } else {
         setExploreState(prev => ({ ...prev, result: { type: 'empty' } }));
       }
     } else if (rand < 0.75) {
       const enemy = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
       setExploreState(prev => ({ ...prev, result: { type: 'enemy', data: enemy } }));
       SFX.play('attack');
     } else {
       setExploreState(prev => ({ ...prev, result: { type: 'empty' } }));
     }
  };

  const closeExplore = () => {
     const res = exploreState.result;
     if (res && res.type === 'loot') gainItem(res.key);
     if (res && res.type === 'enemy') {
        // 安全检查：确保 enemy 数据存在且完整
        if (res.data) {
            setCombatState({ 
                enemy: { ...res.data, maxHp: res.data.hp }, 
                log: [`遭遇 ${res.data.name}！`], 
                turn: 'player', 
                isAnimating: false
            });
            setView("combat"); 
        } else {
            console.error("Explore enemy data missing", res);
            showToast("遭遇未知敌人，侥幸逃脱！");
        }
     } 
     setExploreState({ active: false, progress: [], result: null, step: 0 });
  };

  const executeCombatTurn = (action, val = 0, name = "") => {
    if (!combatState || combatState.isAnimating) return;
    
    const { atk, def } = getStats();
    let dmg = 0;
    let newLog = [...combatState.log];
    
    if (action === 'escape') {
        triggerFx('escape');
        SFX.play('fly');
        setTimeout(() => {
            setExploreState({ active: false, progress: [], result: null, step: 0 });
            setCombatState(null); 
            setView("explore"); 
            showToast("逃跑成功！");
        }, 800);
        return;
    }

    if (action === 'attack') {
        dmg = Math.max(1, atk - combatState.enemy.def);
        SFX.play('attack');
        triggerFx('attack');
        newLog.push(`你发起攻击，造成 ${dmg} 点伤害。`);
    } else if (action === 'item_attack') {
        dmg = val; 
        SFX.play('explosion');
        triggerFx('attack');
        newLog.push(`你祭出${name}，轰出 ${dmg} 点伤害！`);
    }

    let enemyHp = Math.max(0, combatState.enemy.hp - dmg);
    
    setCombatState(prev => ({
        ...prev,
        enemy: { ...prev.enemy, hp: enemyHp },
        log: newLog,
        isAnimating: true 
    }));

    if (enemyHp <= 0) {
        setTimeout(() => {
            setCombatState(prev => ({
               ...prev,
               victory: true,
               loot: combatState.enemy.loot || "spiritStone",
               isAnimating: false
            }));
            SFX.play('success');
        }, 1000);
        return;
    }

    setTimeout(() => {
        const enemyAtk = combatState.enemy.atk;
        const taken = Math.max(1, enemyAtk - def);
        
        SFX.play('hit');
        triggerFx('hit');
        
        setPlayer(prev => {
            const newHp = prev.hp - taken;
            if (newHp <= 0) {
                setTimeout(() => {
                    setPlayer(p => ({...p, hp: 1, realmIdx: Math.max(0, p.realmIdx - 1), exp: 0}));
                    setExploreState({ active: false, progress: [], result: null, step: 0 });
                    setCombatState(null); 
                    setView("cave"); 
                    showToast("重伤濒死！境界跌落");
                }, 1000);
            }
            return { ...prev, hp: newHp };
        });

        setCombatState(prev => ({
            ...prev,
            log: [...prev.log, `${prev.enemy.name} 发起反击，你受到 ${taken} 点伤害！`],
            turn: 'player', 
            isAnimating: false 
        }));

    }, 1500);
  };

  const claimVictory = () => {
     gainItem(combatState.loot);
     setExploreState({ active: false, progress: [], result: null, step: 0 });
     setCombatState(null);
     setView("explore");
  };

  const getHerbName = (p) => {
     const base = "黄龙草";
     const nums = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
     const century = Math.floor(p.year / 100);
     if (p.year >= 1000) return "千年" + base;
     if (century > 0) return `${nums[century]}百年` + base;
     return "黄龙草幼苗";
  };

  const ripenHerb = (id) => {
    if (bottleCharge < 100) { showToast("掌天瓶灵液不足"); return; }
    
    setIsDripping(true);
    SFX.play('drip');
    
    setTimeout(() => {
        setBottleCharge(prev => prev - 100);
        setGarden(prev => prev.map(p => {
            if (p.id === id) {
                const newYear = p.year + 100;
                return { ...p, year: newYear, progress: 100 };
            }
            return p;
        }));
        setIsDripping(false);
        showToast("催熟成功！药龄+100年");
        SFX.play('magic');
    }, 800); 
  };

  const harvestHerb = (id, year) => {
    setGarden(prev => prev.filter(p => p.id !== id));
    if (year >= 1000) gainItem("spiritHerb_1000", 1);
    else if (year >= 100) gainItem("spiritHerb_100", 1);
    else gainItem("spiritHerb", 1);
  };

  const plantHerb = (seedId) => {
    if (garden.length >= 4) { showToast("药园已满"); return; }
    if (consumeItem(seedId)) {
        setGarden(prev => [...prev, { name: "黄龙草幼苗", year: 0, progress: 0, id: Date.now() }]);
        setShowPlanting(false);
    }
  };

  const tradeItem = (id, type) => {
    const item = ITEMS[id];
    if (type === 'buy') {
       if (player.gold >= item.price) {
          setPlayer(prev => ({...prev, gold: prev.gold - item.price}));
          gainItem(id);
       } else { SFX.play('error'); showToast("灵石不足"); }
    } else {
       if (consumeItem(id)) {
          setPlayer(prev => ({...prev, gold: prev.gold + item.price}));
          showToast(`出售成功 +${item.price}灵石`);
       }
    }
  };

  const stats = getStats();

  return (
    <div onClick={handleInteraction} className="min-h-screen bg-stone-950 text-stone-300 font-sans flex flex-col md:flex-row overflow-hidden select-none relative">
      
      {fx && <VisualEffects type={fx} onComplete={handleFxClose} onClose={handleFxClose} />}
      {toast && <VisualEffects type="toast" text={toast} onComplete={() => {}} />}
      
      {selectedItem && (
        <ItemDetailModal 
           itemId={selectedItem} 
           onClose={() => setSelectedItem(null)} 
           onUse={() => useItem(selectedItem)}
        />
      )}

      {showPlanting && (
         <PlantingModal 
            inventory={player.inventory} 
            onClose={() => setShowPlanting(false)} 
            onPlant={plantHerb}
         />
      )}

      {showAlchemySelect && (
         <AlchemySelectModal 
            inventory={player.inventory} 
            onClose={() => setShowAlchemySelect(false)} 
            onSelect={startAlchemy}
         />
      )}

      {showPillSelect && (
         <PillSelectModal 
            inventory={player.inventory} 
            onClose={() => setShowPillSelect(false)} 
            onUse={useItem} 
         />
      )}

      {showStats && (
         <PlayerStatsModal 
            player={player} 
            stats={stats} 
            onClose={() => setShowStats(false)} 
         />
      )}

      {showEnemyInfo && combatState && (
         <EnemyDetailModal enemy={combatState.enemy} onClose={() => setShowEnemyInfo(false)} />
      )}

      {showLevelUp && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-in fade-in duration-500">
            <div className="text-center relative">
               <button onClick={handleLevelUpClose} className="absolute -top-16 right-0 text-stone-500 hover:text-amber-500 z-50"><X size={40}/></button>
               <div className="absolute inset-0 bg-amber-500 blur-[100px] opacity-50 animate-pulse"></div>
               <h1 className="text-6xl md:text-8xl font-bold text-amber-100 font-serif mb-4 relative z-10 animate-bounce">
                  境界突破
               </h1>
               <div className="text-4xl text-amber-400 font-serif relative z-10 mt-4 border-t border-b border-amber-500/50 py-2">
                  {breakthroughRealm}
               </div>
               <div className="text-xl text-amber-200/70 font-serif relative z-10 mt-2">
                  大道可期 · 寿元大增
               </div>
            </div>
         </div>
      )}

      <nav className="w-full md:w-64 bg-stone-900 border-r border-amber-900/30 flex flex-col shrink-0 h-screen md:h-auto overflow-hidden">
        <div className="p-6 bg-stone-900/50 border-b border-amber-900/30 flex-shrink-0">
          <h1 className="text-2xl font-serif font-bold text-amber-500 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> 凡人修仙
          </h1>
          <p className="text-xs text-stone-500 mt-1">Origin v4.7 (图鉴篇)</p>
        </div>
        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          {[
            { id: 'cave', icon: Mountain, label: '洞府静室' },
            { id: 'garden', icon: Leaf, label: '灵药园' },
            { id: 'alchemy', icon: FlaskConical, label: '炼丹房' },
            { id: 'explore', icon: MapIcon, label: '外出历练' },
            { id: 'shop', icon: ShoppingBag, label: '坊市' },
            { id: 'inventory', icon: Package, label: '储物袋' },
          ].map(item => (
            <button key={item.id} onClick={() => { setView(item.id); SFX.play('click'); }} className={`w-full text-left px-6 py-3 flex items-center gap-3 font-serif ${view === item.id ? 'text-amber-500 bg-amber-900/20 border-r-4 border-amber-600' : 'text-stone-500 hover:text-stone-300'}`}>
              <item.icon size={20} /> {item.label}
            </button>
          ))}
          <div className="mt-8 px-6 space-y-2 text-xs text-stone-500 font-mono border-t border-stone-800 pt-4">
             <div className="flex justify-between"><span>攻击:</span> <span className="text-stone-300">{stats.atk}</span></div>
             <div className="flex justify-between"><span>防御:</span> <span className="text-stone-300">{stats.def}</span></div>
             <div className="flex justify-between"><span>修炼效率:</span> <span className="text-stone-300">{Math.round(stats.expMult * 100)}%</span></div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col min-w-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] h-screen overflow-hidden">
        <header className="bg-stone-900/80 backdrop-blur p-4 flex flex-wrap gap-6 items-center border-b border-amber-900/30 z-10 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-[150px] cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setShowStats(true)}>
             <div className="w-10 h-10 rounded-full bg-stone-800 border border-amber-700 flex items-center justify-center">
               <User className={`w-6 h-6 ${REALMS[player.realmIdx].color}`} />
             </div>
             <div>
               <div className="text-stone-200 font-bold font-serif">{player.name}</div>
               <div className="text-amber-600 text-xs">{REALMS[player.realmIdx].name}</div>
             </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <ProgressBar 
               value={player.hp} max={player.maxHp} color="bg-red-700" label="气血" 
            />
            <ProgressBar 
               value={player.exp} max={stats.maxExp} color="bg-cyan-700" label="修为"
               isBottleneck={player.exp >= Math.floor(stats.maxExp * 0.95) && player.exp < stats.maxExp}
               showFluctuation={isMeditating} // 吐纳时显示波动
            />
          </div>
          <div className="flex items-center gap-4 text-amber-500 font-mono font-bold">
             <div className="flex flex-col items-end mr-4 text-xs text-stone-400">
                <span className={`transition-all duration-300 ${ageYearTrigger ? 'text-amber-200 scale-110' : ''}`}>
                    骨龄: {player.age.toFixed(0)} 岁
                </span>
                <span>寿元: {player.maxAge} 岁</span>
             </div>
             <span className="flex items-center gap-1"><Coins size={16}/> {player.gold}</span>
             <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-stone-500 hover:text-amber-500">
                {soundEnabled ? <Volume2 size={20}/> : <VolumeX size={20}/>}
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           
           {view === "combat" && combatState && (
              <div className="absolute inset-0 z-20 bg-stone-950/95 flex items-center justify-center p-4">
                 <Card title={`遭遇战：${combatState.enemy.name}`} className={`w-full max-w-3xl relative border-2 ${combatState.enemy.realmIdx >= player.realmIdx ? 'border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'border-red-900'}`}>
                    
                    {combatState.enemy.realmIdx >= player.realmIdx && (
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs px-3 py-1 rounded animate-pulse shadow-lg font-bold flex items-center gap-1 z-30">
                            <AlertTriangle size={12}/> 危险！境界压制
                        </div>
                    )}

                    {combatState.victory && (
                       <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center animate-in zoom-in duration-300">
                          <button onClick={() => setCombatState(null)} className="absolute top-8 right-8 text-stone-500 hover:text-white"><X size={32}/></button>
                          <h2 className="text-4xl font-bold text-amber-500 mb-6 font-serif">大 获 全 胜</h2>
                          <div className="bg-stone-800 border border-amber-700 p-4 rounded-lg flex flex-col items-center mb-8 animate-bounce">
                             <div className="text-stone-400 text-sm mb-2">战利品</div>
                             <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-stone-900 rounded flex items-center justify-center border border-stone-600 p-1">
                                   {/* 安全访问 ITEMS */}
                                   <ItemImage item={ITEMS[combatState.loot] || {}} className="text-amber-400" />
                                </div>
                                {/* 安全访问 ITEMS */}
                                <span className="text-amber-100">{ITEMS[combatState.loot]?.name || '未知物品'}</span>
                             </div>
                          </div>
                          <Button onClick={claimVictory} variant="primary" className="w-40 py-3 text-lg">
                             <Hand size={20}/> 拾取战利品
                          </Button>
                       </div>
                    )}

                    <div className="flex justify-between items-stretch h-64 mb-6 relative">
                       <div className="w-1/3 bg-stone-900/50 border-r border-stone-800 p-4 flex flex-col items-center justify-center relative">
                          <div className={`relative ${combatState.turn === 'enemy' ? 'scale-110 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]' : ''} transition-all duration-300`}>
                             <div className="w-24 h-24 flex items-center justify-center">
                                <Skull className="text-red-500 w-20 h-20" />
                             </div>
                          </div>
                          <span className="mt-2 text-red-400 font-bold text-lg">{combatState.enemy.name}</span>
                          <span className="text-xs text-stone-500">{combatState.enemy.realm}</span>
                          
                          <div className="w-full mt-4 space-y-1">
                             <ProgressBar value={combatState.enemy.hp} max={combatState.enemy.maxHp} color="bg-red-600" label="气血" height="h-2" showText={false}/>
                             <div className="flex justify-between text-[10px] text-stone-500 px-1">
                                <span>HP: {combatState.enemy.hp}</span>
                                <span>ATK: {combatState.enemy.atk}</span>
                             </div>
                          </div>
                          <button onClick={() => setShowEnemyInfo(true)} className="absolute top-2 left-2 text-stone-600 hover:text-stone-300"><Eye size={16}/></button>
                       </div>

                       <div className="flex-1 flex flex-col justify-between p-4 relative">
                          <div className="text-center text-red-900/20 text-8xl font-black italic absolute inset-0 flex items-center justify-center select-none pointer-events-none">VS</div>
                          <div className="flex-1 overflow-y-auto font-mono text-xs text-stone-400 space-y-1 z-10 scrollbar-hide flex flex-col justify-end">
                             {combatState.log.slice(-6).map((l, i) => (
                                <div key={i} className="animate-in fade-in slide-in-from-bottom-1 duration-300">{l}</div>
                             ))}
                          </div>
                       </div>

                       <div className="w-1/3 bg-stone-900/50 border-l border-stone-800 p-4 flex flex-col items-center justify-center">
                          <div className={`relative ${combatState.turn === 'player' ? 'scale-110 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]' : ''} transition-all duration-300`}>
                             <div className="w-24 h-24 bg-stone-800 rounded-full border-2 border-stone-600 flex items-center justify-center">
                                <User className="text-stone-400 w-12 h-12" />
                                <Sword className="absolute -right-4 top-4 text-amber-500 w-8 h-8 -rotate-12" />
                             </div>
                          </div>
                          <span className="mt-2 text-stone-300 font-bold text-lg">{player.name}</span>
                          <span className="text-xs text-stone-500">{REALMS[player.realmIdx].name}</span>

                          <div className="w-full mt-4 space-y-1">
                             <ProgressBar value={player.hp} max={player.maxHp} color="bg-green-600" label="气血" height="h-2" showText={false}/>
                             <div className="flex justify-between text-[10px] text-stone-500 px-1">
                                <span>HP: {player.hp}</span>
                                <span>MP: {player.mp}</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="grid grid-cols-2 gap-3">
                          <Button 
                             onClick={() => executeCombatTurn('attack')} 
                             disabled={combatState.turn !== 'player' || combatState.isAnimating || combatState.victory}
                             className={combatState.turn !== 'player' ? 'opacity-50' : ''}
                          >
                             <Sword size={16}/> 普通攻击
                          </Button>
                          <Button onClick={() => executeCombatTurn('escape')} variant="danger" disabled={combatState.victory}><Wind size={16}/> 逃跑</Button>
                       </div>
                       
                       <div className="border-t border-stone-700 pt-2">
                          <div className="text-xs text-stone-500 mb-2 font-bold">快捷使用</div>
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                             {Object.keys(player.inventory).filter(k => ['weapon', 'consumable'].includes(ITEMS[k].type)).map(k => {
                                const item = ITEMS[k];
                                return (
                                <button 
                                   key={k} 
                                   onClick={() => useItem(k)} 
                                   disabled={combatState.turn !== 'player' || combatState.isAnimating || combatState.victory}
                                   className="shrink-0 bg-stone-800 border border-stone-600 px-2 py-1 rounded text-xs hover:border-amber-500 flex items-center gap-2 group transition-colors disabled:opacity-50"
                                >
                                   <div className="w-4 h-4">
                                      <ItemImage item={item} className="text-stone-400 group-hover:text-amber-500"/>
                                   </div>
                                   <span>{item.name}</span>
                                   <span className="text-amber-600 bg-black/30 px-1 rounded">x{player.inventory[k]}</span>
                                </button>
                             )})}
                          </div>
                       </div>
                    </div>
                 </Card>
              </div>
           )}

           <div className="flex flex-col h-full gap-4">
              
              {view === "cave" && (
                <Card title="洞府静室" glow={isMeditating} noBorder={true} className="flex-1 flex flex-col justify-end relative overflow-hidden h-full">
                    {/* 背景层 */}
                    <div className={`absolute inset-0 transition-colors duration-[5000ms] ${breathPhase === 'in' ? 'bg-sky-900/30' : 'bg-black'}`}></div>
                    
                    {/* 星空层 - 仅在入定且吐纳时显示，且有缓慢旋转 */}
                    <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-60 animate-[spin_120s_linear_infinite] transition-opacity duration-1000 ${isMeditating ? 'opacity-60' : 'opacity-0'}`}></div>

                    {/* 日月轨迹 - 以人物（底部中心）为圆心旋转，仅在入定时显示 */}
                    <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-1000 ${isMeditating ? 'opacity-100' : 'opacity-0'}`}>
                        {/* 太阳轨道 */}
                        <div className={`absolute bottom-0 left-1/2 w-[120vh] h-[120vh] -translate-x-1/2 transition-transform duration-[5000ms] ease-linear`} 
                            style={{ 
                                transformOrigin: '50% 100%', // 底部中心为旋转点
                                transform: breathPhase === 'in' ? 'rotate(0deg)' : 'rotate(180deg)' // 左(-90)到右(90) 或者 0-180根据初始设定
                            }}>
                            {/* 初始位置设在左侧地平线，in时转到右侧 */}
                            <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-full h-full" style={{ transform: 'rotate(-180deg)' }}> 
                                {/* 修正太阳位置：轨道边缘 */}
                                <div className={`absolute top-[10%] left-1/2 -translate-x-1/2 text-amber-300 transition-opacity duration-1000 ${breathPhase === 'in' ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="w-16 h-16 rounded-full bg-amber-400 shadow-[0_0_60px_30px_rgba(251,191,36,0.5)] flex items-center justify-center">
                                        <div className="w-10 h-10 bg-amber-100 rounded-full blur-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* 月亮轨道 */}
                        <div className={`absolute bottom-0 left-1/2 w-[120vh] h-[120vh] -translate-x-1/2 transition-transform duration-[5000ms] ease-linear`} 
                            style={{ 
                                transformOrigin: '50% 100%', 
                                transform: breathPhase === 'out' ? 'rotate(0deg)' : 'rotate(180deg)' 
                            }}>
                             <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-full h-full" style={{ transform: 'rotate(-180deg)' }}>
                                <div className={`absolute top-[10%] left-1/2 -translate-x-1/2 text-indigo-100 transition-opacity duration-1000 ${breathPhase === 'out' ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="w-12 h-12 rounded-full bg-slate-200 shadow-[0_0_30px_10px_rgba(199,210,254,0.3)]"></div>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* 留空顶部区域，内容沉底 */}
                    <div className="flex-1"></div> 

                    {/* 人物与地面 */}
                    <div className="relative w-full flex flex-col items-center z-10">
                        {/* 地面 */}
                        <div className="absolute bottom-[-40px] w-[150%] h-48 bg-gradient-to-t from-stone-900 via-stone-800 to-transparent rounded-[50%] blur-md opacity-90 pointer-events-none"></div>
                        
                        {/* 吐纳光效 - 仅在入定时显示 */}
                        <div className={`absolute bottom-20 flex items-end justify-center pointer-events-none transition-opacity duration-1000 ${isMeditating ? 'opacity-100' : 'opacity-0'}`}>
                            <div className={`w-4 h-60 bg-amber-200/30 blur-md rounded-full transition-all duration-[4000ms] ease-in-out ${breathPhase === 'in' ? '-translate-y-8 opacity-100 scale-y-110' : 'translate-y-0 opacity-10 scale-y-50'}`}></div>
                            <div className={`absolute w-60 h-60 rounded-full border border-amber-500/20 transition-all duration-[4000ms] ${breathPhase === 'in' ? 'scale-110 opacity-50' : 'scale-90 opacity-0'}`}></div>
                        </div>
                        
                        {/* 人物 SVG - 可点击切换吐纳状态，添加浮动动画 */}
                        <div 
                            onClick={toggleMeditation}
                            className={`mb-4 relative z-10 origin-bottom cursor-pointer transition-all duration-[3000ms] ease-in-out ${isMeditating ? 'scale-125' : 'scale-100 hover:scale-105'}`}
                            style={isMeditating ? { animation: 'floatBreathe 4s infinite ease-in-out' } : {}}
                        >
                            {isMeditating ? (
                                <svg width="100" height="100" viewBox="0 0 100 100" className={`text-stone-400 transition-colors duration-[4000ms] ${breathPhase === 'in' ? 'drop-shadow-[0_0_15px_rgba(251,191,36,0.3)] text-stone-300' : ''}`}>
                                    <path fill="currentColor" d="M50 20 C50 15 54 12 50 12 C46 12 50 15 50 20 Z" />
                                    <circle cx="50" cy="18" r="8" fill="currentColor" />
                                    <path fill="currentColor" d="M35 40 Q50 35 65 40 L70 85 Q50 95 30 85 Z" />
                                    <path fill="currentColor" d="M25 80 Q35 75 50 82 Q65 75 75 80 L72 90 Q50 98 28 90 Z" />
                                </svg>
                            ) : (
                                <svg width="80" height="120" viewBox="0 0 80 120" className="text-stone-500">
                                    <circle cx="40" cy="20" r="8" fill="currentColor" />
                                    <path fill="currentColor" d="M28 35 Q40 30 52 35 L55 90 Q40 95 25 90 Z" />
                                    <path fill="currentColor" d="M30 90 L30 115 L25 115" stroke="currentColor" strokeWidth="3"/>
                                    <path fill="currentColor" d="M50 90 L50 115 L55 115" stroke="currentColor" strokeWidth="3"/>
                                </svg>
                            )}
                        </div>
                        
                        {/* 操作提示文字 */}
                        {!isMeditating && (
                            <div className="text-stone-500 text-xs mt-2 animate-pulse pointer-events-none">
                                点击人物入定
                            </div>
                        )}
                    </div>
                    
                    {/* 底部信息栏 - 紧贴底部 */}
                    <div className="w-full px-6 pb-6 pt-2 relative z-20 bg-gradient-to-t from-stone-900 to-transparent flex flex-col items-center">
                        {isMeditating && (
                            <div className="text-center mb-3 animate-pulse">
                                <div className="text-amber-500/90 font-mono text-sm bg-black/40 px-3 py-1 rounded backdrop-blur-sm border border-amber-900/30">
                                    入定: {formatAncientTime(meditationTime)}
                                </div>
                            </div>
                        )}

                        {player.exp >= Math.floor(stats.maxExp * 0.95) && player.exp < stats.maxExp && (
                            <div className="text-center mb-2 animate-bounce pointer-events-auto">
                                <button 
                                    onClick={() => setShowPillSelect(true)}
                                    className="bg-red-900/90 text-red-200 px-4 py-1.5 rounded-full text-sm border border-red-500 inline-flex items-center gap-2 shadow-lg hover:bg-red-800 transition-colors"
                                >
                                    <AlertTriangle size={14}/> 瓶颈期 (点击突破)
                                </button>
                            </div>
                        )}

                        {player.exp >= stats.maxExp && (
                            <Button onClick={attemptBreakthrough} variant="primary" className="w-full py-4 text-lg ring-2 ring-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]" sound="level_up">
                                <ArrowUpCircle size={20}/> 冲击瓶颈
                            </Button>
                        )}
                    </div>
                </Card>
              )}

              {view === "shop" && (
                 <Card title="坊市" className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {SHOP_INVENTORY.map((entry, i) => {
                          const item = ITEMS[entry.id];
                          const isBuy = entry.type === 'buy';
                          return (
                             <div key={i} className="flex justify-between items-center bg-stone-800 p-3 rounded border border-stone-700">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-stone-900 rounded flex items-center justify-center p-1">
                                      <ItemImage item={item} className="text-stone-500"/>
                                   </div>
                                   <div>
                                      <div className="text-sm font-bold text-stone-300">{item.name}</div>
                                      <div className="text-[10px] text-stone-500">{item.desc.substring(0, 12)}...</div>
                                   </div>
                                </div>
                                <Button 
                                  onClick={() => tradeItem(entry.id, entry.type)} 
                                  variant={isBuy ? "secondary" : "outline"} 
                                  className="text-xs h-7 px-2"
                                  disabled={isBuy && player.gold < item.price}
                                  sound="click"
                                >
                                   {isBuy ? "购" : "售"} {item.price}
                                </Button>
                             </div>
                          )
                       })}
                    </div>
                 </Card>
              )}

              {/* 储物袋视图 */}
              {view === "inventory" && (
                  <InventoryView 
                    inventory={player.inventory} 
                    onItemClick={(k) => setSelectedItem(k)}
                    player={player}
                  />
              )}

              {(view === "garden" || view === "alchemy" || view === "explore") && (
                 <div className="flex-1 text-center py-4 bg-stone-900/50 rounded border border-stone-800 relative">
                    
                    {view === "explore" && exploreState.active && (
                       <div className="absolute inset-0 z-30 bg-stone-950 flex flex-col items-center justify-center overflow-hidden rounded-lg">
                          <div className="absolute inset-0 bg-gradient-to-b from-stone-900 to-stone-800"></div>
                          {!exploreState.result && (
                             <div className="absolute inset-0 opacity-20 animate-[flyBg_2s_linear_infinite] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                          )}
                          {!exploreState.result && (
                             <div className="relative z-10 animate-[float_2s_ease-in-out_infinite]">
                                <Swords size={80} className="text-amber-200 rotate-45 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]" />
                                <div className="absolute top-1/2 left-1/2 w-40 h-1 bg-amber-500/50 blur-md -translate-x-1/2 translate-y-10 rotate-45"></div>
                             </div>
                          )}
                          <div className="relative z-10 w-full px-8 text-center space-y-6 mt-12">
                             {!exploreState.result && (
                                <div className="flex justify-center mb-4">
                                   <Compass size={48} className="text-amber-600 animate-[spin_4s_ease-in-out_infinite]" />
                                </div>
                             )}
                             <div className="space-y-3 min-h-[120px]">
                                {exploreState.progress.map((text, i) => (
                                   <div key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-base md:text-lg text-amber-100/80">
                                      {text}
                                   </div>
                                ))}
                                {!exploreState.result && (
                                   <div className="flex justify-center gap-2 mt-4">
                                      <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce delay-0"></span>
                                      <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce delay-150"></span>
                                      <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce delay-300"></span>
                                   </div>
                                )}
                             </div>
                             {exploreState.result && (
                                <div className="animate-in zoom-in duration-300 bg-stone-900/90 border border-amber-800 p-4 rounded-lg shadow-2xl mt-4">
                                   {exploreState.result.type === 'loot' && (
                                      <>
                                         <h3 className="text-xl text-green-400 mb-2 font-bold">机缘已到！</h3>
                                         <p className="text-sm">在一处古修遗址中发现了 <span className="text-amber-400 font-bold">{ITEMS[exploreState.result.key]?.name}</span></p>
                                         <Button onClick={closeExplore} className="mt-4 w-full" variant="success">收入囊中</Button>
                                      </>
                                   )}
                                   {exploreState.result.type === 'enemy' && (
                                      <>
                                         <h3 className="text-xl text-red-500 mb-2 font-bold">杀机现！</h3>
                                         <p className="text-sm">遭遇了 <span className="text-red-300 font-bold">{exploreState.result.data.name}</span></p>
                                         <Button onClick={closeExplore} className="mt-4 w-full" variant="danger">准备迎战</Button>
                                      </>
                                   )}
                                   {exploreState.result.type === 'empty' && (
                                      <>
                                         <h3 className="text-lg text-stone-400 mb-2">徒劳无功</h3>
                                         <p className="text-sm">此地灵气匮乏，并未发现有价值之物。</p>
                                         <Button onClick={closeExplore} className="mt-4 w-full" variant="secondary">返回</Button>
                                      </>
                                   )}
                                </div>
                             )}
                          </div>
                          <style>{`
                             @keyframes flyBg { from { background-position: 0 0; } to { background-position: 0 100%; } }
                             @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                          `}</style>
                       </div>
                    )}

                    {view === "explore" && !exploreState.active && (
                       <div className="p-4 flex flex-col items-center justify-center h-full">
                          <h3 className="text-xl mb-8 text-amber-500 font-serif">彩霞山脉</h3>
                          <div className="w-full max-w-md p-8 border border-stone-700 rounded-lg bg-stone-900/30">
                             <p className="text-stone-400 mb-8 text-sm leading-relaxed">
                                此处乃是彩霞山脉外围，灵气稀薄，但也常有低阶灵草伴生。偶有野兽出没，需小心行事。
                             </p>
                             <Button onClick={startExplore} className="w-full h-16 text-lg font-serif" sound="click">寻找机缘</Button>
                          </div>
                       </div>
                    )}

                    {view === "garden" && (
                       <div className="p-4 flex flex-col items-center">
                          <div className="flex items-center justify-center gap-8 py-8 mb-6 w-full max-w-md relative group">
                             <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-transparent blur-3xl rounded-full pointer-events-none"></div>
                             <div className={`relative shrink-0 z-10 flex flex-col items-center transition-transform duration-500 ${isDripping ? 'rotate-[135deg] translate-y-4' : 'group-hover:-translate-y-1'}`}>
                                <div className="w-3 h-8 bg-emerald-900/90 border-x border-t border-emerald-600 rounded-t-sm relative z-20 shadow-inner"></div>
                                <div className="w-5 h-2 bg-emerald-800 rounded-full -mt-1 relative z-10"></div>
                                <div className={`w-12 h-20 bg-gradient-to-br from-emerald-800 to-emerald-950 border border-emerald-700 rounded-[40%] relative overflow-hidden -mt-1 ${bottleCharge>=100 ? 'shadow-[0_0_25px_#4ade80] border-emerald-400' : ''}`}>
                                   <div className="absolute bottom-0 w-full bg-emerald-500/60 transition-all duration-300 backdrop-blur-sm" style={{height: `${Math.min(100, bottleCharge/10)}%`}}></div>
                                   <div className="absolute top-3 left-2 w-1.5 h-6 bg-white/20 rounded-full rotate-12 filter blur-[1px]"></div>
                                </div>
                                {isDripping && (
                                   <div className="absolute top-[100%] left-1/2 w-1.5 h-3 bg-green-400 rounded-full animate-[drip_0.5s_linear_infinite]"></div>
                                )}
                             </div>
                             <div className="text-left flex-1 z-10">
                                <h4 className="text-emerald-500 font-bold font-serif text-2xl mb-2 drop-shadow-sm">掌天瓶</h4>
                                <div className="text-xs text-stone-400 mb-3 leading-relaxed">
                                   吸纳月华，凝聚绿液。<br/>
                                   <span className="text-stone-500">每滴可催熟百年药龄。</span>
                                </div>
                                <div className="text-sm font-mono text-emerald-300 flex items-center gap-2">
                                   <div className="flex gap-1">
                                      {[...Array(10)].map((_, i) => (
                                         <div key={i} className={`w-2 h-2 rounded-full border border-emerald-800 ${i < Math.floor(bottleCharge/100) ? 'bg-green-400 shadow-[0_0_5px_#4ade80]' : 'bg-stone-800'}`}></div>
                                      ))}
                                   </div>
                                </div>
                             </div>
                          </div>

                          <h3 className="text-xl mb-4 text-amber-500 font-serif w-full text-left pl-4 border-l-4 border-amber-600">灵药园</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                             {garden.map(p => {
                                const name = getHerbName(p);
                                const isAncient = p.year >= 1000;
                                const isOld = p.year >= 500;
                                const isMature = p.year >= 100;
                                
                                // 根据年份改变颜色
                                let herbColor = "text-stone-300"; // 白色/普通
                                if (isAncient) herbColor = "text-purple-400"; // 深紫金
                                else if (isOld) herbColor = "text-amber-200"; // 淡金
                                else if (isMature) herbColor = "text-green-400"; // 绿色

                                return (
                                <div key={p.id} className={`bg-stone-800 aspect-square flex flex-col items-center justify-center border rounded relative overflow-hidden group transition-all duration-500 ${isAncient ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-stone-600'}`}>
                                   <div className={`transition-all duration-1000 ${isOld ? 'drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]' : isMature ? 'drop-shadow-[0_0_10px_rgba(74,222,128,0.6)]' : ''}`}>
                                      <Leaf size={isAncient ? 40 : isOld ? 36 : 32} className={`transition-all ${herbColor}`} />
                                   </div>
                                   
                                   <div className={`text-xs mt-2 font-bold text-center px-1 ${herbColor}`}>{name}</div>
                                   
                                   <div className="flex flex-col gap-1 w-full px-2 mt-2">
                                      <Button onClick={() => ripenHerb(p.id)} className="text-[10px] h-5 w-full border-green-600 text-green-400 hover:bg-green-900" disabled={bottleCharge < 100} variant="success">催熟</Button>
                                      {isMature && (
                                         <Button onClick={() => harvestHerb(p.id, p.year)} className="text-[10px] h-5 w-full" variant="warning">收获</Button>
                                      )}
                                   </div>
                                </div>
                             )})}
                             {garden.length < 4 && <Button onClick={() => setShowPlanting(true)} variant="outline" className="h-full border-dashed flex-col gap-2 text-stone-500 hover:text-amber-500"><Leaf/><span>种植灵草</span></Button>}
                          </div>
                       </div>
                    )}

                    {view === "alchemy" && (
                       <div className="p-4">
                          <h3 className="text-xl mb-4 text-amber-500 font-serif">地火炼丹房</h3>
                          <div className="flex flex-col items-center justify-center gap-6 py-8">
                             <div className={`relative group cursor-pointer ${alchemyState.active ? 'pointer-events-none' : ''}`} onClick={() => !alchemyState.active && setShowAlchemySelect(true)}>
                                {alchemyState.active && !alchemyState.result && (
                                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32">
                                      <div className="text-[10px] text-center text-amber-500 mb-1">炼制中...</div>
                                      <ProgressBar value={alchemyState.progress} max={100} color="bg-orange-500" height="h-1" showText={false}/>
                                   </div>
                                )}
                                
                                {alchemyState.result === 'success' && (
                                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full z-20 animate-bounce cursor-pointer pointer-events-auto" onClick={(e) => { e.stopPropagation(); collectPill(); }}>
                                      <div className="bg-amber-100 rounded-full p-2 shadow-[0_0_20px_rgba(251,191,36,0.8)]">
                                         <FlaskConical size={24} className="text-amber-600"/>
                                      </div>
                                      <div className="text-[10px] text-amber-200 text-center mt-1 bg-black/50 px-2 rounded">点击收取</div>
                                   </div>
                                )}

                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-12 bg-orange-600/30 blur-2xl animate-pulse"></div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex justify-center gap-1">
                                   <div className="w-2 h-6 bg-orange-500 rounded-full animate-[bounce_1s_infinite] delay-0"></div>
                                   <div className="w-2 h-8 bg-orange-400 rounded-full animate-[bounce_1.2s_infinite] delay-100"></div>
                                   <div className="w-2 h-5 bg-red-500 rounded-full animate-[bounce_0.8s_infinite] delay-200"></div>
                                </div>
                                
                                <svg width="100" height="100" viewBox="0 0 100 100" className={`text-stone-700 drop-shadow-xl relative z-10 transition-transform duration-300 ${alchemyState.active ? 'animate-[shake_0.5s_infinite]' : 'group-hover:scale-105'}`}>
                                   <path d="M20 80 L25 95 L35 85" fill="currentColor" />
                                   <path d="M80 80 L75 95 L65 85" fill="currentColor" />
                                   <path d="M45 85 L50 98 L55 85" fill="currentColor" />
                                   <path d="M15 40 Q10 85 50 85 Q90 85 85 40" fill="currentColor" />
                                   <path d="M15 40 L85 40 L80 30 L20 30 Z" fill="#44403c" />
                                   <path d="M18 30 L18 15 Q18 10 25 15 L22 30" fill="currentColor" />
                                   <path d="M82 30 L82 15 Q82 10 75 15 L78 30" fill="currentColor" />
                                   <path d="M25 30 Q50 10 75 30" fill="#57534e" className={`transition-transform duration-500 ${alchemyState.result === 'success' ? '-translate-y-4' : ''}`}/>
                                   <circle cx="50" cy="22" r="3" fill="#a8a29e" className={`transition-transform duration-500 ${alchemyState.result === 'success' ? '-translate-y-4' : ''}`}/>
                                </svg>
                             </div>
                             
                             <div className="flex gap-2 justify-center w-full">
                                <Button onClick={() => setShowAlchemySelect(true)} disabled={alchemyState.active} className="w-40 py-2">
                                   <Plus size={16}/> 添加药草
                                </Button>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
              )}
           </div>
        </div>

        <div className="h-32 bg-black border-t border-amber-900/30 p-2 font-mono text-xs overflow-y-auto text-stone-500 scroll-smooth">
           {logs.map((l, i) => <div key={i} className="mb-1 border-l-2 border-stone-800 pl-2">{l}</div>)}
           <div ref={logEndRef}/>
        </div>
      </main>
    </div>
  );
}