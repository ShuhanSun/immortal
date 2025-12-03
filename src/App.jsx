import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Scroll, Mountain, Sparkles, FlaskConical, 
  Map as MapIcon, User, Droplets, Swords, Skull, 
  Flame, Wind, ShoppingBag, Leaf, Coins, 
  ArrowUpCircle, Volume2, VolumeX, Cloud, Compass
} from 'lucide-react';

// --- 音效系统 (Web Audio API) ---
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
        osc.frequency.linearRampToValueAtTime(200, t + 4);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.02, t + 4);
        osc.start(t);
        osc.stop(t + 4);
        break;
      case 'breath_out': 
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.linearRampToValueAtTime(100, t + 4);
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
        playChord(440, 0); 
        playChord(554, 0.1); 
        playChord(659, 0.2); 
        playChord(880, 0.3); 
        break;
      case 'attack': 
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.2);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      case 'fly': // 飞行/起飞
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.linearRampToValueAtTime(300, t + 1);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1);
        osc.start(t);
        osc.stop(t + 1);
        break;
      case 'scan': // 神识扫描
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.linearRampToValueAtTime(1200, t + 0.2);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      case 'discovery': // 发现机缘
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, t);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1);
        osc.start(t);
        osc.stop(t + 1);
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
      default: break;
    }
  }
};

// --- 游戏数据常量 ---

const REALMS = [
  { name: "凡人", maxExp: 100, hp: 50, atk: 5, def: 0, pill: "pillQi" },
  { name: "炼气一层", maxExp: 200, hp: 100, atk: 15, def: 2, pill: "pillQi" },
  { name: "炼气二层", maxExp: 400, hp: 150, atk: 25, def: 5, pill: "pillQi" },
  { name: "炼气三层", maxExp: 800, hp: 220, atk: 40, def: 8, pill: "pillQi" },
  { name: "炼气四层", maxExp: 1500, hp: 300, atk: 60, def: 12, pill: "pillQi" },
  { name: "炼气五层", maxExp: 2500, hp: 400, atk: 85, def: 18, pill: "pillQi" },
  { name: "炼气六层", maxExp: 4000, hp: 550, atk: 110, def: 25, pill: "pillRare" },
  { name: "炼气七层", maxExp: 6000, hp: 700, atk: 140, def: 35, pill: "pillRare" },
  { name: "炼气八层", maxExp: 9000, hp: 900, atk: 180, def: 45, pill: "pillRare" },
  { name: "炼气九层", maxExp: 13000, hp: 1200, atk: 230, def: 60, pill: "pillRare" },
  { name: "炼气十层 (圆满)", maxExp: 18000, hp: 1500, atk: 280, def: 80, pill: "pillZhuJi" },
  { name: "筑基初期", maxExp: 50000, hp: 5000, atk: 800, def: 300, pill: "pillJieDan" },
];

const ITEMS = {
  spiritStone: { name: "灵石", desc: "修仙界的通用货币。", type: "currency", price: 1 },
  herbSeed: { name: "黄龙草种子", desc: "低阶灵草种子。", type: "material", price: 5 },
  spiritHerb: { name: "黄龙草", desc: "炼制黄龙丹的主材。", type: "material", price: 8 },
  rareHerb: { name: "金髓花", desc: "炼制金髓丸的主材。", type: "material", price: 50 },
  monsterCore: { name: "低阶妖丹", desc: "妖兽的一身精华。", type: "material", price: 30 },
  pillQi: { name: "黄龙丹", desc: "增加修为，亦可突破炼气初期瓶颈。", exp: 80, type: "consumable", price: 25 },
  pillRare: { name: "金髓丸", desc: "洗髓伐骨，突破炼气后期瓶颈必备。", exp: 200, type: "consumable", price: 200 },
  pillZhuJi: { name: "筑基丹", desc: "冲击筑基期的神药。", exp: 0, effect: "breakthrough_major", type: "consumable", price: 2000 },
  talismanFire: { name: "火弹符", desc: "一次性消耗品，威力尚可。", dmg: 120, type: "weapon", price: 15 },
  ironSword: { name: "铁精剑", desc: "掺入了铁精的低阶法器。", atkBonus: 15, type: "equip", price: 100 },
  goldBrick: { name: "金光砖", desc: "符宝残片炼制的法器，势大力沉。", atkBonus: 45, type: "equip", price: 500 },
  flyShield: { name: "玄铁飞天盾", desc: "防御型法器，增加生存能力。", defBonus: 20, type: "equip", price: 400 },
  motherSonBlade: { name: "金蚨子母刃", desc: "成套法器，诡异莫测。", atkBonus: 80, type: "equip", price: 1200 },
  bookChangChun: { name: "长春功", desc: "木属性基础功法，修炼速度微增。", passive: { type: "exp_rate", val: 1.1 }, type: "method", price: 300 },
  bookSword: { name: "眨眼剑法", desc: "世俗武学极致，增加攻击力。", passive: { type: "atk", val: 20 }, type: "method", price: 150 },
};

const ENEMIES = [
  { name: "野狼", realm: "野兽", hp: 30, atk: 8, exp: 5, loot: null },
  { name: "土甲龙", realm: "一级妖兽", hp: 150, atk: 25, exp: 25, loot: "monsterCore" },
  { name: "双头鹫", realm: "一级顶阶", hp: 350, atk: 55, exp: 60, loot: "monsterCore" },
  { name: "墨蛟", realm: "二级妖兽", hp: 2500, atk: 180, exp: 600, loot: "rareHerb" },
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
  { id: "monsterCore", type: "sell" },
];

// --- 样式组件 ---

const Card = ({ children, className = "", title, glow = false }) => (
  <div className={`bg-stone-900 border-2 ${glow ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-amber-800/50'} rounded-lg p-4 shadow-xl relative overflow-hidden ${className}`}>
    {title && (
      <div className="absolute top-0 left-0 right-0 bg-amber-900/20 border-b border-amber-800/30 px-3 py-1 z-10">
        <h3 className="text-amber-500 font-serif font-bold text-sm tracking-widest flex items-center gap-2">
           {title}
        </h3>
      </div>
    )}
    <div className={`relative z-10 ${title ? "mt-6" : ""}`}>{children}</div>
    {/* 装饰纹理 */}
    <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5 pointer-events-none">
      <svg viewBox="0 0 100 100" fill="currentColor" className="text-amber-500">
        <path d="M50 0 C70 20 80 40 80 50 C80 60 70 80 50 100 C30 80 20 60 20 50 C20 40 30 20 50 0 Z" />
      </svg>
    </div>
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
    success: "bg-green-800 hover:bg-green-700 text-green-100 border border-green-600"
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
      <style jsx>{`@keyframes ripple { 0% { transform: scale(0); opacity: 0.5; } 100% { transform: scale(2.5); opacity: 0; } } .animate-ripple { animation: ripple 0.6s linear; }`}</style>
    </button>
  );
};

const ProgressBar = ({ value, max, color = "bg-amber-600", label }) => (
  <div className="w-full">
    <div className="flex justify-between text-xs mb-1 text-stone-400 font-serif">
      <span>{label}</span>
      <span>{Math.floor(value)} / {max}</span>
    </div>
    <div className="h-2 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  </div>
);

// --- 主程序 ---

export default function CultivationGame() {
  const [player, setPlayer] = useState({
    name: "韩立", realmIdx: 0, exp: 0, hp: 50, maxHp: 50, gold: 10,
    inventory: { pillQi: 2, herbSeed: 5, talismanFire: 3 },
    learnedMethods: [], equipped: []
  });

  const [view, setView] = useState("cave");
  const [logs, setLogs] = useState(["欢迎来到凡人修仙传 Origin。你资质平庸，踏上修仙之路。"]);
  const [bottleCharge, setBottleCharge] = useState(0); 
  const [garden, setGarden] = useState([]); 
  const [combatState, setCombatState] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // 吐纳与动画
  const [isMeditating, setIsMeditating] = useState(false);
  const [breathPhase, setBreathPhase] = useState('idle');
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  // 历练系统状态
  const [exploreState, setExploreState] = useState({
     active: false,
     progress: [], 
     result: null, 
     step: 0, 
  });

  const logEndRef = useRef(null);
  const isInitialMount = useRef(true);

  const handleInteraction = useCallback(() => {
    if (soundEnabled && !SFX.ctx) SFX.init();
  }, [soundEnabled]);

  useEffect(() => {
    const savedData = localStorage.getItem('hanli_origin_save_v2');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setPlayer(prev => ({ ...prev, ...parsed.player }));
        setGarden(parsed.garden || []);
        setBottleCharge(parsed.bottleCharge || 0);
        addLog(">>> 读取存档成功 <<<");
      } catch (e) { console.error(e); }
    }
    isInitialMount.current = false;
    window.addEventListener('click', () => SFX.init(), { once: true });
  }, []);

  useEffect(() => {
    if (isInitialMount.current) return;
    localStorage.setItem('hanli_origin_save_v2', JSON.stringify({ player, garden, bottleCharge }));
  }, [player, garden, bottleCharge]);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  useEffect(() => {
    const timer = setInterval(() => setBottleCharge(prev => Math.min(prev + 1, 100)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval;
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
      if (breathPhase === 'idle' && soundEnabled) SFX.play('breath_in');
    } else {
      setBreathPhase('idle');
    }
    return () => clearInterval(interval);
  }, [isMeditating, soundEnabled]);

  const getStats = () => {
    const realm = REALMS[player.realmIdx];
    let atk = realm.atk;
    let def = realm.def;
    let expMult = 1;
    player.equipped?.forEach(id => {
      if (ITEMS[id].atkBonus) atk += ITEMS[id].atkBonus;
      if (ITEMS[id].defBonus) def += ITEMS[id].defBonus;
    });
    player.learnedMethods?.forEach(id => {
      const passive = ITEMS[id].passive;
      if (passive.type === 'atk') atk += passive.val;
      if (passive.type === 'exp_rate') expMult *= passive.val;
    });
    return { atk, def, expMult, maxExp: realm.maxExp };
  };

  const addLog = (msg) => setLogs(prev => [...prev.slice(-29), `[${new Date().toLocaleTimeString().slice(0,5)}] ${msg}`]);

  const gainItem = (key, count = 1) => {
    setPlayer(prev => ({
      ...prev,
      inventory: { ...prev.inventory, [key]: (prev.inventory[key] || 0) + count }
    }));
    SFX.play('success');
    addLog(`获得了 ${ITEMS[key].name} x${count}`);
  };

  const consumeItem = (key, count = 1) => {
    if ((player.inventory[key] || 0) < count) { SFX.play('error'); return false; }
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
       addLog("修为已达【瓶颈】，无法寸进！需服用破境丹药方可圆满。");
       setIsMeditating(false);
       return;
    }
    if (player.hp < player.maxHp * 0.2) {
      addLog("身体过于虚弱，被迫停止吐纳。");
      setIsMeditating(false);
      return;
    }
    const baseGain = 5; 
    const gain = Math.floor(baseGain * stats.expMult);
    const hpRec = Math.floor(player.maxHp * 0.05);
    setPlayer(prev => {
      let nextExp = prev.exp + gain;
      const cap = Math.floor(currentRealm.maxExp * 0.95);
      if (nextExp > cap) nextExp = cap;
      return { ...prev, exp: nextExp, hp: Math.min(prev.maxHp, prev.hp + hpRec) };
    });
  };

  const useItem = (key) => {
    const item = ITEMS[key];
    const realm = REALMS[player.realmIdx];
    if (item.type === 'method') {
      if (player.learnedMethods?.includes(key)) { addLog("你已习得此功法。"); return; }
      consumeItem(key);
      setPlayer(prev => ({ ...prev, learnedMethods: [...(prev.learnedMethods || []), key] }));
      addLog(`研读了《${item.name}》，功力大增！`);
      return;
    }
    if (item.type === 'equip') {
      if (player.equipped?.includes(key)) {
         setPlayer(prev => ({ ...prev, equipped: prev.equipped.filter(k => k !== key) }));
         addLog(`卸下了 ${item.name}。`);
      } else {
         setPlayer(prev => ({ ...prev, equipped: [...(prev.equipped || []), key] }));
         addLog(`装备了 ${item.name}。`);
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
             addLog(`服下 ${item.name}，药力化开瓶颈，修为圆满！可尝试【冲击境界】。`);
             SFX.play('magic');
           }
           return;
        } else {
           addLog(`当前瓶颈非 ${item.name} 可解，需服用对应丹药。`);
           return;
        }
      }
      if (item.exp && !isAtBottleneck) {
         if (consumeItem(key)) {
            setPlayer(prev => ({ ...prev, exp: Math.min(prev.exp + item.exp, Math.floor(realm.maxExp * 0.95)) }));
            addLog(`服用了 ${item.name}，修为精进。`);
         }
      } else if (item.effect === 'breakthrough_major') {
         addLog(`${item.name} 仅在冲击大境界时使用。`);
      }
    }
  };

  const attemptBreakthrough = () => {
    const currentRealm = REALMS[player.realmIdx];
    if (player.exp < currentRealm.maxExp) {
      addLog("修为未至圆满（100%），无法突破。"); return;
    }
    const isMajor = player.realmIdx === 10;
    if (isMajor && !consumeItem('pillZhuJi')) {
       addLog("无筑基丹护体，必死无疑！"); return;
    }
    const successRate = isMajor ? 0.5 : 0.8;
    if (Math.random() < successRate) {
       setShowLevelUp(true);
       SFX.play('level_up');
       setTimeout(() => setShowLevelUp(false), 4000);
       const newIdx = player.realmIdx + 1;
       setPlayer(prev => ({
         ...prev, realmIdx: newIdx, exp: 0, maxHp: REALMS[newIdx].hp, hp: REALMS[newIdx].hp
       }));
       addLog(`>>> 突破成功！晋升为【${REALMS[newIdx].name}】 <<<`);
    } else {
       const dmg = Math.floor(player.maxHp * 0.3);
       setPlayer(prev => ({ ...prev, hp: Math.max(1, prev.hp - dmg), exp: Math.floor(currentRealm.maxExp * 0.8) }));
       addLog(`突破失败，经脉受损 (-${dmg} HP)，修为倒退。`);
       SFX.play('error');
    }
  };

  // --- 历练系统 ---
  
  const startExplore = () => {
    if(isMeditating) setIsMeditating(false);
    // 重置历练状态
    setExploreState({
      active: true,
      progress: [],
      result: null,
      step: 0
    });
    // 第一个音效：起飞
    SFX.play('fly');
    
    // 步骤逻辑
    const steps = [
      "驾驭法器飞离洞府...",
      "飞越彩霞山脉...",
      "神识扫过一片丛林...",
      "感知到前方有灵气波动..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setExploreState(prev => ({
           ...prev,
           progress: [...prev.progress, steps[currentStep]],
           step: currentStep
        }));
        
        // --- 动态音效逻辑 ---
        if (currentStep === 0) SFX.play('fly'); // 再次起飞声
        if (currentStep === 1) SFX.play('fly'); // 持续飞行
        if (currentStep === 2) SFX.play('scan'); // 神识扫描
        if (currentStep === 3) SFX.play('discovery'); // 发现波动

        currentStep++;
      } else {
        clearInterval(interval);
        // 结算
        finishExplore();
      }
    }, 1500); // 放慢节奏
  };

  const finishExplore = () => {
     const rand = Math.random();
     if (rand < 0.3) {
       // Loot
       const itemKeys = Object.keys(ITEMS).filter(k => ITEMS[k].type === "material" || k === "herbSeed");
       const lootKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
       setExploreState(prev => ({
          ...prev,
          result: { type: 'loot', key: lootKey }
       }));
       SFX.play('success');
     } else if (rand < 0.75) {
       // Enemy
       const enemy = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
       setExploreState(prev => ({
          ...prev,
          result: { type: 'enemy', data: enemy }
       }));
       SFX.play('attack');
     } else {
       // Empty
       setExploreState(prev => ({
          ...prev,
          result: { type: 'empty' }
       }));
     }
  };

  const closeExplore = () => {
     const res = exploreState.result;
     if (res && res.type === 'loot') {
        gainItem(res.key);
     }
     if (res && res.type === 'enemy') {
        setCombatState({ enemy: { ...res.data, maxHp: res.data.hp }, log: [], turn: 1 });
        setView("combat"); // 切换到战斗界面
     } else {
        addLog("历练归来。");
     }
     // 关闭动画
     setExploreState({ active: false, progress: [], result: null, step: 0 });
  };

  const combatAction = (action) => {
    if (!combatState) return;
    const { atk, def } = getStats();
    let dmg = atk;
    let logMsg = "";
    
    if (action === "attack") {
       SFX.play('attack');
       logMsg = `你发起攻击，造成 ${dmg} 伤害。`;
    } else if (action === "escape") {
       setView("explore"); setCombatState(null); addLog("逃跑成功。"); return;
    }

    let enemyHp = combatState.enemy.hp - dmg;
    if (enemyHp <= 0) {
       gainItem(combatState.enemy.loot || "spiritStone");
       setCombatState(null); setView("explore"); return;
    }

    let taken = Math.max(1, combatState.enemy.atk - def);
    setPlayer(prev => ({...prev, hp: prev.hp - taken}));
    
    if (player.hp - taken <= 0) {
       setPlayer(prev => ({...prev, hp: 1, realmIdx: Math.max(0, prev.realmIdx - 1), exp: 0}));
       setCombatState(null); setView("cave"); addLog("战斗重伤，境界跌落！");
    } else {
       setCombatState(prev => ({ 
          ...prev, 
          enemy: {...prev.enemy, hp: enemyHp}, 
          log: [...prev.log.slice(-3), logMsg, `敌人反击，受到 ${taken} 伤害。`] 
       }));
    }
  };

  const ripenHerb = (id) => {
    if (bottleCharge < 100) return;
    setBottleCharge(0);
    setGarden(prev => prev.map(p => p.id === id ? { ...p, progress: 100, name: "百年灵草" } : p));
    SFX.play('magic');
  };
  const harvestHerb = (id) => {
    setGarden(prev => prev.filter(p => p.id !== id));
    gainItem("spiritHerb", 2);
  };
  const plantHerb = () => {
    if (garden.length >= 4) return;
    if (consumeItem("herbSeed")) setGarden(prev => [...prev, { name: "幼苗", progress: 0, id: Date.now() }]);
  };

  const tradeItem = (id, type) => {
    const item = ITEMS[id];
    if (type === 'buy') {
       if (player.gold >= item.price) {
          setPlayer(prev => ({...prev, gold: prev.gold - item.price}));
          gainItem(id);
       } else SFX.play('error');
    } else {
       if (consumeItem(id)) {
          setPlayer(prev => ({...prev, gold: prev.gold + item.price}));
       }
    }
  };

  const stats = getStats();

  return (
    <div onClick={handleInteraction} className="min-h-screen bg-stone-950 text-stone-300 font-sans flex flex-col md:flex-row overflow-hidden select-none">
      
      {/* 全屏升级动画 */}
      {showLevelUp && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-in fade-in duration-500">
            <div className="text-center relative">
               <div className="absolute inset-0 bg-amber-500 blur-[100px] opacity-50 animate-pulse"></div>
               <h1 className="text-6xl md:text-8xl font-bold text-amber-100 font-serif mb-4 relative z-10 animate-bounce">
                  境界突破
               </h1>
               <div className="text-2xl text-amber-400 font-serif relative z-10">
                  大道可期 · 寿元大增
               </div>
            </div>
         </div>
      )}

      {/* 全屏历练动画 */}
      {exploreState.active && (
         <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center font-serif text-stone-300 overflow-hidden">
            {/* 动态背景 */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse"></div>
            <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] animate-[spin_60s_linear_infinite] opacity-10 bg-gradient-to-br from-amber-900 via-transparent to-stone-900"></div>
            
            <div className="relative z-10 max-w-lg w-full px-8 text-center space-y-8">
               <div className="flex justify-center mb-8">
                  <Compass size={64} className="text-amber-600 animate-[spin_4s_ease-in-out_infinite]" />
               </div>
               
               {/* 过程文本 */}
               <div className="space-y-4 min-h-[160px]">
                  {exploreState.progress.map((text, i) => (
                     <div key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-lg md:text-xl text-amber-100/80">
                        {text}
                     </div>
                  ))}
                  {/* 加载点 */}
                  {!exploreState.result && (
                     <div className="flex justify-center gap-2 mt-4">
                        <span className="w-2 h-2 bg-stone-500 rounded-full animate-bounce delay-0"></span>
                        <span className="w-2 h-2 bg-stone-500 rounded-full animate-bounce delay-150"></span>
                        <span className="w-2 h-2 bg-stone-500 rounded-full animate-bounce delay-300"></span>
                     </div>
                  )}
               </div>

               {/* 结果展示 */}
               {exploreState.result && (
                  <div className="animate-in zoom-in duration-300 bg-stone-900/80 border border-amber-800 p-6 rounded-lg shadow-2xl mt-8">
                     {exploreState.result.type === 'loot' && (
                        <>
                           <h3 className="text-2xl text-green-400 mb-2 font-bold">机缘已到！</h3>
                           <p>在一处古修遗址中发现了 <span className="text-amber-400 font-bold">{ITEMS[exploreState.result.key].name}</span></p>
                           <Button onClick={closeExplore} className="mt-6 w-full" variant="success">收入囊中</Button>
                        </>
                     )}
                     {exploreState.result.type === 'enemy' && (
                        <>
                           <h3 className="text-2xl text-red-500 mb-2 font-bold">杀机现！</h3>
                           <p>遭遇了 <span className="text-red-300 font-bold">{exploreState.result.data.name}</span>，对方来者不善！</p>
                           <Button onClick={closeExplore} className="mt-6 w-full" variant="danger">准备迎战</Button>
                        </>
                     )}
                     {exploreState.result.type === 'empty' && (
                        <>
                           <h3 className="text-xl text-stone-400 mb-2">徒劳无功</h3>
                           <p>此地灵气匮乏，并未发现有价值之物。</p>
                           <Button onClick={closeExplore} className="mt-6 w-full" variant="secondary">返回</Button>
                        </>
                     )}
                  </div>
               )}
            </div>
         </div>
      )}

      {/* 侧边栏 */}
      <nav className="w-full md:w-64 bg-stone-900 border-r border-amber-900/30 flex flex-col shrink-0">
        <div className="p-6 bg-stone-900/50 border-b border-amber-900/30">
          <h1 className="text-2xl font-serif font-bold text-amber-500 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> 凡人修仙
          </h1>
          <p className="text-xs text-stone-500 mt-1">Origin v2.2 (掌天瓶)</p>
        </div>
        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          {[
            { id: 'cave', icon: Mountain, label: '洞府静室' },
            { id: 'garden', icon: Leaf, label: '灵药园' },
            { id: 'alchemy', icon: FlaskConical, label: '炼丹房' },
            { id: 'explore', icon: MapIcon, label: '外出历练' },
            { id: 'shop', icon: ShoppingBag, label: '万宝楼' },
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

      {/* 主界面 */}
      <main className="flex-1 flex flex-col min-w-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')]">
        <header className="bg-stone-900/80 backdrop-blur p-4 flex flex-wrap gap-6 items-center border-b border-amber-900/30 z-10">
          <div className="flex items-center gap-3 min-w-[150px]">
             <div className="w-10 h-10 rounded-full bg-stone-800 border border-amber-700 flex items-center justify-center">
               <User className="w-6 h-6 text-amber-500" />
             </div>
             <div>
               <div className="text-stone-200 font-bold font-serif">{player.name}</div>
               <div className="text-amber-600 text-xs">{REALMS[player.realmIdx].name}</div>
             </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <ProgressBar value={player.hp} max={player.maxHp} color="bg-red-700" label="气血" />
            <ProgressBar value={player.exp} max={stats.maxExp} color="bg-cyan-700" label="修为" />
          </div>
          <div className="flex items-center gap-4 text-amber-500 font-mono font-bold">
             <span className="flex items-center gap-1"><Coins size={16}/> {player.gold}</span>
             <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-stone-500 hover:text-amber-500">
                {soundEnabled ? <Volume2 size={20}/> : <VolumeX size={20}/>}
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           
           {/* 战斗界面覆盖 */}
           {view === "combat" && combatState && (
              <div className="absolute inset-0 z-20 bg-black/90 flex items-center justify-center p-4">
                 <Card title={`遭遇 ${combatState.enemy.name}`} className="w-full max-w-lg border-red-900">
                    <div className="h-48 overflow-y-auto bg-stone-900/50 p-2 mb-4 text-sm font-mono text-stone-400 space-y-1">
                       {combatState.log.map((l, i) => <div key={i}>{l}</div>)}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <Button onClick={() => combatAction('attack')}><Swords size={16}/> 攻击</Button>
                       <Button onClick={() => combatAction('escape')} variant="danger"><Wind size={16}/> 逃跑</Button>
                    </div>
                 </Card>
              </div>
           )}

           <div className="max-w-4xl mx-auto space-y-6">
              
              {view === "cave" && (
                <div className="grid md:grid-cols-2 gap-6">
                   <Card title="洞府静室" glow={isMeditating} className="h-auto md:h-[22rem] flex flex-col items-center justify-between text-center relative py-6">
                      <div className="relative mb-2">
                         <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-[4000ms] ${breathPhase === 'in' ? 'bg-white/30 scale-150' : breathPhase === 'out' ? 'bg-white/5 scale-90' : 'bg-transparent'}`}></div>
                         
                         <svg width="80" height="80" viewBox="0 0 100 100" className={`relative z-10 text-stone-400 transition-colors duration-[4000ms] ${breathPhase === 'in' ? 'text-amber-100' : ''}`}>
                            <path fill="currentColor" d="M50 20 C60 20 65 28 65 35 C65 45 58 50 50 50 C42 50 35 45 35 35 C35 28 40 20 50 20 M30 60 C20 70 20 80 30 90 L70 90 C80 80 80 70 70 60 L50 55 Z" />
                         </svg>
                         
                         <div className="mt-2 text-xs font-mono text-stone-500 h-4">
                            {breathPhase === 'in' ? '吸 气 ...' : breathPhase === 'out' ? '呼 气 ...' : ''}
                         </div>
                      </div>

                      <div className="space-y-3 w-full px-8 mt-4">
                         {player.exp >= stats.maxExp ? (
                            <Button onClick={attemptBreakthrough} variant="primary" className="w-full animate-pulse ring-2 ring-amber-500" sound="level_up">
                               <ArrowUpCircle size={18}/> 冲击瓶颈 (需丹药)
                            </Button>
                         ) : (
                            <Button 
                              onClick={() => { setIsMeditating(!isMeditating); if(!isMeditating && soundEnabled) SFX.play('click'); }} 
                              variant={isMeditating ? "outline" : "secondary"}
                              className={`w-full ${isMeditating ? 'border-amber-500 text-amber-500' : ''}`}
                            >
                               {isMeditating ? "停止吐纳" : "开始吐纳 (自动)"}
                            </Button>
                         )}
                         <p className="text-xs text-stone-500">
                            {isMeditating ? "每10秒运转一个小周天..." : "打坐可恢复气血，精进修为。"}
                         </p>
                      </div>
                   </Card>

                   <div className="space-y-6">
                      <Card title="随身储物袋">
                         <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto">
                            {Object.entries(player.inventory).map(([k, v]) => (
                               <div key={k} onClick={() => useItem(k)} className="bg-stone-800 px-2 py-1 rounded border border-stone-700 text-xs cursor-pointer hover:border-amber-600 flex items-center gap-1">
                                  {ITEMS[k].name} <span className="text-amber-600">x{v}</span>
                                  {ITEMS[k].effect === 'breakthrough_major' && <ArrowUpCircle size={10} className="text-red-400"/>}
                               </div>
                            ))}
                            {Object.keys(player.inventory).length === 0 && <span className="text-stone-600 text-xs">空</span>}
                         </div>
                      </Card>
                   </div>
                </div>
              )}

              {view === "shop" && (
                 <Card title="万宝楼交易行">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {SHOP_INVENTORY.map((entry, i) => {
                          const item = ITEMS[entry.id];
                          const isBuy = entry.type === 'buy';
                          return (
                             <div key={i} className="flex justify-between items-center bg-stone-800 p-3 rounded border border-stone-700">
                                <div>
                                   <div className="text-sm font-bold text-stone-300">{item.name}</div>
                                   <div className="text-xs text-stone-500">{item.desc}</div>
                                </div>
                                <Button 
                                  onClick={() => tradeItem(entry.id, entry.type)} 
                                  variant={isBuy ? "secondary" : "outline"} 
                                  className="text-xs h-8 px-2"
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

              {(view === "garden" || view === "alchemy" || view === "explore") && (
                 <div className="text-center py-4 bg-stone-900/50 rounded border border-stone-800 min-h-[500px]">
                    {view === "garden" && (
                       <div className="p-4 flex flex-col items-center">
                          {/* 掌天瓶组件 - 移至灵药园 */}
                          <Card className="flex items-center gap-8 p-8 h-40 mb-8 border-amber-600/50 bg-stone-900/80 w-full max-w-md">
                             <div className="relative shrink-0">
                                <div className={`w-16 h-24 bg-stone-800 border-2 ${bottleCharge===100 ? 'border-green-400 shadow-[0_0_20px_#4ade80]' : 'border-stone-600'} rounded-t-full rounded-b-xl overflow-hidden relative`}>
                                   <div className="absolute bottom-0 w-full bg-green-500/30 transition-all duration-300" style={{height: `${bottleCharge}%`}}></div>
                                </div>
                                {bottleCharge===100 && <Droplets size={20} className="absolute -top-2 -right-2 text-green-400 animate-bounce"/>}
                             </div>
                             <div className="text-left flex-1">
                                <h4 className="text-green-500 font-bold font-serif text-xl mb-2">掌天瓶</h4>
                                <div className="text-xs text-stone-400 mb-2">夺天地之造化，侵日月之玄机。</div>
                                <div className="text-sm font-mono text-green-300">灵液凝聚: {bottleCharge}%</div>
                             </div>
                          </Card>

                          <h3 className="text-xl mb-4 text-amber-500 font-serif w-full text-left pl-4 border-l-4 border-amber-600">灵药园</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                             {garden.map(p => (
                                <div key={p.id} className="bg-stone-800 aspect-square flex flex-col items-center justify-center border border-stone-600 rounded">
                                   <Leaf size={32} className={p.progress === 100 ? "text-green-400" : "text-stone-600"} />
                                   <div className="text-xs text-stone-500 mt-2 mb-2">{p.name}</div>
                                   {p.progress === 100 ? <Button onClick={() => harvestHerb(p.id)} className="text-xs h-6 px-2" variant="success">收获</Button> : <Button onClick={() => ripenHerb(p.id)} className="text-xs h-6 px-2" disabled={bottleCharge < 100} variant="secondary">催熟</Button>}
                                </div>
                             ))}
                             {garden.length < 4 && <Button onClick={plantHerb} variant="outline" className="h-full border-dashed flex-col gap-2 text-stone-500 hover:text-amber-500"><Leaf/><span>种植灵草</span></Button>}
                          </div>
                       </div>
                    )}
                    {view === "alchemy" && (
                       <div className="p-4">
                          <h3 className="text-xl mb-4 text-amber-500 font-serif">地火炼丹房</h3>
                          <p className="text-xs text-stone-500 mb-4">消耗灵草炼制丹药</p>
                          <Button onClick={() => { if(consumeItem('spiritHerb', 2)) gainItem('pillQi'); else addLog("材料不足"); }} sound="magic">炼制黄龙丹</Button>
                       </div>
                    )}
                    {view === "explore" && (
                       <div className="p-4 flex flex-col items-center justify-center h-full">
                          <h3 className="text-xl mb-8 text-amber-500 font-serif">彩霞山脉</h3>
                          <div className="w-full max-w-md p-8 border border-stone-700 rounded-lg bg-stone-900/30">
                             <p className="text-stone-400 mb-8 text-sm leading-relaxed">
                                此处乃是彩霞山脉外围，灵气稀薄，但也常有低阶灵草伴生。偶有野兽出没，需小心行事。
                             </p>
                             <Button onClick={startExplore} className="w-full h-16 text-lg font-serif" sound="click">寻找机缘 (开启全屏历练)</Button>
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
