import type { Column } from '#lib/core/components/shared/DataTable.svelte';
import type { DemoProduct } from '#lib/data/products.ts';

export const columns: Column<DemoProduct>[] = [
	{ key: 'name', header: 'Product', sortable: true, searchable: true },
	{ key: 'category', header: 'Category', sortable: true, searchable: true },
	{ key: 'price', header: 'Price', sortable: true, align: 'right' },
	{ key: 'stock', header: 'Stock', sortable: true, align: 'right' },
	{ key: 'status', header: 'Status' }
];
