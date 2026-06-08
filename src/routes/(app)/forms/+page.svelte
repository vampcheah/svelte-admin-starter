<!--
  Forms reference — a realistic "Create project" form demonstrating the common
  field patterns (text, textarea, select, checkbox group, radio group, switch,
  date picker, slider) with inline zod validation. A second card shows the input
  states (default / disabled / error / with-icon). No backend — submit just
  shows a toast and resets the local $state.
-->
<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import * as Popover from '$lib/components/ui/popover';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Calendar } from '$lib/components/ui/calendar';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Switch } from '$lib/components/ui/switch';
	import { Slider } from '$lib/components/ui/slider';
	import { PageContainer, PageHeader } from '$lib/components/shared';
	import { fieldError } from '$lib/utils/validators';
	import { cn } from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import {
		DateFormatter,
		getLocalTimeZone,
		today,
		type DateValue
	} from '@internationalized/date';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import MailIcon from '@lucide/svelte/icons/mail';
	import RocketIcon from '@lucide/svelte/icons/rocket';

	// --- Static option lists for the demo selects/groups ---
	const categories = [
		{ value: 'web', label: 'Web app' },
		{ value: 'mobile', label: 'Mobile app' },
		{ value: 'api', label: 'API service' },
		{ value: 'data', label: 'Data pipeline' }
	];

	const stackOptions = [
		{ value: 'svelte', label: 'Svelte' },
		{ value: 'react', label: 'React' },
		{ value: 'node', label: 'Node.js' },
		{ value: 'python', label: 'Python' }
	];

	const visibilityOptions = [
		{ value: 'private', label: 'Private', hint: 'Only invited members can access.' },
		{ value: 'team', label: 'Team', hint: 'Everyone in your workspace can view.' },
		{ value: 'public', label: 'Public', hint: 'Anyone with the link can view.' }
	];

	// --- Validation schema (inline — specific to this demo form) ---
	const schema = z.object({
		name: z.string().trim().min(3, 'Name must be at least 3 characters'),
		description: z.string().trim().max(280, 'Keep the description under 280 characters'),
		category: z.string().min(1, 'Select a category'),
		stack: z.array(z.string()).min(1, 'Pick at least one technology'),
		visibility: z.enum(['private', 'team', 'public']),
		dueDate: z.string().min(1, 'Choose a due date'),
		priority: z.number().min(0).max(100)
	});

	// --- Local form state ---
	let name = $state('');
	let description = $state('');
	let category = $state('');
	let stack = $state<string[]>([]);
	let visibility = $state('team');
	let dueValue = $state<DateValue | undefined>(undefined);
	let priority = $state(50);
	let notifyOnComplete = $state(true);

	let errors = $state<z.ZodError | null>(null);
	let datePopoverOpen = $state(false);

	const df = new DateFormatter('en-US', { dateStyle: 'long' });
	const minDate = today(getLocalTimeZone());

	const categoryLabel = $derived(
		categories.find((c) => c.value === category)?.label ?? 'Select a category'
	);

	function toggleStack(value: string, checked: boolean): void {
		stack = checked ? [...stack, value] : stack.filter((v) => v !== value);
	}

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		const result = schema.safeParse({
			name,
			description,
			category,
			stack,
			visibility,
			dueDate: dueValue ? dueValue.toString() : '',
			priority
		});

		if (!result.success) {
			errors = result.error;
			toast.error('Please fix the highlighted fields');
			return;
		}

		errors = null;
		toast.success('Project created', { description: `"${name}" is ready to go.` });
		reset();
	}

	function reset(): void {
		name = '';
		description = '';
		category = '';
		stack = [];
		visibility = 'team';
		dueValue = undefined;
		priority = 50;
		notifyOnComplete = true;
		errors = null;
	}
</script>

<svelte:head>
	<title>Forms · Admin Starter</title>
</svelte:head>

<PageContainer>
	<PageHeader
		title="Forms"
		description="Field patterns and validation states for building data-entry screens."
	/>

	<form onsubmit={handleSubmit} class="grid gap-6">
		<Card.Root>
			<Card.Header>
				<Card.Title>Create project</Card.Title>
				<Card.Description>
					A realistic form combining the most common field types with inline validation.
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-6">
				<!-- Name -->
				<div class="grid gap-2">
					<Label for="name">Project name</Label>
					<Input
						id="name"
						bind:value={name}
						placeholder="Aurora Dashboard"
						aria-invalid={fieldError(errors, 'name') ? 'true' : undefined}
					/>
					{#if fieldError(errors, 'name')}
						<p class="text-destructive text-xs">{fieldError(errors, 'name')}</p>
					{/if}
				</div>

				<!-- Description -->
				<div class="grid gap-2">
					<Label for="description">Description</Label>
					<Textarea
						id="description"
						bind:value={description}
						rows={3}
						placeholder="What is this project about?"
						aria-invalid={fieldError(errors, 'description') ? 'true' : undefined}
					/>
					<div class="flex items-center justify-between">
						{#if fieldError(errors, 'description')}
							<p class="text-destructive text-xs">{fieldError(errors, 'description')}</p>
						{:else}
							<span></span>
						{/if}
						<span class="text-muted-foreground text-xs">{description.length}/280</span>
					</div>
				</div>

				<div class="grid gap-6 sm:grid-cols-2">
					<!-- Category -->
					<div class="grid gap-2">
						<Label for="category">Category</Label>
						<Select.Root type="single" bind:value={category}>
							<Select.Trigger
								id="category"
								class="w-full"
								aria-invalid={fieldError(errors, 'category') ? 'true' : undefined}
							>
								{categoryLabel}
							</Select.Trigger>
							<Select.Content>
								{#each categories as c (c.value)}
									<Select.Item value={c.value} label={c.label}>{c.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						{#if fieldError(errors, 'category')}
							<p class="text-destructive text-xs">{fieldError(errors, 'category')}</p>
						{/if}
					</div>

					<!-- Due date -->
					<div class="grid gap-2">
						<Label for="due-date">Due date</Label>
						<Popover.Root bind:open={datePopoverOpen}>
							<Popover.Trigger id="due-date">
								{#snippet child({ props })}
									<Button
										{...props}
										variant="outline"
										class={cn(
											'w-full justify-start text-left font-normal',
											!dueValue && 'text-muted-foreground'
										)}
										aria-invalid={fieldError(errors, 'dueDate') ? 'true' : undefined}
									>
										<CalendarIcon class="size-4" />
										{dueValue
											? df.format(dueValue.toDate(getLocalTimeZone()))
											: 'Pick a date'}
									</Button>
								{/snippet}
							</Popover.Trigger>
							<Popover.Content class="w-auto p-0" align="start">
								<Calendar
									type="single"
									bind:value={dueValue}
									minValue={minDate}
									captionLayout="dropdown"
									onValueChange={() => (datePopoverOpen = false)}
								/>
							</Popover.Content>
						</Popover.Root>
						{#if fieldError(errors, 'dueDate')}
							<p class="text-destructive text-xs">{fieldError(errors, 'dueDate')}</p>
						{/if}
					</div>
				</div>

				<!-- Tech stack (multi-checkbox) -->
				<div class="grid gap-3">
					<Label>Technology stack</Label>
					<div class="grid gap-3 sm:grid-cols-2">
						{#each stackOptions as option (option.value)}
							<Label
								class="flex items-center gap-3 rounded-md border border-border p-3 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
							>
								<Checkbox
									checked={stack.includes(option.value)}
									onCheckedChange={(v) => toggleStack(option.value, v === true)}
								/>
								{option.label}
							</Label>
						{/each}
					</div>
					{#if fieldError(errors, 'stack')}
						<p class="text-destructive text-xs">{fieldError(errors, 'stack')}</p>
					{/if}
				</div>

				<!-- Visibility (radio group) -->
				<div class="grid gap-3">
					<Label>Visibility</Label>
					<RadioGroup.Root bind:value={visibility} class="gap-3">
						{#each visibilityOptions as option (option.value)}
							<Label
								class="flex items-start gap-3 rounded-md border border-border p-3 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
							>
								<RadioGroup.Item value={option.value} class="mt-0.5" />
								<span class="grid gap-1">
									<span class="text-sm font-medium">{option.label}</span>
									<span class="text-muted-foreground text-xs">{option.hint}</span>
								</span>
							</Label>
						{/each}
					</RadioGroup.Root>
				</div>

				<!-- Priority (slider) -->
				<div class="grid gap-3">
					<div class="flex items-center justify-between">
						<Label for="priority">Priority</Label>
						<span class="text-muted-foreground text-sm tabular-nums">{priority}%</span>
					</div>
					<Slider id="priority" type="single" bind:value={priority} min={0} max={100} step={5} />
				</div>

				<!-- Notifications (switch) -->
				<div
					class="flex items-center justify-between rounded-md border border-border p-4"
				>
					<div class="space-y-0.5">
						<Label>Notify on completion</Label>
						<p class="text-muted-foreground text-xs">
							Send a notification when this project is marked done.
						</p>
					</div>
					<Switch
						checked={notifyOnComplete}
						onCheckedChange={(v) => (notifyOnComplete = v)}
					/>
				</div>
			</Card.Content>
			<Card.Footer class="justify-end gap-2 border-t">
				<Button type="button" variant="outline" onclick={reset}>Reset</Button>
				<Button type="submit">
					<RocketIcon class="size-4" />
					Create project
				</Button>
			</Card.Footer>
		</Card.Root>

		<!-- Input states reference -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Input states</Card.Title>
				<Card.Description>The visual states an input can take.</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-5 sm:grid-cols-2">
				<div class="grid gap-2">
					<Label for="state-default">Default</Label>
					<Input id="state-default" placeholder="Type something…" />
				</div>

				<div class="grid gap-2">
					<Label for="state-disabled">Disabled</Label>
					<Input id="state-disabled" value="Read only" disabled />
				</div>

				<div class="grid gap-2">
					<Label for="state-error">Error</Label>
					<Input id="state-error" value="invalid-email" aria-invalid="true" />
					<p class="text-destructive text-xs">Enter a valid email address.</p>
				</div>

				<div class="grid gap-2">
					<Label for="state-icon">With icon</Label>
					<div class="relative">
						<MailIcon
							class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
						/>
						<Input id="state-icon" type="email" placeholder="you@example.com" class="pl-8" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</form>
</PageContainer>
