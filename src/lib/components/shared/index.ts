// Shared presentational components — the reusable building blocks consumed by
// pages, the app shell, and other feature areas. Import from `$lib/components/shared`.
export { default as PageHeader } from './PageHeader.svelte';
export { default as PageContainer } from './PageContainer.svelte';
export { default as StatCard } from './StatCard.svelte';
export { default as StatusBadge, type BadgeTone } from './StatusBadge.svelte';
export { default as DataTable } from './DataTable.svelte';
export { default as EmptyState } from './EmptyState.svelte';
export { default as ConfirmDialog } from './ConfirmDialog.svelte';
export { default as ConfirmHost } from './ConfirmHost.svelte';
export { default as ThemeToggle } from './ThemeToggle.svelte';
export { default as LanguageToggle } from './LanguageToggle.svelte';
export { default as Spinner } from './Spinner.svelte';
export { default as SearchInput } from './SearchInput.svelte';
export { default as CommandMenu } from './CommandMenu.svelte';
export { default as DatePicker } from './DatePicker.svelte';
export { default as TimePicker } from './TimePicker.svelte';
export { default as DateTimePicker } from './DateTimePicker.svelte';
export { default as LineItemsEditor } from './LineItemsEditor.svelte';
export { default as QuickCreateClient } from './QuickCreateClient.svelte';

export type { Column } from './DataTable.svelte';
export type { EditableLine } from './LineItemsEditor.svelte';
