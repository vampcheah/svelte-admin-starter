<!--
  Components showcase — a "kitchen sink" visual catalog of the UI primitives
  available in this template. Each family lives in its own titled Card, arranged
  in a responsive two-column grid. Everything here is static demo state; nothing
  talks to a backend.
-->
<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import * as Select from '$lib/components/ui/select';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Accordion from '$lib/components/ui/accordion';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as Popover from '$lib/components/ui/popover';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import * as Pagination from '$lib/components/ui/pagination';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Switch } from '$lib/components/ui/switch';
	import { Slider } from '$lib/components/ui/slider';
	import { Progress } from '$lib/components/ui/progress';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { PageContainer, PageHeader } from '$lib/components/shared';
	import { toast } from 'svelte-sonner';
	import InfoIcon from '@lucide/svelte/icons/info';
	import AlertTriangleIcon from '@lucide/svelte/icons/triangle-alert';
	import MailIcon from '@lucide/svelte/icons/mail';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Loader2Icon from '@lucide/svelte/icons/loader-circle';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';

	// Local interactive state for the demos.
	let selectValue = $state('apple');
	let checkA = $state(true);
	let checkB = $state(false);
	let switchOn = $state(true);
	let radioValue = $state('comfortable');
	let sliderValue = $state(60);
	let progressValue = $state(45);
	let page = $state(2);

	const fruits = [
		{ value: 'apple', label: 'Apple' },
		{ value: 'banana', label: 'Banana' },
		{ value: 'cherry', label: 'Cherry' },
		{ value: 'grape', label: 'Grape' }
	];

	const selectLabel = $derived(
		fruits.find((f) => f.value === selectValue)?.label ?? 'Select a fruit'
	);
</script>

<svelte:head>
	<title>Components · Admin Starter</title>
</svelte:head>

<PageContainer>
	<PageHeader
		title="Components"
		description="A visual catalog of the UI building blocks bundled with this template."
	/>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Buttons -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Buttons</Card.Title>
				<Card.Description>Variants, sizes, icons and loading state.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="flex flex-wrap gap-2">
					<Button>Default</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="destructive">Destructive</Button>
					<Button variant="link">Link</Button>
				</div>
				<div class="flex flex-wrap items-center gap-2">
					<Button size="sm">Small</Button>
					<Button>Default</Button>
					<Button size="lg">Large</Button>
					<Button size="icon" aria-label="Add"><PlusIcon /></Button>
				</div>
				<div class="flex flex-wrap items-center gap-2">
					<Button><MailIcon />With icon</Button>
					<Button disabled>
						<Loader2Icon class="animate-spin" />
						Loading
					</Button>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Badges -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Badges</Card.Title>
				<Card.Description>Compact labels and status accents.</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-wrap items-center gap-2">
				<Badge>Default</Badge>
				<Badge variant="secondary">Secondary</Badge>
				<Badge variant="outline">Outline</Badge>
				<Badge variant="destructive">Destructive</Badge>
				<Badge variant="outline" class="border-emerald-500/40 text-emerald-500">Active</Badge>
				<Badge variant="outline" class="border-amber-500/40 text-amber-500">Pending</Badge>
				<Badge variant="outline" class="border-red-500/40 text-red-500">Failed</Badge>
			</Card.Content>
		</Card.Root>

		<!-- Alerts -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Alerts</Card.Title>
				<Card.Description>Inline messages with optional icons.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-3">
				<Alert.Root>
					<InfoIcon />
					<Alert.Title>Heads up</Alert.Title>
					<Alert.Description>This is an informational message for the user.</Alert.Description>
				</Alert.Root>
				<Alert.Root variant="destructive">
					<AlertTriangleIcon />
					<Alert.Title>Something went wrong</Alert.Title>
					<Alert.Description>Your changes could not be saved. Please retry.</Alert.Description>
				</Alert.Root>
			</Card.Content>
		</Card.Root>

		<!-- Inputs & Labels -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Inputs &amp; Labels</Card.Title>
				<Card.Description>Text fields with leading icons and states.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="grid gap-2">
					<Label for="demo-email">Email</Label>
					<div class="relative">
						<MailIcon
							class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
						/>
						<Input id="demo-email" type="email" placeholder="you@example.com" class="pl-8" />
					</div>
				</div>
				<div class="grid gap-2">
					<Label for="demo-disabled">Disabled</Label>
					<Input id="demo-disabled" value="Cannot edit" disabled />
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Select -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Select</Card.Title>
				<Card.Description>A single-value dropdown.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Select.Root type="single" bind:value={selectValue}>
					<Select.Trigger class="w-full sm:w-64">{selectLabel}</Select.Trigger>
					<Select.Content>
						{#each fruits as fruit (fruit.value)}
							<Select.Item value={fruit.value} label={fruit.label}>{fruit.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</Card.Content>
		</Card.Root>

		<!-- Checkbox / Switch / Radio -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Toggles</Card.Title>
				<Card.Description>Checkbox, switch and radio group.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-5">
				<div class="space-y-2">
					<Label class="flex items-center gap-2 font-normal">
						<Checkbox bind:checked={checkA} /> Email notifications
					</Label>
					<Label class="flex items-center gap-2 font-normal">
						<Checkbox bind:checked={checkB} /> SMS notifications
					</Label>
				</div>
				<Label class="flex items-center justify-between font-normal">
					<span>Dark mode preview</span>
					<Switch checked={switchOn} onCheckedChange={(v) => (switchOn = v)} />
				</Label>
				<RadioGroup.Root bind:value={radioValue}>
					<Label class="flex items-center gap-2 font-normal">
						<RadioGroup.Item value="comfortable" /> Comfortable
					</Label>
					<Label class="flex items-center gap-2 font-normal">
						<RadioGroup.Item value="compact" /> Compact
					</Label>
				</RadioGroup.Root>
			</Card.Content>
		</Card.Root>

		<!-- Slider & Progress -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Slider &amp; Progress</Card.Title>
				<Card.Description>Range input and a progress indicator.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-6">
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label>Volume</Label>
						<span class="text-muted-foreground text-sm tabular-nums">{sliderValue}%</span>
					</div>
					<Slider type="single" bind:value={sliderValue} min={0} max={100} step={1} />
				</div>
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Label>Upload</Label>
						<span class="text-muted-foreground text-sm tabular-nums">{progressValue}%</span>
					</div>
					<Progress value={progressValue} />
					<div class="flex gap-2">
						<Button
							size="sm"
							variant="outline"
							onclick={() => (progressValue = Math.max(0, progressValue - 10))}
						>
							-10%
						</Button>
						<Button
							size="sm"
							variant="outline"
							onclick={() => (progressValue = Math.min(100, progressValue + 10))}
						>
							+10%
						</Button>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Tabs -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Tabs</Card.Title>
				<Card.Description>Switch between related panels.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Tabs.Root value="overview">
					<Tabs.List>
						<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
						<Tabs.Trigger value="activity">Activity</Tabs.Trigger>
						<Tabs.Trigger value="settings">Settings</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="overview" class="text-muted-foreground pt-2 text-sm">
						A high-level summary of the current workspace.
					</Tabs.Content>
					<Tabs.Content value="activity" class="text-muted-foreground pt-2 text-sm">
						Recent events appear here in chronological order.
					</Tabs.Content>
					<Tabs.Content value="settings" class="text-muted-foreground pt-2 text-sm">
						Configuration options for this section.
					</Tabs.Content>
				</Tabs.Root>
			</Card.Content>
		</Card.Root>

		<!-- Accordion -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Accordion</Card.Title>
				<Card.Description>Collapsible sections of content.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Accordion.Root type="single">
					<Accordion.Item value="item-1">
						<Accordion.Trigger>Is it accessible?</Accordion.Trigger>
						<Accordion.Content>Yes — it follows WAI-ARIA design patterns.</Accordion.Content>
					</Accordion.Item>
					<Accordion.Item value="item-2">
						<Accordion.Trigger>Is it styled?</Accordion.Trigger>
						<Accordion.Content>Yes — it ships with sensible default styles.</Accordion.Content>
					</Accordion.Item>
					<Accordion.Item value="item-3">
						<Accordion.Trigger>Is it animated?</Accordion.Trigger>
						<Accordion.Content>Yes — open and close transitions are built in.</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>
			</Card.Content>
		</Card.Root>

		<!-- Overlays: Tooltip / Popover / HoverCard -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Overlays</Card.Title>
				<Card.Description>Tooltip, popover and hover card.</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-wrap gap-2">
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<Button {...props} variant="outline">Tooltip</Button>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content>Helpful context on hover</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>

				<Popover.Root>
					<Popover.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outline">Popover</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content class="w-64">
						<div class="space-y-1">
							<p class="text-sm font-medium">Dimensions</p>
							<p class="text-muted-foreground text-xs">Set the width and height of the layer.</p>
						</div>
					</Popover.Content>
				</Popover.Root>

				<HoverCard.Root>
					<HoverCard.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outline">Hover card</Button>
						{/snippet}
					</HoverCard.Trigger>
					<HoverCard.Content class="w-64">
						<div class="flex items-center gap-3">
							<Avatar.Root class="size-10">
								<Avatar.Fallback>SV</Avatar.Fallback>
							</Avatar.Root>
							<div>
								<p class="text-sm font-medium">Svelte</p>
								<p class="text-muted-foreground text-xs">Cybernetically enhanced web apps.</p>
							</div>
						</div>
					</HoverCard.Content>
				</HoverCard.Root>
			</Card.Content>
		</Card.Root>

		<!-- Dropdown menu -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Dropdown menu</Card.Title>
				<Card.Description>A menu of contextual actions.</Card.Description>
			</Card.Header>
			<Card.Content>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outline">
								Open menu
								<EllipsisIcon />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="start" class="w-48">
						<DropdownMenu.Label>My account</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Group>
							<DropdownMenu.Item>Profile</DropdownMenu.Item>
							<DropdownMenu.Item>Billing</DropdownMenu.Item>
							<DropdownMenu.Item>Settings</DropdownMenu.Item>
						</DropdownMenu.Group>
						<DropdownMenu.Separator />
						<DropdownMenu.Item class="text-destructive">Log out</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Card.Content>
		</Card.Root>

		<!-- Dialog & AlertDialog -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Dialogs</Card.Title>
				<Card.Description>Modal dialog and a destructive confirm.</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-wrap gap-2">
				<Dialog.Root>
					<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>
						Open dialog
					</Dialog.Trigger>
					<Dialog.Content class="sm:max-w-md">
						<Dialog.Header>
							<Dialog.Title>Edit profile</Dialog.Title>
							<Dialog.Description>Update your display name, then save.</Dialog.Description>
						</Dialog.Header>
						<div class="grid gap-2 py-2">
							<Label for="dialog-name">Name</Label>
							<Input id="dialog-name" value="Olivia Martin" />
						</div>
						<Dialog.Footer>
							<Dialog.Close class={buttonVariants({ variant: 'outline' })}>Cancel</Dialog.Close>
							<Dialog.Close class={buttonVariants()}>Save</Dialog.Close>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Root>

				<AlertDialog.Root>
					<AlertDialog.Trigger class={buttonVariants({ variant: 'destructive' })}>
						Delete
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
							<AlertDialog.Description>
								This action cannot be undone. This will permanently delete the record.
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
							<AlertDialog.Action variant="destructive">Delete</AlertDialog.Action>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			</Card.Content>
		</Card.Root>

		<!-- Avatars -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Avatars</Card.Title>
				<Card.Description>Image with initials fallback.</Card.Description>
			</Card.Header>
			<Card.Content class="flex items-center gap-3">
				<Avatar.Root>
					<Avatar.Image src="https://i.pravatar.cc/80?img=12" alt="User" />
					<Avatar.Fallback>OM</Avatar.Fallback>
				</Avatar.Root>
				<Avatar.Root>
					<Avatar.Fallback>JD</Avatar.Fallback>
				</Avatar.Root>
				<Avatar.Root class="size-12">
					<Avatar.Fallback>AB</Avatar.Fallback>
				</Avatar.Root>
			</Card.Content>
		</Card.Root>

		<!-- Skeleton -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Skeleton</Card.Title>
				<Card.Description>Loading placeholders.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center gap-4">
					<Skeleton class="size-12 rounded-full" />
					<div class="flex-1 space-y-2">
						<Skeleton class="h-4 w-3/4" />
						<Skeleton class="h-4 w-1/2" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Toasts -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Toasts</Card.Title>
				<Card.Description>Transient notifications via sonner.</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-wrap gap-2">
				<Button variant="outline" onclick={() => toast.success('Saved successfully')}>
					Success
				</Button>
				<Button variant="outline" onclick={() => toast.error('Something went wrong')}>
					Error
				</Button>
				<Button variant="outline" onclick={() => toast.info('Heads up — new update')}>
					Info
				</Button>
				<Button variant="outline" onclick={() => toast.warning('Low disk space')}>
					Warning
				</Button>
			</Card.Content>
		</Card.Root>

		<!-- Breadcrumb -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Breadcrumb</Card.Title>
				<Card.Description>Hierarchical navigation trail.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Breadcrumb.Root>
					<Breadcrumb.List>
						<Breadcrumb.Item>
							<Breadcrumb.Link href="/dashboard">Home</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator />
						<Breadcrumb.Item>
							<Breadcrumb.Link href="/components">Components</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator />
						<Breadcrumb.Item>
							<Breadcrumb.Page>Catalog</Breadcrumb.Page>
						</Breadcrumb.Item>
					</Breadcrumb.List>
				</Breadcrumb.Root>
			</Card.Content>
		</Card.Root>

		<!-- Pagination -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Pagination</Card.Title>
				<Card.Description>Navigate between pages of results.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Pagination.Root count={100} perPage={10} bind:page>
					{#snippet children({ pages, currentPage })}
						<Pagination.Content>
							<Pagination.Item>
								<Pagination.PrevButton />
							</Pagination.Item>
							{#each pages as p (p.key)}
								{#if p.type === 'ellipsis'}
									<Pagination.Item>
										<Pagination.Ellipsis />
									</Pagination.Item>
								{:else}
									<Pagination.Item>
										<Pagination.Link page={p} isActive={currentPage === p.value}>
											{p.value}
										</Pagination.Link>
									</Pagination.Item>
								{/if}
							{/each}
							<Pagination.Item>
								<Pagination.NextButton />
							</Pagination.Item>
						</Pagination.Content>
					{/snippet}
				</Pagination.Root>
			</Card.Content>
		</Card.Root>
	</div>
</PageContainer>
