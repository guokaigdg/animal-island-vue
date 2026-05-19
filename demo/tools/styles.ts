import type { CSSProperties } from 'vue';

export interface ApiRow {
    prop: string;
    desc: string;
    type: string;
    defaultVal?: string;
    required?: boolean;
}

export const sectionStyle: CSSProperties = {
    marginBottom: '36px',
    padding: '24px',
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e8e2d6',
};

export const sectionTitleStyle: CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#725d42',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
};

export const tagStyle: CSSProperties = {
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '20px',
    background: '#f0e8d8',
    color: '#a08060',
    fontWeight: 500,
};

export const labelStyle: CSSProperties = {
    fontSize: '14px',
    color: '#a0936e',
    marginTop: '20px',
    marginBottom: '20px',
    fontWeight: 500,
};

export const demoBodyStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
};

export const demoBoxStyle: CSSProperties = {
    marginTop: '12px',
    padding: '16px',
    background: '#faf8f3',
    borderRadius: '12px',
    border: '1px solid #e8e2d6',
};

export const textStyle: CSSProperties = {
    fontSize: '13px',
    color: '#8a7b66',
    margin: 0,
};

export const demoDashedBoxStyle: CSSProperties = {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    background: 'rgb(250, 248, 242)',
    border: '1px dashed rgb(224, 216, 200)',
    borderRadius: '18px',
};

export const codeLabelStyle: CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#e7e4e0',
    marginBottom: 0,
    padding: '6px 12px',
    background: '#3d3028',
    borderRadius: '10px 10px 0 0',
    display: 'inline-block',
};
