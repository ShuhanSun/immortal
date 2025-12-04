import React from 'react';
import { X, User, BookOpen, Package, Skull } from 'lucide-react';
import { Button, ItemImage } from './UI'; // 导入 ItemImage
import { ITEMS, REALMS } from '../data/constants';
import SFX from '../utils/sfx';

// 物品详情弹窗
export const ItemDetailModal = ({ itemId, onClose, onUse }) => {
  const item = ITEMS[itemId];
  if (!item) return null;

  return (
    <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 border-2 border-amber-600 rounded-lg p-6 max-w-sm w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-2 right-2 text-stone-500 hover:text-red-500"><X/></button>
        <div className="flex flex-col items-center mb-4">
           <div className="w-24 h-24 bg-stone-800 rounded-lg border-2 border-stone-600 flex items-center justify-center mb-3 p-1">
              {/* 使用 ItemImage 替代 Icon */}
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
export const PlantingModal = ({ inventory, onClose, onPlant }) => {
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
export const PillSelectModal = ({ inventory, onClose, onUse }) => {
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
export const AlchemySelectModal = ({ inventory, onClose, onSelect }) => {
   const herbs = Object.keys(inventory).filter(k => ITEMS[k].type === 'material' && ITEMS[k].subtype === 'herb');
   
   return (
      <div className="absolute inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200">
         <div className="bg-stone-900 border-2 border-orange-700 rounded-lg p-6 max-w-sm w-full relative shadow-2xl">
            <button onClick={onClose} className="absolute top-2 right-2 text-stone-500 hover:text-red-500"><X/></button>
            <h3 className="text-xl font-bold text-orange-500 mb-4 font-serif text-center">投入主材</h3>
            <div className="grid grid-cols-1 gap-2 mb-4">
               {herbs.map(k => {
                  const item = ITEMS[k];
                  const rate = item.quality === 1000 ? 100 : item.quality === 100 ? 70 : 40;
                  const qualityColor = item.quality >= 1000 ? "text-amber-300" : item.quality >= 100 ? "text-green-400" : "text-stone-500";
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

// 怪物查看弹窗 (未修改，无物品图标)
export const EnemyDetailModal = ({ enemy, onClose }) => {
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

// 玩家详情面板 (未修改，无物品图标)
export const PlayerStatsModal = ({ player, stats, onClose }) => {
   const realmColor = REALMS[player.realmIdx].color;
   
   return (
      <div className="absolute inset-0 z-[70] bg-black/95 flex items-center justify-center p-4 animate-in zoom-in duration-300">
         <div className="bg-stone-900 border-2 border-amber-700 rounded-lg w-full max-w-md p-6 relative">
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

            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-stone-800/50 p-3 rounded">
                  <div className="text-xs text-stone-500">骨龄 / 寿元</div>
                  <div className="text-lg font-mono text-stone-300">{player.age.toFixed(1)} / {player.maxAge}</div>
               </div>
               <div className="bg-stone-800/50 p-3 rounded">
                  <div className="text-xs text-stone-500">神识</div>
                  <div className="text-lg font-mono text-stone-300">普通</div>
               </div>
               <div className="bg-stone-800/50 p-3 rounded">
                  <div className="text-xs text-stone-500">攻击力</div>
                  <div className="text-lg font-mono text-amber-400">{stats.atk}</div>
               </div>
               <div className="bg-stone-800/50 p-3 rounded">
                  <div className="text-xs text-stone-500">防御力</div>
                  <div className="text-lg font-mono text-stone-300">{stats.def}</div>
               </div>
            </div>

            <div className="mb-4">
               <h3 className="text-amber-500 font-bold mb-2 flex items-center gap-2"><BookOpen size={16}/> 已修习功法</h3>
               <div className="space-y-2 max-h-40 overflow-y-auto">
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

// 新增：储物袋弹窗
export const InventoryModal = ({ inventory, onClose, onItemClick, player }) => {
    return (
      <div className="absolute inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200">
         <div className="bg-stone-900 border-2 border-amber-700 rounded-lg w-full max-w-2xl p-6 relative shadow-2xl">
            <button onClick={onClose} className="absolute top-2 right-2 text-stone-500 hover:text-amber-500"><X/></button>
            <div className="flex items-center gap-3 mb-6">
                {/* 使用 ItemImage 显示储物袋图标 */}
                <div className="w-8 h-8 flex items-center justify-center">
                    <ItemImage item={ITEMS.inventoryBag} className="text-amber-600" />
                </div>
                <h3 className="text-amber-500 font-serif font-bold text-xl tracking-widest">随身储物袋</h3>
            </div>
            
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 max-h-96 overflow-y-auto content-start">
                {Object.entries(inventory).map(([k, v]) => {
                    const item = ITEMS[k];
                    const isEquipped = player.equipped?.includes(k);
                    
                    return (
                        <div 
                        key={k} 
                        onClick={() => { onItemClick(k); SFX.play('click'); }}
                        className={`aspect-square bg-stone-800 rounded border ${isEquipped ? 'border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'border-stone-700 hover:border-amber-500'} cursor-pointer flex flex-col items-center justify-center relative group transition-all p-2`}
                        >
                            <div className="w-full h-full flex items-center justify-center mb-1">
                                {/* 使用 ItemImage 替代 Icon */}
                                <ItemImage item={item} className={`${isEquipped ? 'text-cyan-400' : 'text-stone-400 group-hover:text-amber-400'}`} />
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
      </div>
    );
};