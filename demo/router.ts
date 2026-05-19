import { ref, onMounted, onBeforeUnmount } from 'vue';

export function useHash() {
    const hash = ref<string>(window.location.hash.slice(1) || '/');
    const onChange = () => {
        hash.value = window.location.hash.slice(1) || '/';
    };
    onMounted(() => window.addEventListener('hashchange', onChange));
    onBeforeUnmount(() => window.removeEventListener('hashchange', onChange));
    const navigate = (path: string) => {
        window.location.hash = path;
    };
    return { hash, navigate };
}

export function useIsMobile(breakpoint = 768) {
    const isMobile = ref<boolean>(window.innerWidth < breakpoint);
    const onResize = () => {
        isMobile.value = window.innerWidth < breakpoint;
    };
    onMounted(() => window.addEventListener('resize', onResize));
    onBeforeUnmount(() => window.removeEventListener('resize', onResize));
    return isMobile;
}
