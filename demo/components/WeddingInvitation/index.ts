// Demo-only re-exports. 不参与库的 npm 打包。
export { default as WeddingInvitation } from './WeddingInvitation.vue';
export { default as WeddingInvitationExportButton } from './WeddingInvitationExportButton.vue';
export type {
    WeddingInvitationProps,
    WeddingInvitationExpose,
    WeddingInvitationExportButtonProps,
} from './types';
