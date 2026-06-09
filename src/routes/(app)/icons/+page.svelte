<!--
  Icons showcase — a searchable grid of the Lucide icons bundled via
  `@lucide/svelte`. Click any tile to copy a ready-to-paste import statement.
  Static demo state; nothing talks to a backend. The set below is a curated
  sample of the ~1,600 icons the package ships — import any other by name from
  `@lucide/svelte/icons/<name>`.
-->
<script lang="ts">
	import type { Component } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { PageContainer, PageHeader, SearchInput, EmptyState } from '$lib/components/shared';
	import SearchXIcon from '@lucide/svelte/icons/search-x';
	import HouseIcon from '@lucide/svelte/icons/house';
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import UsersIcon from '@lucide/svelte/icons/users';
	import UserIcon from '@lucide/svelte/icons/user';
	import UserPlusIcon from '@lucide/svelte/icons/user-plus';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import SearchIcon from '@lucide/svelte/icons/search';
	import BellIcon from '@lucide/svelte/icons/bell';
	import BellOffIcon from '@lucide/svelte/icons/bell-off';
	import MailIcon from '@lucide/svelte/icons/mail';
	import MailOpenIcon from '@lucide/svelte/icons/mail-open';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import CalendarDaysIcon from '@lucide/svelte/icons/calendar-days';
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import FileIcon from '@lucide/svelte/icons/file';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import FolderIcon from '@lucide/svelte/icons/folder';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import ImageIcon from '@lucide/svelte/icons/image';
	import CameraIcon from '@lucide/svelte/icons/camera';
	import VideoIcon from '@lucide/svelte/icons/video';
	import MusicIcon from '@lucide/svelte/icons/music';
	import HeadphonesIcon from '@lucide/svelte/icons/headphones';
	import PhoneIcon from '@lucide/svelte/icons/phone';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import SendIcon from '@lucide/svelte/icons/send';
	import Share2Icon from '@lucide/svelte/icons/share-2';
	import LinkIcon from '@lucide/svelte/icons/link';
	import PaperclipIcon from '@lucide/svelte/icons/paperclip';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import CloudIcon from '@lucide/svelte/icons/cloud';
	import CloudUploadIcon from '@lucide/svelte/icons/cloud-upload';
	import SaveIcon from '@lucide/svelte/icons/save';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PenIcon from '@lucide/svelte/icons/pen';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import ClipboardIcon from '@lucide/svelte/icons/clipboard';
	import CheckIcon from '@lucide/svelte/icons/check';
	import CheckCheckIcon from '@lucide/svelte/icons/check-check';
	import XIcon from '@lucide/svelte/icons/x';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import StarIcon from '@lucide/svelte/icons/star';
	import HeartIcon from '@lucide/svelte/icons/heart';
	import BookmarkIcon from '@lucide/svelte/icons/bookmark';
	import FlagIcon from '@lucide/svelte/icons/flag';
	import TagIcon from '@lucide/svelte/icons/tag';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';
	import LockIcon from '@lucide/svelte/icons/lock';
	import LockOpenIcon from '@lucide/svelte/icons/lock-open';
	import KeyIcon from '@lucide/svelte/icons/key';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import CloudRainIcon from '@lucide/svelte/icons/cloud-rain';
	import ZapIcon from '@lucide/svelte/icons/zap';
	import FlameIcon from '@lucide/svelte/icons/flame';
	import DropletIcon from '@lucide/svelte/icons/droplet';
	import WifiIcon from '@lucide/svelte/icons/wifi';
	import BluetoothIcon from '@lucide/svelte/icons/bluetooth';
	import BatteryIcon from '@lucide/svelte/icons/battery';
	import PowerIcon from '@lucide/svelte/icons/power';
	import PlugIcon from '@lucide/svelte/icons/plug';
	import MapIcon from '@lucide/svelte/icons/map';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import NavigationIcon from '@lucide/svelte/icons/navigation';
	import CompassIcon from '@lucide/svelte/icons/compass';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import CarIcon from '@lucide/svelte/icons/car';
	import PlaneIcon from '@lucide/svelte/icons/plane';
	import TruckIcon from '@lucide/svelte/icons/truck';
	import BikeIcon from '@lucide/svelte/icons/bike';
	import ShoppingCartIcon from '@lucide/svelte/icons/shopping-cart';
	import ShoppingBagIcon from '@lucide/svelte/icons/shopping-bag';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import WalletIcon from '@lucide/svelte/icons/wallet';
	import DollarSignIcon from '@lucide/svelte/icons/dollar-sign';
	import GiftIcon from '@lucide/svelte/icons/gift';
	import PackageIcon from '@lucide/svelte/icons/package';
	import BoxIcon from '@lucide/svelte/icons/box';
	import ArchiveIcon from '@lucide/svelte/icons/archive';
	import BriefcaseIcon from '@lucide/svelte/icons/briefcase';
	import BuildingIcon from '@lucide/svelte/icons/building';
	import StoreIcon from '@lucide/svelte/icons/store';
	import ChartLineIcon from '@lucide/svelte/icons/chart-line';
	import ChartBarIcon from '@lucide/svelte/icons/chart-bar';
	import ChartPieIcon from '@lucide/svelte/icons/chart-pie';
	import ActivityIcon from '@lucide/svelte/icons/activity';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import TrendingDownIcon from '@lucide/svelte/icons/trending-down';
	import FunnelIcon from '@lucide/svelte/icons/funnel';
	import ListFilterIcon from '@lucide/svelte/icons/list-filter';
	import ListIcon from '@lucide/svelte/icons/list';
	import LayoutGridIcon from '@lucide/svelte/icons/layout-grid';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import RotateCwIcon from '@lucide/svelte/icons/rotate-cw';
	import LoaderIcon from '@lucide/svelte/icons/loader';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import CircleXIcon from '@lucide/svelte/icons/circle-x';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import InfoIcon from '@lucide/svelte/icons/info';
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert';
	import BanIcon from '@lucide/svelte/icons/ban';
	import ThumbsUpIcon from '@lucide/svelte/icons/thumbs-up';
	import ThumbsDownIcon from '@lucide/svelte/icons/thumbs-down';
	import SmileIcon from '@lucide/svelte/icons/smile';
	import FrownIcon from '@lucide/svelte/icons/frown';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import TimerIcon from '@lucide/svelte/icons/timer';
	import HourglassIcon from '@lucide/svelte/icons/hourglass';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import WandSparklesIcon from '@lucide/svelte/icons/wand-sparkles';
	import PaletteIcon from '@lucide/svelte/icons/palette';
	import BrushIcon from '@lucide/svelte/icons/brush';
	import TypeIcon from '@lucide/svelte/icons/type';
	import BoldIcon from '@lucide/svelte/icons/bold';
	import ItalicIcon from '@lucide/svelte/icons/italic';
	import CodeIcon from '@lucide/svelte/icons/code';
	import TerminalIcon from '@lucide/svelte/icons/terminal';
	import GitBranchIcon from '@lucide/svelte/icons/git-branch';
	import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal';
	import DatabaseIcon from '@lucide/svelte/icons/database';
	import ServerIcon from '@lucide/svelte/icons/server';
	import CpuIcon from '@lucide/svelte/icons/cpu';
	import HardDriveIcon from '@lucide/svelte/icons/hard-drive';
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import SmartphoneIcon from '@lucide/svelte/icons/smartphone';
	import TabletIcon from '@lucide/svelte/icons/tablet';
	import LaptopIcon from '@lucide/svelte/icons/laptop';
	import PrinterIcon from '@lucide/svelte/icons/printer';
	import MouseIcon from '@lucide/svelte/icons/mouse';
	import KeyboardIcon from '@lucide/svelte/icons/keyboard';

	type IconEntry = { name: string; Icon: Component };

	// Curated sample. Each `name` is the kebab id used in the import path.
	const icons: IconEntry[] = [
		{ name: 'house', Icon: HouseIcon },
		{ name: 'layout-dashboard', Icon: LayoutDashboardIcon },
		{ name: 'users', Icon: UsersIcon },
		{ name: 'user', Icon: UserIcon },
		{ name: 'user-plus', Icon: UserPlusIcon },
		{ name: 'settings', Icon: SettingsIcon },
		{ name: 'search', Icon: SearchIcon },
		{ name: 'bell', Icon: BellIcon },
		{ name: 'bell-off', Icon: BellOffIcon },
		{ name: 'mail', Icon: MailIcon },
		{ name: 'mail-open', Icon: MailOpenIcon },
		{ name: 'calendar', Icon: CalendarIcon },
		{ name: 'calendar-days', Icon: CalendarDaysIcon },
		{ name: 'inbox', Icon: InboxIcon },
		{ name: 'file', Icon: FileIcon },
		{ name: 'file-text', Icon: FileTextIcon },
		{ name: 'folder', Icon: FolderIcon },
		{ name: 'folder-open', Icon: FolderOpenIcon },
		{ name: 'image', Icon: ImageIcon },
		{ name: 'camera', Icon: CameraIcon },
		{ name: 'video', Icon: VideoIcon },
		{ name: 'music', Icon: MusicIcon },
		{ name: 'headphones', Icon: HeadphonesIcon },
		{ name: 'phone', Icon: PhoneIcon },
		{ name: 'message-square', Icon: MessageSquareIcon },
		{ name: 'message-circle', Icon: MessageCircleIcon },
		{ name: 'send', Icon: SendIcon },
		{ name: 'share-2', Icon: Share2Icon },
		{ name: 'link', Icon: LinkIcon },
		{ name: 'paperclip', Icon: PaperclipIcon },
		{ name: 'download', Icon: DownloadIcon },
		{ name: 'upload', Icon: UploadIcon },
		{ name: 'cloud', Icon: CloudIcon },
		{ name: 'cloud-upload', Icon: CloudUploadIcon },
		{ name: 'save', Icon: SaveIcon },
		{ name: 'trash-2', Icon: Trash2Icon },
		{ name: 'pencil', Icon: PencilIcon },
		{ name: 'pen', Icon: PenIcon },
		{ name: 'copy', Icon: CopyIcon },
		{ name: 'clipboard', Icon: ClipboardIcon },
		{ name: 'check', Icon: CheckIcon },
		{ name: 'check-check', Icon: CheckCheckIcon },
		{ name: 'x', Icon: XIcon },
		{ name: 'plus', Icon: PlusIcon },
		{ name: 'minus', Icon: MinusIcon },
		{ name: 'star', Icon: StarIcon },
		{ name: 'heart', Icon: HeartIcon },
		{ name: 'bookmark', Icon: BookmarkIcon },
		{ name: 'flag', Icon: FlagIcon },
		{ name: 'tag', Icon: TagIcon },
		{ name: 'eye', Icon: EyeIcon },
		{ name: 'eye-off', Icon: EyeOffIcon },
		{ name: 'lock', Icon: LockIcon },
		{ name: 'lock-open', Icon: LockOpenIcon },
		{ name: 'key', Icon: KeyIcon },
		{ name: 'shield', Icon: ShieldIcon },
		{ name: 'shield-check', Icon: ShieldCheckIcon },
		{ name: 'sun', Icon: SunIcon },
		{ name: 'moon', Icon: MoonIcon },
		{ name: 'cloud-rain', Icon: CloudRainIcon },
		{ name: 'zap', Icon: ZapIcon },
		{ name: 'flame', Icon: FlameIcon },
		{ name: 'droplet', Icon: DropletIcon },
		{ name: 'wifi', Icon: WifiIcon },
		{ name: 'bluetooth', Icon: BluetoothIcon },
		{ name: 'battery', Icon: BatteryIcon },
		{ name: 'power', Icon: PowerIcon },
		{ name: 'plug', Icon: PlugIcon },
		{ name: 'map', Icon: MapIcon },
		{ name: 'map-pin', Icon: MapPinIcon },
		{ name: 'navigation', Icon: NavigationIcon },
		{ name: 'compass', Icon: CompassIcon },
		{ name: 'globe', Icon: GlobeIcon },
		{ name: 'car', Icon: CarIcon },
		{ name: 'plane', Icon: PlaneIcon },
		{ name: 'truck', Icon: TruckIcon },
		{ name: 'bike', Icon: BikeIcon },
		{ name: 'shopping-cart', Icon: ShoppingCartIcon },
		{ name: 'shopping-bag', Icon: ShoppingBagIcon },
		{ name: 'credit-card', Icon: CreditCardIcon },
		{ name: 'wallet', Icon: WalletIcon },
		{ name: 'dollar-sign', Icon: DollarSignIcon },
		{ name: 'gift', Icon: GiftIcon },
		{ name: 'package', Icon: PackageIcon },
		{ name: 'box', Icon: BoxIcon },
		{ name: 'archive', Icon: ArchiveIcon },
		{ name: 'briefcase', Icon: BriefcaseIcon },
		{ name: 'building', Icon: BuildingIcon },
		{ name: 'store', Icon: StoreIcon },
		{ name: 'chart-line', Icon: ChartLineIcon },
		{ name: 'chart-bar', Icon: ChartBarIcon },
		{ name: 'chart-pie', Icon: ChartPieIcon },
		{ name: 'activity', Icon: ActivityIcon },
		{ name: 'trending-up', Icon: TrendingUpIcon },
		{ name: 'trending-down', Icon: TrendingDownIcon },
		{ name: 'funnel', Icon: FunnelIcon },
		{ name: 'list-filter', Icon: ListFilterIcon },
		{ name: 'list', Icon: ListIcon },
		{ name: 'layout-grid', Icon: LayoutGridIcon },
		{ name: 'menu', Icon: MenuIcon },
		{ name: 'ellipsis', Icon: EllipsisIcon },
		{ name: 'ellipsis-vertical', Icon: EllipsisVerticalIcon },
		{ name: 'chevron-down', Icon: ChevronDownIcon },
		{ name: 'chevron-up', Icon: ChevronUpIcon },
		{ name: 'chevron-left', Icon: ChevronLeftIcon },
		{ name: 'chevron-right', Icon: ChevronRightIcon },
		{ name: 'arrow-up', Icon: ArrowUpIcon },
		{ name: 'arrow-down', Icon: ArrowDownIcon },
		{ name: 'arrow-left', Icon: ArrowLeftIcon },
		{ name: 'arrow-right', Icon: ArrowRightIcon },
		{ name: 'arrow-up-right', Icon: ArrowUpRightIcon },
		{ name: 'refresh-cw', Icon: RefreshCwIcon },
		{ name: 'rotate-cw', Icon: RotateCwIcon },
		{ name: 'loader', Icon: LoaderIcon },
		{ name: 'circle-check', Icon: CircleCheckIcon },
		{ name: 'circle-x', Icon: CircleXIcon },
		{ name: 'circle-alert', Icon: CircleAlertIcon },
		{ name: 'info', Icon: InfoIcon },
		{ name: 'triangle-alert', Icon: TriangleAlertIcon },
		{ name: 'ban', Icon: BanIcon },
		{ name: 'thumbs-up', Icon: ThumbsUpIcon },
		{ name: 'thumbs-down', Icon: ThumbsDownIcon },
		{ name: 'smile', Icon: SmileIcon },
		{ name: 'frown', Icon: FrownIcon },
		{ name: 'clock', Icon: ClockIcon },
		{ name: 'timer', Icon: TimerIcon },
		{ name: 'hourglass', Icon: HourglassIcon },
		{ name: 'sparkles', Icon: SparklesIcon },
		{ name: 'wand-sparkles', Icon: WandSparklesIcon },
		{ name: 'palette', Icon: PaletteIcon },
		{ name: 'brush', Icon: BrushIcon },
		{ name: 'type', Icon: TypeIcon },
		{ name: 'bold', Icon: BoldIcon },
		{ name: 'italic', Icon: ItalicIcon },
		{ name: 'code', Icon: CodeIcon },
		{ name: 'terminal', Icon: TerminalIcon },
		{ name: 'git-branch', Icon: GitBranchIcon },
		{ name: 'sliders-horizontal', Icon: SlidersHorizontalIcon },
		{ name: 'database', Icon: DatabaseIcon },
		{ name: 'server', Icon: ServerIcon },
		{ name: 'cpu', Icon: CpuIcon },
		{ name: 'hard-drive', Icon: HardDriveIcon },
		{ name: 'monitor', Icon: MonitorIcon },
		{ name: 'smartphone', Icon: SmartphoneIcon },
		{ name: 'tablet', Icon: TabletIcon },
		{ name: 'laptop', Icon: LaptopIcon },
		{ name: 'printer', Icon: PrinterIcon },
		{ name: 'mouse', Icon: MouseIcon },
		{ name: 'keyboard', Icon: KeyboardIcon }
	];

	let query = $state('');

	const filtered = $derived(
		query.trim() ? icons.filter((i) => i.name.includes(query.trim().toLowerCase())) : icons
	);

	/** kebab id -> the conventional PascalCase + `Icon` binding name. */
	function bindingName(name: string): string {
		return (
			name
				.split('-')
				.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
				.join('') + 'Icon'
		);
	}

	async function copyImport(name: string) {
		const statement = `import ${bindingName(name)} from '@lucide/svelte/icons/${name}';`;
		try {
			await navigator.clipboard.writeText(statement);
			toast.success('Import copied', { description: statement });
		} catch {
			toast.error('Could not copy to clipboard');
		}
	}
</script>

<svelte:head>
	<title>Icons · Admin Starter</title>
</svelte:head>

<PageContainer>
	<PageHeader
		title="Icons"
		description="A searchable sample of the Lucide icon set. Click any icon to copy its import."
	/>

	<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
		<SearchInput bind:value={query} placeholder="Search icons…" class="sm:max-w-xs" />
		<p class="text-muted-foreground text-sm tabular-nums">
			{filtered.length} of {icons.length}
		</p>
	</div>

	{#if filtered.length === 0}
		<EmptyState
			icon={SearchXIcon}
			title="No icons found"
			description="No icon name matches your search. Try a different keyword."
		/>
	{:else}
		<div class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
			{#each filtered as icon (icon.name)}
				{@const Icon = icon.Icon}
				<button
					type="button"
					onclick={() => copyImport(icon.name)}
					title={`Copy import for "${icon.name}"`}
					class="group bg-card border-border hover:border-primary/40 hover:bg-accent focus-visible:ring-ring flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
				>
					<Icon class="text-foreground size-6" aria-hidden="true" />
					<span
						class="text-muted-foreground group-hover:text-foreground w-full truncate text-center text-xs"
					>
						{icon.name}
					</span>
				</button>
			{/each}
		</div>
	{/if}
</PageContainer>
