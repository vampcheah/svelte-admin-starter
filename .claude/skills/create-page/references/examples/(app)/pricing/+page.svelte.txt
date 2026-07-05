<!--
  Pricing / Plans — three subscription tiers with a Monthly / Annual billing
  toggle (annual is billed at a 20% discount, shown as an effective per-month
  price). The middle "Pro" tier is highlighted as the most popular option with
  an indigo (primary) ring and accent badge. A compact FAQ closes the page.
  All data is mock and lives inline; CTAs simply fire a toast.
-->
<script lang="ts">
	import { PageContainer, PageHeader } from '$lib/components/shared';
	import * as Card from '$lib/components/ui/card';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { cn } from '$lib/utils';
	import { formatCurrency } from '$lib/utils/formatters';
	import { toast } from 'svelte-sonner';
	import Check from '@lucide/svelte/icons/check';
	import Minus from '@lucide/svelte/icons/minus';
	import Sparkles from '@lucide/svelte/icons/sparkles';

	type BillingCycle = 'monthly' | 'annual';

	interface PlanFeature {
		label: string;
		included: boolean;
	}

	interface Plan {
		id: string;
		name: string;
		description: string;
		/** Base monthly price in USD. Annual is derived at a 20% discount. */
		monthly: number;
		cta: string;
		popular: boolean;
		features: PlanFeature[];
	}

	// 20% off when billed annually — the headline savings shown on the toggle.
	const ANNUAL_DISCOUNT = 0.2;

	// Inline mock catalogue. No backend; this drives the whole page.
	const plans: Plan[] = [
		{
			id: 'starter',
			name: 'Starter',
			description: 'For individuals and small side projects getting off the ground.',
			monthly: 19,
			cta: 'Start free trial',
			popular: false,
			features: [
				{ label: 'Up to 3 team members', included: true },
				{ label: '5 active projects', included: true },
				{ label: '10 GB storage', included: true },
				{ label: 'Community support', included: true },
				{ label: 'Advanced analytics', included: false },
				{ label: 'Single sign-on (SSO)', included: false },
				{ label: 'Priority support', included: false }
			]
		},
		{
			id: 'pro',
			name: 'Pro',
			description: 'For growing teams that need automation and deeper insights.',
			monthly: 49,
			cta: 'Upgrade to Pro',
			popular: true,
			features: [
				{ label: 'Up to 20 team members', included: true },
				{ label: 'Unlimited projects', included: true },
				{ label: '250 GB storage', included: true },
				{ label: 'Advanced analytics', included: true },
				{ label: 'Workflow automations', included: true },
				{ label: 'Priority email support', included: true },
				{ label: 'Single sign-on (SSO)', included: false }
			]
		},
		{
			id: 'enterprise',
			name: 'Enterprise',
			description: 'For organizations with advanced security and scale requirements.',
			monthly: 99,
			cta: 'Contact sales',
			popular: false,
			features: [
				{ label: 'Unlimited team members', included: true },
				{ label: 'Unlimited projects', included: true },
				{ label: 'Unlimited storage', included: true },
				{ label: 'Single sign-on (SSO) & SCIM', included: true },
				{ label: 'Dedicated account manager', included: true },
				{ label: '99.9% uptime SLA', included: true },
				{ label: 'Audit logs & data residency', included: true }
			]
		}
	];

	const faqs = [
		{
			question: 'Can I change my plan later?',
			answer:
				'Absolutely. You can upgrade, downgrade, or cancel at any time from your billing settings. Changes are prorated automatically against your current cycle.'
		},
		{
			question: 'What happens when my free trial ends?',
			answer:
				'Your 14-day trial includes every Pro feature. When it ends you can pick any paid plan to keep going — if you do nothing, your workspace simply pauses and your data is kept safe.'
		},
		{
			question: 'How does annual billing save me 20%?',
			answer:
				'Paying yearly bills you for twelve months upfront at a 20% discount, which works out to roughly two and a half months free compared to paying month to month.'
		},
		{
			question: 'Do you offer refunds?',
			answer:
				'Yes. If you are not satisfied within the first 30 days of a paid plan, reach out to support for a full, no-questions-asked refund.'
		}
	];

	// Selected billing cycle drives every displayed price.
	let billing = $state<BillingCycle>('monthly');

	// Effective per-month price for the current cycle (annual rounds to a clean
	// whole dollar so the toggled figures read cleanly).
	function monthlyPrice(plan: Plan): number {
		if (billing === 'annual') {
			return Math.round(plan.monthly * (1 - ANNUAL_DISCOUNT));
		}
		return plan.monthly;
	}

	// Total charged per billing period (12 months for annual).
	function periodTotal(plan: Plan): number {
		return billing === 'annual' ? monthlyPrice(plan) * 12 : plan.monthly;
	}

	function selectPlan(plan: Plan): void {
		toast.success(`${plan.name} plan selected`, {
			description: `Billed ${billing} · ${formatCurrency(periodTotal(plan))}${
				billing === 'annual' ? ' per year' : ' per month'
			}.`
		});
	}
</script>

<svelte:head>
	<title>Pricing · Admin Starter</title>
</svelte:head>

<PageContainer>
	<PageHeader
		title="Pricing"
		description="Simple, transparent pricing that scales with your team. No hidden fees."
	/>

	<!-- Billing cycle toggle: segmented control mirroring the appearance page. -->
	<div class="flex flex-col items-center gap-3">
		<div
			role="radiogroup"
			aria-label="Billing cycle"
			class="bg-muted inline-grid grid-cols-2 gap-1 rounded-lg p-1"
		>
			<button
				type="button"
				role="radio"
				aria-checked={billing === 'monthly'}
				onclick={() => (billing = 'monthly')}
				class={cn(
					'rounded-md px-4 py-2 text-sm font-medium transition-colors',
					'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
					billing === 'monthly'
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground'
				)}
			>
				Monthly
			</button>
			<button
				type="button"
				role="radio"
				aria-checked={billing === 'annual'}
				onclick={() => (billing = 'annual')}
				class={cn(
					'flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
					'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
					billing === 'annual'
						? 'bg-background text-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground'
				)}
			>
				Annual
				<Badge
					variant="secondary"
					class={cn('border-transparent', billing === 'annual' && 'bg-primary/10 text-primary')}
				>
					Save 20%
				</Badge>
			</button>
		</div>
		<p class="text-muted-foreground text-xs">
			{billing === 'annual'
				? 'Billed yearly. Prices shown per month.'
				: 'Billed monthly. Switch to annual to save 20%.'}
		</p>
	</div>

	<!-- Plan grid. The popular tier lifts slightly and gains an indigo ring. -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
		{#each plans as plan (plan.id)}
			<Card.Root
				class={cn(
					'relative flex h-full flex-col',
					plan.popular && 'border-primary ring-primary/30 shadow-lg ring-1 lg:-mt-2'
				)}
			>
				{#if plan.popular}
					<Badge class="absolute -top-3 left-1/2 -translate-x-1/2 gap-1 shadow-sm">
						<Sparkles class="size-3" aria-hidden="true" />
						Most popular
					</Badge>
				{/if}

				<Card.Header>
					<Card.Title class="text-lg">{plan.name}</Card.Title>
					<Card.Description>{plan.description}</Card.Description>
				</Card.Header>

				<Card.Content class="flex flex-1 flex-col gap-6">
					<!-- Price -->
					<div>
						<div class="flex items-baseline gap-1">
							<span class="text-foreground text-4xl font-semibold tracking-tight tabular-nums">
								{formatCurrency(monthlyPrice(plan))}
							</span>
							<span class="text-muted-foreground text-sm font-medium">/mo</span>
						</div>
						<p class="text-muted-foreground mt-1 text-xs tabular-nums">
							{#if billing === 'annual'}
								{formatCurrency(periodTotal(plan))} billed annually
							{:else}
								Billed monthly
							{/if}
						</p>
					</div>

					<Button
						variant={plan.popular ? 'default' : 'outline'}
						class="w-full"
						onclick={() => selectPlan(plan)}
					>
						{plan.cta}
					</Button>

					<Separator />

					<!-- Feature list -->
					<ul class="space-y-3 text-sm">
						{#each plan.features as feature (feature.label)}
							<li class="flex items-start gap-3">
								{#if feature.included}
									<span
										class="bg-primary/10 text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full"
									>
										<Check class="size-3.5" aria-hidden="true" />
									</span>
									<span class="text-foreground">{feature.label}</span>
								{:else}
									<span
										class="bg-muted text-muted-foreground mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full"
									>
										<Minus class="size-3.5" aria-hidden="true" />
									</span>
									<span class="text-muted-foreground line-through decoration-muted-foreground/40">
										{feature.label}
									</span>
								{/if}
							</li>
						{/each}
					</ul>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<!-- FAQ -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Frequently asked questions</Card.Title>
			<Card.Description>Everything you need to know about billing and plans.</Card.Description>
		</Card.Header>
		<Card.Content>
			<Accordion.Root type="single">
				{#each faqs as faq, i (faq.question)}
					<Accordion.Item value="faq-{i}">
						<Accordion.Trigger>{faq.question}</Accordion.Trigger>
						<Accordion.Content>
							<p class="text-muted-foreground">{faq.answer}</p>
						</Accordion.Content>
					</Accordion.Item>
				{/each}
			</Accordion.Root>
		</Card.Content>
	</Card.Root>
</PageContainer>
