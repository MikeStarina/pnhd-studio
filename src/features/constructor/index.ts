/** Публичный вход модуля. В pnhd-studio: src/app/constructor/page.tsx → <ConstructorApp />. */
export { ConstructorApp } from './ui/ConstructorApp';
export { AddedPrompt } from './ui/AddedPrompt';
export { groupProducts, fetchCatalog } from './api/catalog';
export { ANALYTICS_OFF_KEY } from './analytics/events';
export { calcPrice } from './model/pricing';
export type * from './model/types';
