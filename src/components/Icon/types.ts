export type IconName =
    | 'icon-miles'
    | 'icon-camera'
    | 'icon-chat'
    | 'icon-critterpedia'
    | 'icon-design'
    | 'icon-diy'
    | 'icon-helicopter'
    | 'icon-map'
    | 'icon-shopping'
    | 'icon-variant';

export interface IconProps {
    name: IconName;
    size?: number | string;
    bounce?: boolean;
}

export const ICON_LIST: { name: IconName; label: string }[] = [
    { name: 'icon-miles', label: 'NookMiles' },
    { name: 'icon-camera', label: 'Camera' },
    { name: 'icon-chat', label: 'Chat' },
    { name: 'icon-critterpedia', label: 'Critterpedia' },
    { name: 'icon-design', label: 'Design' },
    { name: 'icon-diy', label: 'DIY' },
    { name: 'icon-helicopter', label: 'Helicopter' },
    { name: 'icon-map', label: 'Map' },
    { name: 'icon-shopping', label: 'Shopping' },
    { name: 'icon-variant', label: 'Variant' },
];
