<!-- Local project-form demo with shared fields and inline validation. -->
<script lang="ts">
	import { t } from '#lib/i18n/index.ts';
	import * as Card from '#lib/core/components/ui/card/index.ts';
	import * as Select from '#lib/core/components/ui/select/index.ts';
	import * as RadioGroup from '#lib/core/components/ui/radio-group/index.ts';
	import { Button } from '#lib/core/components/ui/button/index.ts';
	import { Input } from '#lib/core/components/ui/input/index.ts';
	import { Label } from '#lib/core/components/ui/label/index.ts';
	import { Textarea } from '#lib/core/components/ui/textarea/index.ts';
	import { Checkbox } from '#lib/core/components/ui/checkbox/index.ts';
	import { Switch } from '#lib/core/components/ui/switch/index.ts';
	import { Slider } from '#lib/core/components/ui/slider/index.ts';
	import PageContainer from '#lib/core/components/shared/PageContainer.svelte';
	import PageHeader from '#lib/core/components/shared/PageHeader.svelte';
	import FormField from '#lib/core/components/shared/FormField.svelte';
	import PasswordInput from '#lib/core/components/shared/PasswordInput.svelte';
	import DatePicker from '#lib/components/shared/DatePicker.svelte';
	import {
		createProjectSchema,
		PROJECT_CATEGORIES,
		PROJECT_VISIBILITIES
	} from '#lib/features/project-form/schema.ts';
	import { fieldError } from '#lib/core/utils/validators.ts';
	import { toast } from 'svelte-sonner';
	import type { z } from 'zod';
	import { getLocalTimeZone, today } from '@internationalized/date';
	import MailIcon from '@lucide/svelte/icons/mail';
	import RocketIcon from '@lucide/svelte/icons/rocket';

	const categories = $derived(
		PROJECT_CATEGORIES.map((value) => ({ value, label: t(`projectForm.categories.${value}`) }))
	);
	const stackOptions = [
		{ value: 'svelte', label: 'Svelte' },
		{ value: 'react', label: 'React' },
		{ value: 'node', label: 'Node.js' },
		{ value: 'python', label: 'Python' }
	];
	const visibilityOptions = $derived(
		PROJECT_VISIBILITIES.map((value) => ({
			value,
			label: t(`projectForm.visibilityOptions.${value}`),
			hint: t(`projectForm.visibilityOptions.${value}Hint`)
		}))
	);

	let name = $state('');
	let description = $state('');
	let category = $state('');
	let stack = $state<string[]>([]);
	let visibility = $state('team');
	let dueDate = $state('');
	let priority = $state(50);
	let notifyOnComplete = $state(true);
	let demoPassword = $state('Secret123!');
	let errors = $state<z.ZodError | null>(null);

	const minDate = today(getLocalTimeZone());
	const categoryLabel = $derived(
		categories.find((option) => option.value === category)?.label ?? t('projectForm.selectCategory')
	);
	const stackError = $derived(fieldError(errors, 'stack'));
	const visibilityError = $derived(fieldError(errors, 'visibility'));
	const instanceId = $props.id();

	function toggleStack(value: string, checked: boolean): void {
		stack = checked ? [...stack, value] : stack.filter((item) => item !== value);
	}

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		const result = createProjectSchema(t, minDate).safeParse({
			name,
			description,
			category,
			stack,
			visibility,
			dueDate,
			priority
		});
		if (!result.success) {
			errors = result.error;
			toast.error(t('projectForm.fixErrors'));
			return;
		}
		toast.success(t('projectForm.created'), {
			description: t('projectForm.createdDescription', { name: result.data.name })
		});
		reset();
	}

	function reset(): void {
		name = '';
		description = '';
		category = '';
		stack = [];
		visibility = 'team';
		dueDate = '';
		priority = 50;
		notifyOnComplete = true;
		errors = null;
	}
</script>

<PageContainer>
	<PageHeader title={t('projectForm.title')} description={t('projectForm.description')} />

	<form onsubmit={handleSubmit} class="grid gap-6" novalidate>
		<Card.Root>
			<Card.Header>
				<Card.Title>{t('projectForm.createProject')}</Card.Title>
				<Card.Description>{t('projectForm.createDescription')}</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-6">
				<FormField label={t('projectForm.name')} error={fieldError(errors, 'name')}>
					{#snippet children(control)}
						<Input {...control} bind:value={name} placeholder={t('projectForm.namePlaceholder')} />
					{/snippet}
				</FormField>

				<FormField
					label={t('projectForm.projectDescription')}
					error={fieldError(errors, 'description')}
					description={t('projectForm.characterCount', { count: description.length })}
				>
					{#snippet children(control)}
						<Textarea
							{...control}
							bind:value={description}
							rows={3}
							placeholder={t('projectForm.descriptionPlaceholder')}
						/>
					{/snippet}
				</FormField>

				<div class="grid gap-6 sm:grid-cols-2">
					<FormField label={t('projectForm.category')} error={fieldError(errors, 'category')}>
						{#snippet children(control)}
							<Select.Root type="single" bind:value={category}>
								<Select.Trigger {...control} class="w-full">{categoryLabel}</Select.Trigger>
								<Select.Content>
									{#each categories as option (option.value)}
										<Select.Item value={option.value} label={option.label}
											>{option.label}</Select.Item
										>
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</FormField>

					<FormField label={t('projectForm.dueDate')} error={fieldError(errors, 'dueDate')}>
						{#snippet children(control)}
							<DatePicker
								{...control}
								bind:value={dueDate}
								name="dueDate"
								minValue={minDate}
								commitOnSelect
								required
							/>
						{/snippet}
					</FormField>
				</div>

				<fieldset
					class="grid gap-3"
					aria-describedby={stackError ? `${instanceId}-stack-error` : undefined}
				>
					<legend class="mb-3 text-sm font-medium">{t('projectForm.stack')}</legend>
					<div class="grid gap-3 sm:grid-cols-2">
						{#each stackOptions as option (option.value)}
							<Label
								for={`${instanceId}-stack-${option.value}`}
								class="flex items-center gap-3 rounded-md border border-border p-3 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
							>
								<Checkbox
									id={`${instanceId}-stack-${option.value}`}
									checked={stack.includes(option.value)}
									onCheckedChange={(value) => toggleStack(option.value, value === true)}
									aria-invalid={stackError ? true : undefined}
									aria-describedby={stackError ? `${instanceId}-stack-error` : undefined}
								/>
								{option.label}
							</Label>
						{/each}
					</div>
					{#if stackError}
						<p id={`${instanceId}-stack-error`} role="alert" class="text-xs text-destructive">
							{stackError}
						</p>
					{/if}
				</fieldset>

				<fieldset class="grid gap-3">
					<legend id={`${instanceId}-visibility-label`} class="mb-3 text-sm font-medium">
						{t('projectForm.visibility')}
					</legend>
					<RadioGroup.Root
						bind:value={visibility}
						class="gap-3"
						aria-labelledby={`${instanceId}-visibility-label`}
						aria-invalid={visibilityError ? true : undefined}
						aria-describedby={visibilityError ? `${instanceId}-visibility-error` : undefined}
					>
						{#each visibilityOptions as option (option.value)}
							<Label
								for={`${instanceId}-visibility-${option.value}`}
								class="flex items-start gap-3 rounded-md border border-border p-3 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
							>
								<RadioGroup.Item
									id={`${instanceId}-visibility-${option.value}`}
									value={option.value}
									class="mt-0.5"
								/>
								<span class="grid gap-1">
									<span class="text-sm font-medium">{option.label}</span>
									<span class="text-xs text-muted-foreground">{option.hint}</span>
								</span>
							</Label>
						{/each}
					</RadioGroup.Root>
					{#if visibilityError}
						<p id={`${instanceId}-visibility-error`} role="alert" class="text-xs text-destructive">
							{visibilityError}
						</p>
					{/if}
				</fieldset>

				<div class="grid gap-3">
					<div class="flex items-center justify-between">
						<Label for={`${instanceId}-priority`}>{t('projectForm.priority')}</Label>
						<span class="text-sm text-muted-foreground tabular-nums">{priority}%</span>
					</div>
					<Slider
						id={`${instanceId}-priority`}
						type="single"
						bind:value={priority}
						min={0}
						max={100}
						step={5}
					/>
				</div>

				<div class="flex items-center justify-between rounded-md border border-border p-4">
					<div class="space-y-0.5">
						<Label for={`${instanceId}-notify`}>{t('projectForm.notify')}</Label>
						<p id={`${instanceId}-notify-description`} class="text-xs text-muted-foreground">
							{t('projectForm.notifyDescription')}
						</p>
					</div>
					<Switch
						id={`${instanceId}-notify`}
						checked={notifyOnComplete}
						onCheckedChange={(value) => (notifyOnComplete = value)}
						aria-describedby={`${instanceId}-notify-description`}
					/>
				</div>
			</Card.Content>
			<Card.Footer class="justify-end gap-2 border-t">
				<Button type="button" variant="outline" onclick={reset}>{t('projectForm.reset')}</Button>
				<Button type="submit">
					<RocketIcon class="size-4" aria-hidden="true" />
					{t('projectForm.createProject')}
				</Button>
			</Card.Footer>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>{t('projectForm.inputStates')}</Card.Title>
				<Card.Description>{t('projectForm.inputStatesDescription')}</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				<FormField label={t('projectForm.defaultState')}>
					{#snippet children(control)}
						<Input {...control} placeholder={t('projectForm.defaultPlaceholder')} />
					{/snippet}
				</FormField>
				<FormField label={t('projectForm.disabledState')}>
					{#snippet children(control)}
						<Input {...control} value={t('projectForm.disabledValue')} disabled />
					{/snippet}
				</FormField>
				<FormField label={t('projectForm.errorState')} error={t('projectForm.invalidEmail')}>
					{#snippet children(control)}
						<Input {...control} value="invalid-email" />
					{/snippet}
				</FormField>
				<FormField label={t('projectForm.iconState')}>
					{#snippet children(control)}
						<div class="relative">
							<MailIcon
								class="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
								aria-hidden="true"
							/>
							<Input {...control} type="email" placeholder="you@example.com" class="ps-8" />
						</div>
					{/snippet}
				</FormField>
				<FormField label={t('projectForm.passwordState')}>
					{#snippet children(control)}
						<PasswordInput
							{...control}
							showLabel={t('auth.showPassword')}
							hideLabel={t('auth.hidePassword')}
							bind:value={demoPassword}
							placeholder={t('projectForm.passwordPlaceholder')}
						/>
					{/snippet}
				</FormField>
			</Card.Content>
		</Card.Root>
	</form>
</PageContainer>
