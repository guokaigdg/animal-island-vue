/**
 * naive-icons-vue 的类型旁路声明。
 *
 * 上游 1.9.0 的 package.json 把 exports 的 types 指向不存在的 dist/*.d.mts
 * （实际只产出了 .d.ts / .d.cts），在 moduleResolution: bundler / node16 下
 * TypeScript 解析不到类型。这里用简写声明把模块标为 any，让本仓库能正常编译。
 *
 * 产物 d.ts 里仍然写的是包名 'naive-icons-vue'，消费方自己解析；
 * 上游把 exports 修好后，这里的旁路即可删除。
 */
declare module 'naive-icons-vue';
