export interface TabItem {
    key: string;
    label: string;
}

export interface TabsProps {
    items: TabItem[];
    modelValue?: string;
    leafAnimation?: boolean;
    shadow?: boolean;
}
