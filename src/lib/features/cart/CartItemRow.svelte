<script lang="ts">
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Package from '@lucide/svelte/icons/package';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import type { CartItem } from '#lib/data/cart.ts';
	import { t } from '#lib/i18n/index.ts';
	import { formatCurrency, formatNumber } from '#lib/i18n/formatters.ts';

	interface Props {
		item: CartItem;
		onIncrement: () => void;
		onDecrement: () => void;
		onRemove: () => void;
	}
	let { item, onIncrement, onDecrement, onRemove }: Props = $props();
</script>

<li
	class="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 p-4 sm:flex sm:gap-4 sm:px-6"
>
	<div
		class="bg-muted text-muted-foreground row-span-2 flex size-12 shrink-0 items-center justify-center rounded-lg border border-border sm:size-16"
		aria-hidden="true"
	>
		<Package class="size-6" />
	</div>

	<div class="min-w-0 flex-1">
		<p class="truncate text-sm font-medium text-foreground">{item.name}</p>
		<p class="text-muted-foreground truncate text-xs">{item.category}</p>
		<p class="text-muted-foreground mt-1 text-xs tabular-nums">
			{t('cart.unitPrice', { price: formatCurrency(item.price) })}
		</p>
	</div>

	<div class="col-start-2 row-start-2 flex w-fit items-center rounded-lg border border-border">
		<Button
			variant="ghost"
			size="icon"
			class="text-muted-foreground hover:text-foreground size-8 rounded-r-none"
			title={t('cart.decreaseQuantity')}
			aria-label={t('cart.decreaseNamed', { name: item.name })}
			disabled={item.quantity <= 1}
			onclick={onDecrement}
		>
			<Minus class="size-3.5" aria-hidden="true" />
		</Button>
		<output
			class="w-9 text-center text-sm font-medium tabular-nums text-foreground"
			aria-label={t('cart.quantity')}
		>
			{formatNumber(item.quantity)}
		</output>
		<Button
			variant="ghost"
			size="icon"
			class="text-muted-foreground hover:text-foreground size-8 rounded-l-none"
			title={t('cart.increaseQuantity')}
			aria-label={t('cart.increaseNamed', { name: item.name })}
			onclick={onIncrement}
		>
			<Plus class="size-3.5" aria-hidden="true" />
		</Button>
	</div>

	<div class="col-start-3 row-start-2 shrink-0 text-right sm:w-24">
		<p class="text-sm font-semibold tabular-nums text-foreground">
			{formatCurrency(item.price * item.quantity)}
		</p>
	</div>

	<Button
		variant="ghost"
		size="icon"
		class="text-muted-foreground hover:text-destructive col-start-3 row-start-1 size-8 shrink-0 justify-self-end"
		title={t('cart.removeItem')}
		aria-label={t('cart.removeNamed', { name: item.name })}
		onclick={onRemove}
	>
		<Trash2 class="size-4" aria-hidden="true" />
	</Button>
</li>
