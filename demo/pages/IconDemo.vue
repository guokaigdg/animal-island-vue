<script setup lang="ts">
import { computed, ref, type CSSProperties } from 'vue';
import {
    Icon,
    Input,
    Tag,
    ICON_LIST,
    ICON_CATEGORIES,
    ICONS_BY_CATEGORY,
    NAIVE_PALETTE,
    type IconName,
    type PaletteColor,
} from '@';
import {
    FlowerIcon,
    MicIcon,
    StarIcon,
    SunIcon,
    UmbrellaIcon,
    WifiIcon,
    MapIcon,
    CameraIcon,
    HeartIcon,
    CoffeeIcon,
    CherryIcon,
    BulbIcon,
    CatIcon,
    FishIcon,
    RocketIcon,
    CloudIcon,
    RainbowIcon,
    IcecreamIcon,
    MushroomIcon,
    OwlIcon,
    SailboatIcon,
} from '@';
import { sectionStyle, sectionTitleStyle, tagStyle, labelStyle, ApiTable, CodeBlock } from '../tools';
import type { ApiRow } from '../tools';

/** 图标中文名，与上游 naive-icons 的全量目录一致 */
const ZH_NAMES: Record<string, string> = {
    Airplane: '飞机',
    AlertCircle: '提示',
    AlertTriangle: '警告',
    Anchor: '锚',
    Apple: '苹果',
    ArrowDown: '下',
    ArrowDownCircle: '向下圆圈',
    ArrowDownLeft: '左下箭头',
    ArrowDownRight: '右下箭头',
    ArrowJump: '跳转',
    ArrowLeft: '左',
    ArrowLeftCircle: '向左圆圈',
    ArrowRight: '右',
    ArrowRightCircle: '向右圆圈',
    ArrowUp: '上',
    ArrowUpCircle: '向上圆圈',
    ArrowUpDown: '上下双箭头',
    ArrowUpLeft: '左上箭头',
    ArrowUpRight: '右上箭头',
    BadgeCheck: '认证',
    Balloon: '气球',
    Ban: '禁止',
    Basketball: '篮球',
    Battery: '电池',
    Bear: '小熊',
    Bee: '蜜蜂',
    Bell: '铃铛',
    BellOff: '免打扰',
    Bicycle: '自行车',
    Bird: '小鸟',
    Bold: '加粗',
    Bolt: '闪电',
    Book: '书本',
    Bookmark: '书签',
    Bulb: '灯泡',
    Butterfly: '蝴蝶',
    Cactus: '仙人掌',
    Cake: '蛋糕',
    Calculator: '计算器',
    Calendar: '日历',
    Camera: '相机',
    Candle: '蜡烛',
    Car: '汽车',
    Cart: '购物车',
    Cat: '小猫',
    Charger: '充电头',
    Chat: '对话',
    Check: '勾选',
    CheckCircle: '成功',
    CheckSquare: '复选框',
    Cherry: '樱桃',
    ChevronDown: '向下',
    ChevronLeft: '向左',
    ChevronRight: '向右',
    ChevronUp: '向上',
    Clipboard: '剪贴板',
    Clock: '时钟',
    Close: '关闭',
    Cloud: '云朵',
    Code: '代码',
    Coffee: '咖啡',
    CoffeeCup: '咖啡杯',
    Compass: '指南针',
    Copy: '复制',
    CreditCard: '信用卡',
    Dog: '小狗',
    Donut: '甜甜圈',
    Download: '下载',
    Dumbbell: '哑铃',
    Edit: '编辑',
    Ellipsis: '更多',
    ExternalLink: '外链',
    Eye: '眼睛',
    EyeOff: '隐藏',
    File: '文件',
    Filter: '筛选',
    Fish: '小鱼',
    Flag: '旗帜',
    Flame: '火焰',
    Flower: '花朵',
    Folder: '文件夹',
    FolderMinus: '删除文件夹',
    FolderPlus: '新建文件夹',
    Fox: '狐狸',
    Frog: '青蛙',
    Gift: '礼物',
    Globe: '地球仪',
    GoogleChrome: 'Chrome',
    Grid: '网格',
    Headphones: '耳机',
    Heart: '爱心',
    HelpCircle: '帮助',
    Home: '家',
    Icecream: '冰淇淋',
    Image: '图片',
    Inbox: '收件箱',
    Info: '信息',
    Italic: '斜体',
    Key: '钥匙',
    Keyboard: '键盘',
    Ladybug: '瓢虫',
    Lamp: '台灯',
    Leaf: '叶子',
    Lemon: '柠檬',
    Link: '链接',
    List: '列表',
    Location: '定位',
    Lock: '锁',
    LockOpen: '解锁',
    Magnet: '磁铁',
    Mail: '邮件',
    Map: '地图',
    MapPin: '地图标记',
    Maximize: '全屏',
    Menu: '菜单',
    Mic: '麦克风',
    Minus: '减号',
    MinusCircle: '减号圆圈',
    Monitor: '显示器',
    Moon: '月亮',
    MoreVertical: '更多(竖)',
    Mountain: '山峰',
    Mouse: '鼠标',
    Mushroom: '蘑菇',
    Music: '音乐',
    Newspaper: '报纸',
    Owl: '猫头鹰',
    Paintbrush: '画笔',
    Palette: '调色板',
    Paperclip: '附件',
    Pause: '暂停',
    PauseCircle: '暂停圆圈',
    Pencil: '铅笔',
    Penguin: '企鹅',
    Phone: '电话',
    Play: '播放',
    PlayCircle: '播放圆圈',
    Plus: '加号',
    PlusCircle: '加号圆圈',
    Power: '电源',
    Printer: '打印机',
    Rabbit: '兔子',
    Radio: '收音机',
    Rainbow: '彩虹',
    Redo: '重做',
    Refresh: '刷新',
    Rocket: '火箭',
    Rss: '订阅',
    Sailboat: '帆船',
    Save: '保存',
    Scissors: '剪刀',
    Scooter: '踏板摩托车',
    Search: '搜索',
    Send: '发送',
    Settings: '设置',
    Share: '分享',
    Shield: '安全',
    ShoppingBag: '购物袋',
    ShoppingCart: '购物推车',
    Sliders: '调节',
    Smile: '微笑',
    Snail: '蜗牛',
    Snowflake: '雪花',
    Sort: '排序',
    Sparkles: '星光',
    Spinner: '加载',
    Star: '星星',
    Stop: '停止',
    StopCircle: '停止圆圈',
    Strawberry: '草莓',
    Sun: '太阳',
    Tag: '标签',
    Tent: '帐篷',
    Thermometer: '温度计',
    ThumbsUp: '点赞',
    Train: '火车',
    Trash: '垃圾桶',
    Tree: '大树',
    Trophy: '奖杯',
    Truck: '卡车',
    Tv: '电视',
    Umbrella: '雨伞',
    Underline: '下划线',
    Undo: '撤销',
    Unlink: '取消链接',
    Upload: '上传',
    User: '用户',
    UserCircle: '圆形用户',
    UserMinus: '移除成员',
    UserPlus: '添加成员',
    Users: '多人',
    Video: '视频',
    Volume: '音量',
    VolumeX: '静音',
    WaterCup: '水杯',
    Watermelon: '西瓜',
    Wifi: '无线网',
    WifiOff: '无线关闭',
    XCircle: '错误',
    ZoomIn: '放大',
    ZoomOut: '缩小',
};

/** 图标组件自身的 props，与 React 版 API 表一一对应 */
const ICON_API: ApiRow[] = [
    { prop: 'size', desc: '图标尺寸，宽高相等', type: 'number | string', defaultVal: '24' },
    { prop: 'color', desc: '描边颜色', type: 'string', defaultVal: 'currentColor' },
    { prop: 'strokeWidth', desc: '描边粗细', type: 'number | string', defaultVal: '3.5' },
    { prop: 'fill', desc: '填充色', type: 'string', defaultVal: 'none' },
    { prop: 'title', desc: '无障碍标题', type: 'string', defaultVal: '-' },
];

/** <Icon> 包装组件在图标组件之上多出来的能力 */
const WRAPPER_API: ApiRow[] = [
    { prop: 'name', desc: '按名称渲染内置图标（201 个手绘 SVG）', type: 'IconName', defaultVal: '-' },
    { prop: 'icon', desc: '传入具体图标组件', type: 'IconComponent', defaultVal: '-' },
    { prop: 'src', desc: '传入图片地址渲染', type: 'string', defaultVal: '-' },
    { prop: 'bounce', desc: '悬停时弹跳一下', type: 'boolean', defaultVal: 'false' },
];

const PALETTE_API: ApiRow[] = Object.entries(NAIVE_PALETTE).map(([key, value]) => ({
    prop: key,
    desc: '调色板颜色',
    type: 'string',
    defaultVal: value,
}));

const INSTALL_CODE = `npm install naive-icons-vue
yarn add naive-icons-vue
pnpm add naive-icons-vue`;

const USAGE_CODE = `<script setup lang="ts">
import { CatIcon, FishIcon } from 'animal-island-vue';
<\/script>

<template>
    <CatIcon :size="32" />
    <FishIcon :size="32" color="#2A9D8F" />
</template>`;

const ALL_ICONS = ICON_LIST;

const filter = ref('');

const shownIcons = computed(() => {
    const q = filter.value.trim().toLowerCase();
    if (!q) return ALL_ICONS;
    return ALL_ICONS.filter((i) => i.name.toLowerCase().includes(q));
});

/** 分类分组，受上方搜索框约束 */
const shownGroups = computed(() => {
    const q = filter.value.trim().toLowerCase();
    if (!q) return ICONS_BY_CATEGORY;
    return ICONS_BY_CATEGORY.map((g) => ({
        category: g.category,
        icons: g.icons.filter((n) => n.toLowerCase().includes(q)),
    })).filter((g) => g.icons.length > 0);
});

/** 单独导入的图标组件示例 */
const DIRECT_ICONS = [
    { name: 'CatIcon', cmp: CatIcon },
    { name: 'FishIcon', cmp: FishIcon },
    { name: 'CoffeeIcon', cmp: CoffeeIcon },
    { name: 'RocketIcon', cmp: RocketIcon },
    { name: 'HeartIcon', cmp: HeartIcon },
    { name: 'StarIcon', cmp: StarIcon },
    { name: 'CloudIcon', cmp: CloudIcon },
    { name: 'RainbowIcon', cmp: RainbowIcon },
    { name: 'IcecreamIcon', cmp: IcecreamIcon },
    { name: 'MushroomIcon', cmp: MushroomIcon },
    { name: 'OwlIcon', cmp: OwlIcon },
    { name: 'SailboatIcon', cmp: SailboatIcon },
] as const;

const PALETTE_KEYS = Object.keys(NAIVE_PALETTE) as PaletteColor[];

/** 描边缩放演示：默认 3.5 为设计基准，其余按比例放大 */
const STROKE_SAMPLES = [1, 3.5, 7];

const rowStyle: CSSProperties = {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    flexWrap: 'wrap',
};

const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '14px',
};

const cellStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 6px',
    borderRadius: '10px',
    background: '#fff',
    border: '1px solid transparent',
};

const cellLabelStyle: CSSProperties = {
    fontSize: '11px',
    color: '#a0936e',
    fontFamily: "'SF Mono', 'Fira Code', Consolas, monospace",
    wordBreak: 'break-all',
    textAlign: 'center',
};

const cellZhStyle: CSSProperties = {
    fontSize: '13px',
    color: '#725d42',
    fontWeight: 600,
};

const compactGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
    gap: '10px',
    marginTop: '12px',
};

const compactCellStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 6px',
    background: '#faf8f3',
    border: '1px solid #e8e2d6',
    borderRadius: '12px',
};
</script>

<template>
    <div :style="sectionStyle">
        <div :style="sectionTitleStyle">
            Icon
            <Tag size="small" variant="soft">naive-icons-vue</Tag>
            <span :style="tagStyle">{{ ALL_ICONS.length }} 个内置图标</span>
        </div>

        <div :style="labelStyle">
            图标为独立 npm 包
            <a
                href="https://github.com/guokaigdg/naive-icons"
                target="_blank"
                rel="noreferrer"
                :style="{ color: '#725d42' }"
            >
                naive-icons-vue
            </a>
            —— 手绘 naive folk art 风格的 SVG 图标库，200+ 个原创图标，为 Vue 3 与 TypeScript 打造。请先安装依赖：
        </div>

        <div :style="{ marginBottom: '12px' }">
            <CodeBlock :code="INSTALL_CODE" label="安装" />
        </div>

        <div :style="labelStyle">
            文档与完整示例参考
            <a
                href="https://github.com/guokaigdg/naive-icons"
                target="_blank"
                rel="noreferrer"
                :style="{ color: '#725d42' }"
            >
                https://github.com/guokaigdg/naive-icons
            </a>
        </div>

        <div :style="labelStyle">基础用法</div>
        <div :style="rowStyle">
            <FlowerIcon :size="32" />
            <MicIcon :size="32" />
            <StarIcon :size="32" />
            <SunIcon :size="32" />
            <UmbrellaIcon :size="32" />
            <WifiIcon :size="32" />
            <MapIcon :size="32" />
            <CameraIcon :size="32" />
        </div>

        <div :style="labelStyle">size 尺寸</div>
        <div :style="rowStyle">
            <HeartIcon :size="16" />
            <HeartIcon :size="24" />
            <HeartIcon :size="32" />
            <HeartIcon :size="48" />
        </div>

        <div :style="labelStyle">color / strokeWidth 自定义</div>
        <div :style="rowStyle">
            <CoffeeIcon :size="32" color="#e05260" :stroke-width="3" />
            <CherryIcon :size="32" color="#2a9d8f" :stroke-width="3" />
            <BulbIcon :size="32" color="#e9c46a" :stroke-width="3" />
        </div>

        <div :style="labelStyle">全部图标</div>
        <div :style="{ maxWidth: '280px', marginBottom: '8px' }">
            <Input v-model="filter" allow-clear placeholder="输入关键字筛选图标名" />
        </div>
        <div :style="{ fontSize: '13px', color: '#a0936e', marginBottom: '4px' }">
            当前显示 {{ shownIcons.length }} / {{ ALL_ICONS.length }}
        </div>
        <div
            :style="{
                border: '1px solid #e8e2d6',
                borderRadius: '12px',
                overflow: 'hidden',
                padding: '18px 16px',
                marginBottom: '20px',
                ...gridStyle,
            }"
        >
            <div v-for="item in shownIcons" :key="item.name" :style="cellStyle">
                <Icon :name="item.name as IconName" :size="45" />
                <span :style="cellLabelStyle">{{ item.name }}Icon</span>
                <span :style="cellZhStyle">{{ ZH_NAMES[item.name] ?? item.name }}</span>
            </div>
        </div>

        <div :style="labelStyle">使用示例</div>
        <CodeBlock :code="USAGE_CODE" />

        <ApiTable :rows="ICON_API" />

        <div :style="labelStyle">按名称渲染 — name 属性（图标集随 naive-icons-vue 同步升级）</div>
        <div :style="rowStyle">
            <Icon name="Cat" :size="36" />
            <Icon name="Rocket" :size="36" />
            <Icon name="Star" :size="36" :stroke-width="4" />
            <Icon name="Heart" :size="36" />
            <Icon name="Star" :size="36" bounce />
        </div>

        <div :style="labelStyle">直接导入图标组件 — 可单独 import，props 同样透传</div>
        <div :style="compactGridStyle">
            <div v-for="item in DIRECT_ICONS" :key="item.name" :style="compactCellStyle">
                <component :is="item.cmp" :size="28" />
                <span :style="cellLabelStyle">{{ item.name }}</span>
            </div>
        </div>

        <div :style="labelStyle">调色板 — color 可传任意色，也可用内置调色板 key</div>
        <div :style="rowStyle">
            <div v-for="key in PALETTE_KEYS" :key="key" :style="{ ...compactCellStyle, minWidth: '72px' }">
                <Icon name="Flower" :size="24" :color="NAIVE_PALETTE[key]" />
                <span :style="cellLabelStyle">{{ key }}</span>
            </div>
        </div>

        <div :style="labelStyle">描边宽度 — strokeWidth 等比缩放内层所有描边，粗细层次保持不变</div>
        <div :style="rowStyle">
            <div
                v-for="sw in STROKE_SAMPLES"
                :key="sw"
                :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }"
            >
                <Icon name="Mountain" :size="40" :stroke-width="sw" />
                <span :style="cellLabelStyle">{{ sw }}</span>
            </div>
        </div>

        <div :style="labelStyle">填充色 — fill 只作用于根 svg，内层图形的填充是设计值不受影响</div>
        <div :style="rowStyle">
            <Icon name="Bell" :size="36" fill="#2A9D8F" />
            <Icon name="Anchor" :size="36" fill="#E76F51" />
            <Icon name="Sun" :size="36" fill="#E9C46A" />
        </div>

        <div :style="labelStyle">分类 taxonomy — ICON_CATEGORIES / ICONS_BY_CATEGORY（每个图标都有归属）</div>
        <div :style="{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }">
            <Tag v-for="g in shownGroups" :key="g.category">{{ g.category }} · {{ g.icons.length }}</Tag>
        </div>
        <div v-for="g in shownGroups" :key="g.category" :style="{ marginBottom: '18px' }">
            <div :style="{ fontSize: '13px', color: '#794f27', marginBottom: '4px' }">{{ g.category }}</div>
            <div :style="compactGridStyle">
                <div v-for="name in g.icons" :key="name" :style="compactCellStyle">
                    <Icon :name="name" :size="24" />
                    <span :style="cellLabelStyle">{{ name }}</span>
                </div>
            </div>
        </div>

        <ApiTable :rows="WRAPPER_API" />
        <ApiTable :rows="PALETTE_API" />
    </div>
</template>
