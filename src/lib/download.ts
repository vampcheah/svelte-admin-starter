// 下载二次确认：所有文件下载/打开前先弹确认框，确认后再 window.open。
import { confirm } from '$lib/confirm.svelte';
import { t } from '$lib/i18n';

export async function confirmDownload(url: string): Promise<void> {
	const ok = await confirm({
		title: t('download.confirmTitle'),
		description: t('download.confirmDesc'),
		confirmText: t('common.download')
	});
	if (ok) window.open(url, '_blank');
}
