<!-- Breadcrumb trail derived from the current path + nav model. -->
<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { page } from '$app/state';
	import { findNavItem } from './nav';

	interface Crumb {
		label: string;
		href?: string;
	}

	function titleCase(segment: string): string {
		return segment
			.split('-')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ');
	}

	const crumbs = $derived.by((): Crumb[] => {
		const pathname = page.url.pathname;
		const trail: Crumb[] = [{ label: 'Home', href: '/dashboard' }];

		const match = findNavItem(pathname);
		if (match) {
			trail.push({ label: match.group.label });
			trail.push({ label: match.item.title, href: match.item.href });

			// Any path segments beyond the matched nav item become extra crumbs.
			const rest = pathname.slice(match.item.href.length).split('/').filter(Boolean);
			let acc = match.item.href;
			for (const seg of rest) {
				acc += '/' + seg;
				trail.push({ label: titleCase(seg), href: acc });
			}
		} else {
			// Fallback: build crumbs straight from path segments.
			let acc = '';
			for (const seg of pathname.split('/').filter(Boolean)) {
				acc += '/' + seg;
				trail.push({ label: titleCase(seg), href: acc });
			}
		}
		return trail;
	});
</script>

<Breadcrumb.Root>
	<Breadcrumb.List>
		{#each crumbs as crumb, i (i)}
			<Breadcrumb.Item class={i > 0 && i < crumbs.length - 1 ? 'hidden md:block' : ''}>
				{#if i === crumbs.length - 1 || !crumb.href}
					<Breadcrumb.Page>{crumb.label}</Breadcrumb.Page>
				{:else}
					<Breadcrumb.Link href={crumb.href}>{crumb.label}</Breadcrumb.Link>
				{/if}
			</Breadcrumb.Item>
			{#if i < crumbs.length - 1}
				<Breadcrumb.Separator class={i > 0 && i < crumbs.length - 1 ? 'hidden md:block' : ''} />
			{/if}
		{/each}
	</Breadcrumb.List>
</Breadcrumb.Root>
