import { afterEach, describe, expect, it, vi } from 'vitest';

import { downloadBlob } from './csv';

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('downloadBlob', () => {
	it('releases the object URL after the click has been dispatched', () => {
		vi.useFakeTimers();
		const anchor = { click: vi.fn(), download: '', href: '', style: { display: '' } };
		vi.stubGlobal('document', {
			createElement: () => anchor,
			body: { appendChild: vi.fn(), removeChild: vi.fn() }
		});
		vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
		const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

		downloadBlob('report', 'report.csv');

		expect(anchor.click).toHaveBeenCalledOnce();
		expect(revoke).not.toHaveBeenCalled();
		vi.runAllTimers();
		expect(revoke).toHaveBeenCalledWith('blob:test');
	});
});
