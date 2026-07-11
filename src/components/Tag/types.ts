export type TagSize = 'small' | 'medium' | 'large';
export type TagVariant = 'solid' | 'outlined' | 'dashed';
export type TagColor =
    | 'default'
    | 'app-pink'
    | 'purple'
    | 'app-blue'
    | 'app-yellow'
    | 'app-orange'
    | 'app-teal'
    | 'app-green'
    | 'app-red'
    | 'lime-green'
    | 'yellow-green'
    | 'brown'
    | 'warm-peach-pink';

export interface TagProps {
    size?: TagSize;
    variant?: TagVariant;
    color?: TagColor;
    closable?: boolean;
    disabled?: boolean;
}
