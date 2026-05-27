// 全局样式 (Less + CSS Custom Properties)
import './styles/index.less';

// Nunito（latin subset only）
import '@fontsource/nunito/latin-500.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-900.css';

// Noto Sans SC
import '@fontsource/noto-sans-sc/latin-400.css';
import '@fontsource/noto-sans-sc/latin-500.css';
import '@fontsource/noto-sans-sc/latin-700.css';
import '@fontsource/noto-sans-sc/chinese-simplified-400.css';
import '@fontsource/noto-sans-sc/chinese-simplified-500.css';
import '@fontsource/noto-sans-sc/chinese-simplified-700.css';

// Zen Maru Gothic
import '@fontsource/zen-maru-gothic/latin-500.css';
import '@fontsource/zen-maru-gothic/latin-700.css';
import '@fontsource/zen-maru-gothic/latin-900.css';
import '@fontsource/zen-maru-gothic/japanese-500.css';
import '@fontsource/zen-maru-gothic/japanese-700.css';
import '@fontsource/zen-maru-gothic/japanese-900.css';

// ============================================
// 组件导出（随迁移进度逐步追加）
// ============================================
// Phase 1 — 基础原子组件
export { Icon, ICON_LIST } from './components/Icon';
export type { IconProps, IconName } from './components/Icon';

export { Button } from './components/Button';
export type { ButtonProps, ButtonType, ButtonSize, ButtonHTMLType } from './components/Button';

export { Divider } from './components/Divider';
export type { DividerProps, DividerType } from './components/Divider';

export { Cursor } from './components/Cursor';
export type { CursorProps } from './components/Cursor';

export { Loading } from './components/Loading';
export type { LoadingProps } from './components/Loading';

// Phase 2 — 表单组件
export { Input } from './components/Input';
export type { InputProps, InputSize } from './components/Input';

export { Switch } from './components/Switch';
export type { SwitchProps, SwitchSize } from './components/Switch';

export { Checkbox } from './components/Checkbox';
export type {
    CheckboxProps,
    CheckboxOption,
    CheckboxSize,
    CheckboxValue,
} from './components/Checkbox';

export { Radio } from './components/Radio';
export type {
    RadioProps,
    RadioOption,
    RadioSize,
    RadioValue,
} from './components/Radio';

export { Tooltip } from './components/Tooltip';
export type {
    TooltipProps,
    TooltipPlacement,
    TooltipTrigger,
    TooltipVariant,
} from './components/Tooltip';

export { Select } from './components/Select';
export type { SelectProps, SelectOption } from './components/Select';

export { Tabs } from './components/Tabs';
export type { TabsProps, TabItem } from './components/Tabs';

// Phase 3 — 容器/反馈组件
export { Card } from './components/Card';
export type { CardProps, CardType, CardColor } from './components/Card';

export { Collapse } from './components/Collapse';
export type { CollapseProps } from './components/Collapse';

export { Modal } from './components/Modal';
export type { ModalProps } from './components/Modal';

export { Footer } from './components/Footer';
export type { FooterProps, FooterType } from './components/Footer';

// Phase 4 — 内容/数据展示组件
export { Time } from './components/Time';
export type { TimeProps } from './components/Time';

export { Typewriter } from './components/Typewriter';
export type { TypewriterProps } from './components/Typewriter';

export { CodeBlock } from './components/CodeBlock';
export type { CodeBlockProps } from './components/CodeBlock';

export { Table } from './components/Table';
export type { TableProps, TableColumn, TableRecord } from './components/Table';

export { Phone } from './components/Phone';
export type { PhoneProps } from './components/Phone';

export {
    WeddingInvitation,
    WeddingInvitationExportButton,
} from './components/WeddingInvitation';
export type {
    WeddingInvitationProps,
    WeddingInvitationExpose,
    WeddingInvitationExportButtonProps,
} from './components/WeddingInvitation';

// ...（后续阶段陆续启用）
