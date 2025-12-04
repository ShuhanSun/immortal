import { 
  Coins, Leaf, Sparkles, Zap, FlaskConical, Flame, Swords, Shield, Scroll, ShoppingBag, Package
} from 'lucide-react';

// --- 精灵图配置 ---
// 请将您的图片文件放置在 public 目录下，并命名为 sprites.jpg
// 或者修改此处的 URL 为您实际的图片路径
export const SPRITE_URL = "/sprites.jpg";

// 图片网格配置 (根据提供的图片估算为 5列 x 3行)
export const SPRITE_GRID = { cols: 5, rows: 3 };

// 辅助函数：获取精灵图位置样式
export const getSpriteStyle = (row, col) => {
  // 假设每个图标在网格中均匀分布
  const x = (col / (SPRITE_GRID.cols - 1)) * 100;
  const y = (row / (SPRITE_GRID.rows - 1)) * 100;
  return {
    backgroundImage: `url(${SPRITE_URL})`,
    backgroundPosition: `${x}% ${y}%`,
    backgroundSize: `${SPRITE_GRID.cols * 100}% ${SPRITE_GRID.rows * 100}%`,
    backgroundRepeat: 'no-repeat',
  };
};

export const REALMS = [
  { name: "凡人", maxExp: 100, hp: 50, atk: 5, def: 0, pill: "pillQi", color: "text-stone-400", life: 100 },
  { name: "炼气一层", maxExp: 200, hp: 100, atk: 15, def: 2, pill: "pillQi", color: "text-stone-300", life: 100 },
  { name: "炼气二层", maxExp: 400, hp: 150, atk: 25, def: 5, pill: "pillQi", color: "text-stone-200", life: 100 },
  { name: "炼气三层", maxExp: 800, hp: 220, atk: 40, def: 8, pill: "pillQi", color: "text-emerald-200", life: 100 },
  { name: "炼气四层", maxExp: 1500, hp: 300, atk: 60, def: 12, pill: "pillQi", color: "text-emerald-300", life: 110 },
  { name: "炼气五层", maxExp: 2500, hp: 400, atk: 85, def: 18, pill: "pillQi", color: "text-emerald-400", life: 110 },
  { name: "炼气六层", maxExp: 4000, hp: 550, atk: 110, def: 25, pill: "pillRare", color: "text-emerald-500", life: 120 },
  { name: "炼气七层", maxExp: 6000, hp: 700, atk: 140, def: 35, pill: "pillRare", color: "text-cyan-300", life: 130 },
  { name: "炼气八层", maxExp: 9000, hp: 900, atk: 180, def: 45, pill: "pillRare", color: "text-cyan-400", life: 140 },
  { name: "炼气九层", maxExp: 13000, hp: 1200, atk: 230, def: 60, pill: "pillRare", color: "text-cyan-500", life: 150 },
  { name: "炼气十层 (圆满)", maxExp: 18000, hp: 1500, atk: 280, def: 80, pill: "pillZhuJi", color: "text-cyan-600", life: 150 },
  { name: "筑基初期", maxExp: 50000, hp: 5000, atk: 800, def: 300, pill: "pillJieDan", color: "text-indigo-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]", life: 250 },
  { name: "筑基中期", maxExp: 80000, hp: 8000, atk: 1200, def: 500, pill: "pillJieDan", color: "text-indigo-300 drop-shadow-[0_0_15px_rgba(37,99,235,0.8)]", life: 300 },
];

export const ITEMS = {
  // --- 货币与杂项 ---
  spiritStone: { name: "灵石", desc: "修仙界的通用货币。", type: "currency", price: 1, icon: Coins, spritePos: { row: 1, col: 3 } }, // 金币
  inventoryBag: { name: "储物袋", desc: "内有乾坤，可纳万物。", type: "tool", icon: Package, spritePos: { row: 1, col: 2 } }, // 钱袋

  // --- 材料 ---
  herbSeed: { name: "黄龙草种子", desc: "低阶灵草种子，可培育出黄龙草。", type: "material", subtype: "seed", price: 5, icon: Leaf, spritePos: { row: 0, col: 3 } }, // 黄花草
  spiritHerb: { name: "黄龙草", desc: "炼制黄龙丹的主材 (十年份)。", type: "material", subtype: "herb", price: 8, icon: Leaf, quality: 10, spritePos: { row: 0, col: 3 } }, // 黄花草
  spiritHerb_100: { name: "百年黄龙草", desc: "药性强劲的百年灵草，炼丹成功率高。", type: "material", subtype: "herb", price: 80, icon: Leaf, quality: 100, spritePos: { row: 0, col: 4 } }, // 人参
  spiritHerb_1000: { name: "千年黄龙草", desc: "传说中的千年灵药，炼丹必成。", type: "material", subtype: "herb", price: 800, icon: Sparkles, quality: 1000, spritePos: { row: 0, col: 4 } }, // 人参
  rareHerb: { name: "金髓花", desc: "炼制金髓丸的主材。", type: "material", price: 50, icon: Sparkles, spritePos: { row: 0, col: 3 } }, // 暂用黄花草
  monsterCore: { name: "低阶妖丹", desc: "妖兽的一身精华。", type: "material", price: 30, icon: Zap },

  // --- 丹药 ---
  pillQi: { name: "黄龙丹", desc: "增加修为，亦可回血。", exp: 80, hpRegen: 50, type: "consumable", price: 25, icon: FlaskConical, spritePos: { row: 0, col: 0 } }, // 绿色丹药
  pillRare: { name: "金髓丸", desc: "洗髓伐骨，破境专用。", exp: 200, hpRegen: 200, type: "consumable", price: 200, icon: FlaskConical, spritePos: { row: 0, col: 2 } }, // 红色丹药
  pillZhuJi: { name: "筑基丹", desc: "冲击筑基期的神药。", exp: 0, effect: "breakthrough_major", type: "consumable", price: 2000, icon: FlaskConical, spritePos: { row: 0, col: 1 } }, // 黄色丹药

  // --- 法器与符箓 ---
  talismanFire: { name: "火弹符", desc: "一次性消耗品，投掷火球伤敌。", dmg: 150, type: "weapon", price: 15, icon: Flame, spritePos: { row: 1, col: 1 } }, // 红色符咒
  ironSword: { name: "铁精剑", desc: "掺入了铁精的低阶法器。", atkBonus: 15, type: "equip", price: 100, icon: Swords, spritePos: { row: 1, col: 4 } }, // 剑
  goldBrick: { name: "金光砖", desc: "符宝残片，威力巨大。", atkBonus: 45, type: "equip", price: 500, icon: Swords, spritePos: { row: 2, col: 2 } }, // 金砖/印
  flyShield: { name: "玄铁飞天盾", desc: "防御型法器，增加生存能力。", defBonus: 20, type: "equip", price: 400, icon: Shield, spritePos: { row: 2, col: 1 } }, // 盾牌
  motherSonBlade: { name: "金蚨子母刃", desc: "成套法器，诡异莫测。", atkBonus: 80, type: "equip", price: 1200, icon: Swords, spritePos: { row: 2, col: 0 } }, // 匕首/短剑

  // --- 功法 ---
  bookChangChun: { name: "长春功", desc: "木属性基础功法，修炼速度微增。", passive: { type: "exp_rate", val: 1.1 }, type: "method", price: 300, icon: Scroll, spritePos: { row: 1, col: 0 } }, // 书籍
  bookSword: { name: "眨眼剑法", desc: "世俗武学极致，增加攻击力。", passive: { type: "atk", val: 20 }, type: "method", price: 150, icon: Scroll, spritePos: { row: 1, col: 0 } }, // 书籍
};

export const ENEMIES = [
  { name: "野狼", realm: "野兽", realmIdx: 0, hp: 30, atk: 8, def: 0, exp: 5, loot: null, desc: "普通的野兽，对修仙者毫无威胁。" },
  { name: "土甲龙", realm: "一级妖兽", realmIdx: 3, hp: 150, atk: 25, def: 10, exp: 25, loot: "monsterCore", desc: "皮糙肉厚的一级妖兽，擅长防御。" },
  { name: "双头鹫", realm: "一级顶阶", realmIdx: 8, hp: 350, atk: 55, def: 20, exp: 60, loot: "monsterCore", desc: "凶猛的飞行妖兽，双头可喷吐风刃。" },
  { name: "墨蛟", realm: "二级妖兽", realmIdx: 11, hp: 2500, atk: 180, def: 80, exp: 600, loot: "rareHerb", desc: "盘踞在沼泽深处的蛟龙，实力恐怖，非筑基不可敌。" },
];

export const SHOP_INVENTORY = [
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