import { describe, expect, it, vi } from 'vitest';
import { render } from 'svelte/server';
import DataTable from './DataTable.svelte';
import source from './DataTable.svelte?raw';

const columns = [{ key: 'name', header: 'Name', searchable: true, sortable: true }];

describe('DataTable', () => {
	it('filters and paginates local rows', () => {
		const searched = render(DataTable, {
			props: {
				data: [
					{ id: 1, name: 'Alpha' },
					{ id: 2, name: 'Omega' }
				] as Array<{ id: number; name: string }>,
				columns,
				search: 'omega'
			}
		}).body;
		expect(searched).toContain('Omega');
		expect(searched).not.toContain('Alpha');

		const paged = render(DataTable, {
			props: {
				data: Array.from({ length: 11 }, (_, index) => ({
					id: index + 1,
					name: `Row ${index + 1}`
				})),
				columns
			}
		}).body;
		expect(paged).toContain('Row 10');
		expect(paged).not.toContain('Row 11');
		expect(source).toContain('localeCompare(String(bv), undefined, { numeric: true })');
	});

	it('does not filter or slice rows supplied by a server', () => {
		const body = render(DataTable, {
			props: {
				data: [{ id: 2, name: 'Server row' }] as Array<{ id: number; name: string }>,
				columns,
				search: 'no local match',
				server: {
					page: 2,
					pageSize: 1,
					total: 3,
					onPageChange: vi.fn()
				}
			}
		}).body;
		expect(body).toContain('Server row');
		expect(body).toContain('Showing');
		expect(body).toContain('of');
		expect(body).toContain('3');
	});

	it('keeps loaded rows visible and exposes localization and busy state', () => {
		const body = render(DataTable, {
			props: {
				data: [{ id: 1, name: 'Existing row' }] as Array<{ id: number; name: string }>,
				columns,
				searchable: true,
				loading: true,
				text: (key) => `translated:${key}`
			}
		}).body;
		expect(body).toContain('Existing row');
		expect(body).toContain('translated:common.searchPlaceholder');
		expect(body).toContain('aria-busy="true"');
	});

	it('keeps bindable state, debounce, and callbacks single-path', () => {
		expect(source.match(/\$bindable\(/g)).toHaveLength(2);
		expect(source.match(/callback\(query\)/g)).toHaveLength(1);
		expect(source.match(/server\.onPageChange\(next\)/g)).toHaveLength(1);
		expect(source.match(/server\.onSortChange\(column\.key, nextDirection\)/g)).toHaveLength(1);
		expect(source).toContain('setTimeout(() => callback(query), 200)');
		expect(source).toContain('disabled={loading || !hasPrev}');
		expect(source).toContain('disabled={loading || !hasNext}');
	});
});
