<!-- Breadcrumb trail renderer. -->
<script lang="ts">
	import * as Breadcrumb from '../components/ui/breadcrumb';
	import { cn } from '../utils';
	import type { BreadcrumbCrumb } from './nav';

	interface Props {
		crumbs: readonly BreadcrumbCrumb[];
		resolveHref?: (href: string) => string;
	}

	let { crumbs, resolveHref = (href) => href }: Props = $props();
</script>

<Breadcrumb.Root class="min-w-0 overflow-hidden">
	<Breadcrumb.List>
		{#each crumbs as crumb, i (i)}
			<Breadcrumb.Item
				class={cn('min-w-0', i > 0 && i < crumbs.length - 1 ? 'hidden md:block' : '')}
			>
				{#if i === crumbs.length - 1 || !crumb.href}
					<Breadcrumb.Page
						class="max-w-[150px] sm:max-w-[240px] inline-block truncate align-bottom"
					>
						{crumb.label}
					</Breadcrumb.Page>
				{:else}
					<Breadcrumb.Link
						href={resolveHref(crumb.href)}
						class="max-w-[120px] sm:max-w-[200px] inline-block truncate align-bottom"
					>
						{crumb.label}
					</Breadcrumb.Link>
				{/if}
			</Breadcrumb.Item>
			{#if i < crumbs.length - 1}
				<Breadcrumb.Separator class={i > 0 && i < crumbs.length - 1 ? 'hidden md:block' : ''} />
			{/if}
		{/each}
	</Breadcrumb.List>
</Breadcrumb.Root>
