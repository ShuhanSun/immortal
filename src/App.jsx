import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mountain, FlaskConical, Map as MapIcon, ShoppingBag, Leaf, Coins, 
  User, Skull, Swords, Wind, Compass, Plus, ArrowUpCircle, AlertTriangle,
  Eye, Package, Sun, Moon, X, Hand
} from 'lucide-react';
import { REALMS, ITEMS, ENEMIES, SHOP_INVENTORY } from './data/constants';
import SFX from './utils/sfx';
import { Card, Button, ProgressBar, ItemImage } from './components/UI'; // 导入 ItemImage
import { VisualEffects } from './components/Effects';
import { 
  ItemDetailModal, PlantingModal, PillSelectModal, 
  AlchemySelectModal, EnemyDetailModal, PlayerStatsModal,
  InventoryModal 
} from './components/Modals';

export default function CultivationGame() {
  const [player, setPlayer] = useState({
    name: "韩立", realmIdx: 0, exp: 0, hp: 50, maxHp: 50, mp: 100, maxMp: 100, gold: 10, age: 16, maxAge: 100,
    inventory: { pillQi: 5, herbSeed: 5, talismanFire: 3, ironSword: 1 },
    learnedMethods: [], equipped: []
  });

  const [view, setView] = useState("cave");
  const [logs, setLogs] = useState(["欢迎来到凡人修仙传 Origin。你资质平庸，踏上修仙之路。"]);
  const [bottleCharge, setBottleCharge] = useState(0); 
  const [garden, setGarden] = useState([]); 
  const [combatState, setCombatState] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // UI & 特效状态
  const [fx, setFx] = useState(null); 
  const [toast, setToast] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPlanting, setShowPlanting] = useState(false);
  const [showAlchemySelect, setShowAlchemySelect] = useState(false); 
  const [showStats, setShowStats] = useState(false);
  const [showEnemyInfo, setShowEnemyInfo] = useState(false);
  const [showPillSelect, setShowPillSelect] = useState(false); 
  const [showBag, setShowBag] = useState(false); 

  // 炼丹状态
  const [alchemyState, setAlchemyState] = useState({ active: false, progress: 0, result: null });

  // 吐纳与动画
  const [isMeditating, setIsMeditating] = useState(false);
  const [meditationTime, setMeditationTime] = useState(0); 
  const [breathPhase, setBreathPhase] = useState('idle');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [breakthroughRealm, setBreakthroughRealm] = useState(""); 
  const [isDripping, setIsDripping] = useState(false);

  // 历练系统状态
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

  // 古文数字
  const toChineseNum = (num) => {
     const chars = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
     return num.toString().split('').map(d => chars[parseInt(d)]).join('');
  }

  // 古文时间转换器
  const formatAncientTime = (seconds) => {
     const y = Math.floor(seconds / 360);
     const m = Math.floor((seconds % 360) / 30);
     const d = Math.floor(seconds % 30);
     return `${y > 0 ? toChineseNum(y) + '载 ' : ''}${m > 0 ? toChineseNum(m) + '月 ' : ''}${toChineseNum(d)}日`;
  }

  useEffect(() => {
    const savedData = localStorage.getItem('hanli_origin_save_v4_7');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setPlayer(prev => ({ ...prev, ...parsed.player }));
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

  // 掌天瓶充能
  useEffect(() => {
    const timer = setInterval(() => setBottleCharge(prev => Math.min(prev + 5, 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  // 吐纳循环 & 计时
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
      }, 1000); // 1秒 = 1日

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
        let nextAge = prev.age + (1/36); 
        if (nextAge >= prev.maxAge) {
           // 寿元耗尽逻辑
        }

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
    const isMajor = player.realmIdx === 10;
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

  // --- 炼丹系统 ---
  const startAlchemy = (herbType) => {
      if (!consumeItem(herbType, 1)) {
          showToast(`缺少材料: ${ITEMS[herbType].name}`);
          return;
      }
      setShowAlchemySelect(false);
      
      const item = ITEMS[herbType];
      let rate = 0.4;
      if (item.quality >= 1000) rate = 1.0;
      else if (item.quality >= 100) rate = 0.7;
      
      setAlchemyState({ active: true, progress: 0, result: null, successRate: rate });
      SFX.play('magic');
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
          } else {
             setAlchemyState(prev => ({ ...prev, result: 'fail' }));
             triggerFx('alchemy_fail');
             SFX.play('explosion');
          }
      }
      return () => clearInterval(timer);
  }, [alchemyState]);

  const collectPill = () => {
      gainItem('pillQi');
      setAlchemyState({ active: false, progress: 0, result: null });
      setFx(null); 
  };

  // --- 历练系统 ---
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
       const lootKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
       setExploreState(prev => ({ ...prev, result: { type: 'loot', key: lootKey } }));
       SFX.play('success');
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
        setCombatState({ 
            enemy: { ...res.data, maxHp: res.data.hp }, 
            log: [`遭遇 ${res.data.name}！`], 
            turn: 'player', 
            isAnimating: false
        });
        setView("combat"); 
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

  // --- 灵药园逻辑 ---
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

      {/* 种植选择 */}
      {showPlanting && (
         <PlantingModal 
            inventory={player.inventory} 
            onClose={() => setShowPlanting(false)} 
            onPlant={plantHerb}
         />
      )}

      {/* 炼丹选择 */}
      {showAlchemySelect && (
         <AlchemySelectModal 
            inventory={player.inventory} 
            onClose={() => setShowAlchemySelect(false)} 
            onSelect={startAlchemy}
         />
      )}

      {/* 瓶颈选药 */}
      {showPillSelect && (
         <PillSelectModal 
            inventory={player.inventory} 
            onClose={() => setShowPillSelect(false)} 
            onUse={useItem} 
         />
      )}

      {/* 玩家属性面板 */}
      {showStats && (
         <PlayerStatsModal 
            player={player} 
            stats={stats} 
            onClose={() => setShowStats(false)} 
         />
      )}

      {/* 敌人信息 */}
      {showEnemyInfo && combatState && (
         <EnemyDetailModal enemy={combatState.enemy} onClose={() => setShowEnemyInfo(false)} />
      )}

      {/* 储物袋弹窗 */}
      {showBag && (
         <InventoryModal 
            inventory={player.inventory} 
            player={player}
            onClose={() => setShowBag(false)} 
            onItemClick={(k) => setSelectedItem(k)}
         />
      )}

      {/* 全屏升级动画 */}
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

      {/* 侧边栏 */}
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
            />
          </div>
          <div className="flex items-center gap-4 text-amber-500 font-mono font-bold">
             <div className="flex flex-col items-end mr-4 text-xs text-stone-400">
                <span>骨龄: {player.age.toFixed(0)} 岁</span>
                <span>寿元: {player.maxAge} 岁</span>
             </div>
             <span className="flex items-center gap-1"><Coins size={16}/> {player.gold}</span>
             <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-stone-500 hover:text-amber-500">
                {soundEnabled ? <Volume2 size={20}/> : <VolumeX size={20}/>}
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           
           {/* 战斗界面 */}
           {view === "combat" && combatState && (
              <div className="absolute inset-0 z-20 bg-stone-950/95 flex items-center justify-center p-4">
                 <Card title={`遭遇战：${combatState.enemy.name}`} className="w-full max-w-3xl border-red-900 relative">
                    
                    {/* 胜利结算遮罩 */}
                    {combatState.victory && (
                       <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center animate-in zoom-in duration-300">
                          <button onClick={() => setCombatState(null)} className="absolute top-8 right-8 text-stone-500 hover:text-white"><X size={32}/></button>
                          <h2 className="text-4xl font-bold text-amber-500 mb-6 font-serif">大 获 全 胜</h2>
                          <div className="bg-stone-800 border border-amber-700 p-4 rounded-lg flex flex-col items-center mb-8 animate-bounce">
                             <div className="text-stone-400 text-sm mb-2">战利品</div>
                             <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-stone-900 rounded flex items-center justify-center border border-stone-600 p-1">
                                   {/* 使用 ItemImage 显示战利品 */}
                                   <ItemImage item={ITEMS[combatState.loot]} className="text-amber-400" />
                                </div>
                                <span className="text-amber-100">{ITEMS[combatState.loot]?.name}</span>
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
                                <Swords className="absolute -right-4 top-4 text-amber-500 w-8 h-8 -rotate-12" />
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
                             <Swords size={16}/> 普通攻击
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
                                      {/* 使用 ItemImage 替代 Icon */}
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
                <>
                   {/* 洞府高度占据主要空间 */}
                   <Card title="洞府静室" glow={isMeditating} className="flex-1 flex flex-col justify-end relative overflow-hidden">
                      
                      {/* 动态日月背景 (增强昼夜感) */}
                      <div className={`absolute inset-0 transition-colors duration-[5000ms] ${breathPhase === 'in' ? 'bg-sky-200/10' : 'bg-black'}`}></div>
                      {/* 雾气(日) / 星空(夜) */}
                      <div className={`absolute inset-0 bg-gradient-to-b from-white/20 to-transparent transition-opacity duration-[5000ms] ${breathPhase === 'in' ? 'opacity-50' : 'opacity-0'}`}></div>
                      <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] transition-opacity duration-[5000ms] ${breathPhase === 'out' ? 'opacity-80' : 'opacity-0'}`}></div>

                      {/* 日升月落轨迹 (半圆拱形: 逆时针 右->左) */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                         {/* 太阳: 右下 -> 顶 -> 左下 */}
                         <div className={`absolute bottom-[-20%] left-[10%] w-[80%] h-[120%] transition-transform duration-[5000ms] ease-linear`} 
                              style={{ 
                                 transformOrigin: '50% 100%', 
                                 transform: breathPhase === 'in' ? 'rotate(-180deg)' : 'rotate(0deg)' 
                              }}>
                            <div className={`absolute top-0 right-0 -translate-y-1/2 text-amber-300 transition-opacity duration-1000 ${breathPhase === 'in' ? 'opacity-100' : 'opacity-0'}`}>
                               <div className="w-20 h-20 rounded-full bg-amber-400 shadow-[0_0_60px_30px_rgba(251,191,36,0.8)] flex items-center justify-center">
                                  <div className="w-16 h-16 bg-amber-100 rounded-full blur-sm"></div>
                               </div>
                            </div>
                         </div>
                         
                         {/* 月亮: 右下 -> 顶 -> 左下 */}
                         <div className={`absolute bottom-[-20%] left-[10%] w-[80%] h-[120%] transition-transform duration-[5000ms] ease-linear`} 
                              style={{ 
                                 transformOrigin: '50% 100%', 
                                 transform: breathPhase === 'out' ? 'rotate(-180deg)' : 'rotate(0deg)' 
                              }}>
                            <div className={`absolute top-0 right-0 -translate-y-1/2 text-indigo-100 transition-opacity duration-1000 ${breathPhase === 'out' ? 'opacity-100' : 'opacity-0'}`}>
                               <div className="w-16 h-16 rounded-full bg-slate-200 shadow-[0_0_40px_15px_rgba(199,210,254,0.5)]"></div>
                            </div>
                         </div>
                      </div>

                      {/* 人物居中下方 */}
                      <div className="relative w-full flex flex-col items-center z-10 mb-4">
                         {/* 吐纳光效 */}
                         <div className="absolute bottom-0 flex items-end justify-center pointer-events-none">
                            <div className={`w-4 h-40 bg-amber-200/50 blur-md rounded-full transition-all duration-[4000ms] ease-in-out ${breathPhase === 'in' ? '-translate-y-8 opacity-100 scale-y-125' : 'translate-y-0 opacity-20 scale-y-50'}`}></div>
                            <div className={`absolute w-40 h-40 rounded-full border border-amber-500/30 transition-all duration-[4000ms] ${breathPhase === 'in' ? 'scale-110 opacity-60' : 'scale-90 opacity-10'}`}></div>
                         </div>
                         
                         {/* 人物剪影 */}
                         {isMeditating ? (
                             <svg width="160" height="160" viewBox="0 0 100 100" className={`relative z-10 ${REALMS[player.realmIdx].color} transition-colors duration-[4000ms] ${breathPhase === 'in' ? 'drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]' : ''}`}>
                                <circle cx="50" cy="25" r="9" fill="currentColor" />
                                <circle cx="50" cy="16" r="3.5" fill="currentColor" />
                                <path fill="currentColor" d="M36 38 Q50 34 64 38 L72 80 Q50 88 28 80 Z" />
                                <path fill="currentColor" d="M22 75 Q35 70 50 78 Q65 70 78 75 L74 85 Q50 92 26 85 Z" />
                                <circle cx="42" cy="58" r="3.5" fill="currentColor" />
                                <circle cx="58" cy="58" r="3.5" fill="currentColor" />
                             </svg>
                         ) : (
                             <svg width="120" height="160" viewBox="0 0 100 140" className={`relative z-10 ${REALMS[player.realmIdx].color}`}>
                                <circle cx="50" cy="25" r="9" fill="currentColor" />
                                <circle cx="50" cy="16" r="3.5" fill="currentColor" />
                                <path fill="currentColor" d="M38 40 Q50 35 62 40 L70 110 Q50 120 30 110 Z" />
                                <circle cx="45" cy="75" r="3.5" fill="currentColor" />
                                <circle cx="55" cy="75" r="3.5" fill="currentColor" />
                             </svg>
                         )}

                         {/* 计时显示 (更新为古文) */}
                         {isMeditating && (
                             <div className="absolute -top-8 text-amber-500/70 font-mono text-xs bg-black/30 px-2 py-1 rounded">
                                入定: {formatAncientTime(meditationTime)}
                             </div>
                         )}
                      </div>
                      
                      {/* 底部操作栏 */}
                      <div className="w-full px-6 space-y-3 relative z-20 bg-stone-900/60 p-4 rounded-t-xl backdrop-blur-sm border-t border-stone-700">
                         {/* 状态提示 */}
                         {isMeditating && (
                            <div className="text-center text-xs font-mono text-stone-400 mb-2 animate-pulse">
                               {breathPhase === 'in' ? '☀ 旭日东升 (采气)' : '🌙 皓月当空 (炼神)'}
                            </div>
                         )}

                         {player.exp >= Math.floor(stats.maxExp * 0.95) && player.exp < stats.maxExp && (
                            <div className="text-center animate-bounce pointer-events-auto">
                               <button 
                                 onClick={() => setShowPillSelect(true)}
                                 className="bg-red-900/90 text-red-200 px-3 py-1 rounded text-sm border border-red-500 flex items-center justify-center gap-2 mx-auto w-fit shadow-lg hover:bg-red-800 transition-colors"
                               >
                                  <AlertTriangle size={14}/> 修为瓶颈 (点击服药)
                               </button>
                            </div>
                         )}

                         {player.exp >= stats.maxExp ? (
                            <Button onClick={attemptBreakthrough} variant="primary" className="w-full ring-2 ring-amber-500" sound="level_up">
                               <ArrowUpCircle size={18}/> 冲击瓶颈
                            </Button>
                         ) : (
                            <Button 
                              onClick={() => { setIsMeditating(!isMeditating); if(!isMeditating && soundEnabled) SFX.play('click'); }} 
                              variant={isMeditating ? "outline" : "secondary"}
                              className={`w-full ${isMeditating ? 'border-amber-500 text-amber-500 bg-amber-900/20' : ''}`}
                            >
                               {isMeditating ? "停止吐纳" : "开始吐纳 (自动)"}
                            </Button>
                         )}
                      </div>
                   </Card>

                   {/* 储物袋 (折叠式，移至底部) */}
                   <div className="bg-stone-900 border-2 border-amber-800/50 rounded-lg p-4 shadow-xl relative overflow-hidden h-auto shrink-0">
                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-3">
                            {/* 使用 ItemImage 显示储物袋图标 */}
                            <div className="w-6 h-6">
                                <ItemImage item={ITEMS.inventoryBag} className="text-amber-600" />
                            </div>
                            <h3 className="text-amber-500 font-serif font-bold text-sm tracking-widest">随身储物袋</h3>
                         </div>
                         <button 
                            onClick={() => setShowBag(true)} 
                            className="text-xs text-stone-500 hover:text-amber-400 border border-stone-700 px-2 py-1 rounded"
                         >
                            查看
                         </button>
                      </div>
                   </div>
                </>
              )}

              {view === "shop" && (
                 <Card title="万宝楼交易行" className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {SHOP_INVENTORY.map((entry, i) => {
                          const item = ITEMS[entry.id];
                          const isBuy = entry.type === 'buy';
                          return (
                             <div key={i} className="flex justify-between items-center bg-stone-800 p-3 rounded border border-stone-700">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-stone-900 rounded flex items-center justify-center p-1">
                                      {/* 使用 ItemImage 替代 Icon */}
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
                                         <p className="text-sm">在一处古修遗址中发现了 <span className="text-amber-400 font-bold">{ITEMS[exploreState.result.key].name}</span></p>
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
                                return (
                                <div key={p.id} className={`bg-stone-800 aspect-square flex flex-col items-center justify-center border rounded relative overflow-hidden group transition-all duration-500 ${isAncient ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-stone-600'}`}>
                                   <div className={`transition-all duration-1000 ${isOld ? 'drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]' : isMature ? 'drop-shadow-[0_0_10px_rgba(74,222,128,0.6)]' : ''}`}>
                                      <Leaf size={isAncient ? 40 : isOld ? 36 : 32} className={`transition-all ${isAncient ? "text-amber-300" : isOld ? "text-purple-400" : isMature ? "text-green-400" : "text-stone-500"}`} />
                                   </div>
                                   
                                   <div className={`text-xs mt-2 font-bold text-center px-1 ${isAncient ? 'text-amber-200' : 'text-stone-300'}`}>{name}</div>
                                   
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
                             {/* 炼丹炉 SVG */}
                             <div className={`relative group cursor-pointer ${alchemyState.active ? 'pointer-events-none' : ''}`} onClick={() => !alchemyState.active && setShowAlchemySelect(true)}>
                                {/* 炼制中进度条 */}
                                {alchemyState.active && !alchemyState.result && (
                                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32">
                                      <div className="text-[10px] text-center text-amber-500 mb-1">炼制中...</div>
                                      <ProgressBar value={alchemyState.progress} max={100} color="bg-orange-500" height="h-1" showText={false}/>
                                   </div>
                                )}
                                
                                {/* 炼制成功展示丹药 - 修复点击层级 */}
                                {alchemyState.result === 'success' && (
                                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full z-20 animate-bounce cursor-pointer pointer-events-auto" onClick={(e) => { e.stopPropagation(); collectPill(); }}>
                                      <div className="bg-amber-100 rounded-full p-2 shadow-[0_0_20px_rgba(251,191,36,0.8)]">
                                         <FlaskConical size={24} className="text-amber-600"/>
                                      </div>
                                      <div className="text-[10px] text-amber-200 text-center mt-1 bg-black/50 px-2 rounded">点击收取</div>
                                   </div>
                                )}

                                {/* 地火 */}
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-12 bg-orange-600/30 blur-2xl animate-pulse"></div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex justify-center gap-1">
                                   <div className="w-2 h-6 bg-orange-500 rounded-full animate-[bounce_1s_infinite] delay-0"></div>
                                   <div className="w-2 h-8 bg-orange-400 rounded-full animate-[bounce_1.2s_infinite] delay-100"></div>
                                   <div className="w-2 h-5 bg-red-500 rounded-full animate-[bounce_0.8s_infinite] delay-200"></div>
                                </div>
                                
                                {/* 炉身 (三足鼎) */}
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